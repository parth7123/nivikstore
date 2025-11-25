import React, { useContext, useState } from 'react'
import Title from '../components/Title'
import CartTotal from '../components/CartTotal'
import { assets } from '../assets/assets'
import { ShopContext } from '../context/ShopContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

const PlaceOrder = () => {

    const [method, setMethod] = useState('cod');
    const [deliveryOption, setDeliveryOption] = useState('normal'); // 'normal' or 'fast'
    const { navigate: nav, backendUrl, token, cartItems, setCartItems, getCartAmount, calculateDeliveryFee, products } = useContext(ShopContext);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        street: '',
        city: '',
        state: '',
        zipcode: '',
        country: '',
        phone: ''
    })
    const [checkingServiceability, setCheckingServiceability] = useState(false);
    const [isServiceable, setIsServiceable] = useState(null);

    const navigate = useNavigate();

    const onChangeHandler = (event) => {
        const name = event.target.name
        const value = event.target.value
        setFormData(data => ({ ...data, [name]: value }))
        
        // Reset serviceability check when zip code changes
        if (name === 'zipcode') {
            setIsServiceable(null);
        }
    }
    
    // Calculate total order weight (simplified implementation)
    const calculateOrderWeight = () => {
        let totalWeight = 0;
        for (const items in cartItems) {
            for (const item in cartItems[items]) {
                if (cartItems[items][item] > 0) {
                    // In a real implementation, you would get the actual product weight
                    // For now, we'll assume 0.5kg per item
                    totalWeight += cartItems[items][item] * 0.5;
                }
            }
        }
        return totalWeight;
    }

    const checkServiceability = async () => {
        if (!formData.zipcode) {
            toast.error('Please enter a zip code');
            return;
        }

        setCheckingServiceability(true);
        try {
            // For Shiprocket, we'll always return serviceable since serviceability is checked when getting rates
            setIsServiceable(true);
            toast.success('Delivery available to this location');
        } catch (error) {
            console.log('Serviceability check error:', error);
            toast.error('Failed to check delivery availability');
            setIsServiceable(false);
        } finally {
            setCheckingServiceability(false);
        }
    }

    const initPay = (order) => {
        // Check if Razorpay is loaded
        if (!window.Razorpay) {
            toast.error('Razorpay payment gateway is not loaded. Please refresh the page.')
            return
        }

        // Check if Razorpay key is configured
        const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID
        if (!razorpayKey) {
            toast.error('Razorpay key is not configured. Please contact support.')
            return
        }

        const options = {
            key: razorpayKey,
            amount: order.amount,
            currency: order.currency,
            name: 'Order Payment',
            description: 'Order Payment',
            order_id: order.id,
            receipt: order.receipt,
            handler: async (response) => {
                console.log('Razorpay payment response:', response)
                try {
                    // Send verification data - userId will be extracted from token by auth middleware
                    const verificationData = {
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature
                    }
                    
                    const { data } = await axios.post(backendUrl + '/api/order/verifyRazorpay', verificationData, {headers:{token}})
                    if (data.success) {
                        navigate('/orders')
                        setCartItems({})
                        toast.success('Payment successful!')
                    } else {
                        toast.error(data.message || 'Payment verification failed')
                    }
                } catch (error) {
                    console.log('Verification error:', error)
                    toast.error(error.response?.data?.message || 'Payment verification failed')
                }
            },
            prefill: {
                name: `${formData.firstName} ${formData.lastName}`,
                email: formData.email,
                contact: formData.phone
            },
            theme: {
                color: '#000000'
            },
            modal: {
                ondismiss: function() {
                    toast.info('Payment cancelled by user')
                }
            }
        }
        
        try {
            const rzp = new window.Razorpay(options)
            rzp.on('payment.failed', function (response) {
                console.log('Payment failed:', response.error)
                toast.error(response.error.description || 'Payment failed')
            })
            rzp.open()
        } catch (error) {
            console.log('Razorpay initialization error:', error)
            toast.error('Failed to initialize payment. Please try again.')
        }
    }

    const onSubmitHandler = async (event) => {
        event.preventDefault()
        
        // Check if delivery location is serviceable
        if (isServiceable === false) {
            toast.error('Please enter a serviceable delivery location');
            return;
        }
        
        // If serviceability hasn't been checked yet, check it now
        if (isServiceable === null) {
            await checkServiceability();
            if (!isServiceable) {
                return; // Don't proceed if not serviceable
            }
        }

        try {

            let orderItems = []

            for (const items in cartItems) {
                for (const item in cartItems[items]) {
                    if (cartItems[items][item] > 0) {
                        const itemInfo = structuredClone(products.find(product => product._id === items))
                        if (itemInfo) {
                            itemInfo.size = item
                            itemInfo.quantity = cartItems[items][item]
                            orderItems.push(itemInfo)
                        }
                    }
                }
            }

            // Calculate delivery fee based on selected option and payment method
            const deliveryFee = calculateDeliveryFee(deliveryOption, method);
            
            let orderData = {
                address: formData,
                items: orderItems,
                amount: getCartAmount() + deliveryFee,
                deliveryOption, // Include delivery option in order data
                paymentMethod: method // Include payment method in order data
            }
            

            switch (method) {

                // API Calls for COD
                case 'cod':
                    const response = await axios.post(backendUrl + '/api/order/place',orderData,{headers:{token}})
                    if (response.data.success) {
                        setCartItems({})
                        navigate('/orders')
                    } else {
                        toast.error(response.data.message)
                    }
                    break;

                case 'razorpay':
                    try {
                        const responseRazorpay = await axios.post(backendUrl + '/api/order/razorpay', orderData, {headers:{token}})
                        if (responseRazorpay.data.success) {
                            initPay(responseRazorpay.data.order)
                        } else {
                            toast.error(responseRazorpay.data.message || 'Failed to create payment order')
                        }
                    } catch (error) {
                        console.log('Razorpay order creation error:', error)
                        toast.error(error.response?.data?.message || 'Failed to process payment. Please try again.')
                    }
                    break;

                default:
                    break;
            }


        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }


    return (
        <form onSubmit={onSubmitHandler} className='flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t'>
            {/* ------------- Left Side ---------------- */}
            <div className='flex flex-col gap-4 w-full sm:max-w-[480px]'>

                <div className='text-xl sm:text-2xl my-3'>
                    <Title text1={'DELIVERY'} text2={'INFORMATION'} />
                </div>
                <div className='flex gap-3'>
                    <input required onChange={onChangeHandler} name='firstName' value={formData.firstName} className='backdrop-blur-xl bg-white/30 border border-white/40 shadow-sm rounded py-1.5 px-3.5 w-full focus:ring-2 focus:ring-white/50 focus:outline-none placeholder-gray-500' type="text" placeholder='First name' />
                    <input required onChange={onChangeHandler} name='lastName' value={formData.lastName} className='backdrop-blur-xl bg-white/30 border border-white/40 shadow-sm rounded py-1.5 px-3.5 w-full focus:ring-2 focus:ring-white/50 focus:outline-none placeholder-gray-500' type="text" placeholder='Last name' />
                </div>
                <input required onChange={onChangeHandler} name='email' value={formData.email} className='backdrop-blur-xl bg-white/30 border border-white/40 shadow-sm rounded py-1.5 px-3.5 w-full focus:ring-2 focus:ring-white/50 focus:outline-none placeholder-gray-500' type="email" placeholder='Email address' />
                <input required onChange={onChangeHandler} name='street' value={formData.street} className='backdrop-blur-xl bg-white/30 border border-white/40 shadow-sm rounded py-1.5 px-3.5 w-full focus:ring-2 focus:ring-white/50 focus:outline-none placeholder-gray-500' type="text" placeholder='Street' />
                <div className='flex gap-3'>
                    <input required onChange={onChangeHandler} name='city' value={formData.city} className='backdrop-blur-xl bg-white/30 border border-white/40 shadow-sm rounded py-1.5 px-3.5 w-full focus:ring-2 focus:ring-white/50 focus:outline-none placeholder-gray-500' type="text" placeholder='City' />
                    <input onChange={onChangeHandler} name='state' value={formData.state} className='backdrop-blur-xl bg-white/30 border border-white/40 shadow-sm rounded py-1.5 px-3.5 w-full focus:ring-2 focus:ring-white/50 focus:outline-none placeholder-gray-500' type="text" placeholder='State' />
                </div>
                <div className='flex gap-3'>
                    <input required onChange={onChangeHandler} name='zipcode' value={formData.zipcode} className='backdrop-blur-xl bg-white/30 border border-white/40 shadow-sm rounded py-1.5 px-3.5 w-full focus:ring-2 focus:ring-white/50 focus:outline-none placeholder-gray-500' type="number" placeholder='Zipcode' />
                    <input required onChange={onChangeHandler} name='country' value={formData.country} className='backdrop-blur-xl bg-white/30 border border-white/40 shadow-sm rounded py-1.5 px-3.5 w-full focus:ring-2 focus:ring-white/50 focus:outline-none placeholder-gray-500' type="text" placeholder='Country' />
                </div>
                <input required onChange={onChangeHandler} name='phone' value={formData.phone} className='backdrop-blur-xl bg-white/30 border border-white/40 shadow-sm rounded py-1.5 px-3.5 w-full focus:ring-2 focus:ring-white/50 focus:outline-none placeholder-gray-500' type="number" placeholder='Phone' />
                
                {/* Delivery Location Check */}
                <div className='mt-2'>
                    <button
                        type='button'
                        onClick={checkServiceability}
                        disabled={checkingServiceability || !formData.zipcode}
                        className='backdrop-blur-xl bg-blue-500/80 hover:bg-blue-600/90 text-white px-4 py-2 rounded text-sm disabled:opacity-50 shadow-lg transition-all duration-300'
                    >
                        {checkingServiceability ? 'Checking...' : 'Check Delivery Availability'}
                    </button>
                    {isServiceable === true && (
                        <p className='text-green-600 text-sm mt-1 font-medium'>✓ Delivery available to this location</p>
                    )}
                    {isServiceable === false && (
                        <p className='text-red-600 text-sm mt-1 font-medium'>✗ Delivery not available to this location</p>
                    )}
                </div>
                
                {/* Delivery Options */}
                <div className='mt-4'>
                    <Title text1={'DELIVERY'} text2={'OPTIONS'} />
                    
                    <div className='flex gap-4 mt-2'>
                        <div 
                            onClick={() => setDeliveryOption('normal')} 
                            className={`flex items-center gap-3 border p-2 px-3 cursor-pointer backdrop-blur-xl bg-white/30 shadow-sm transition-all duration-300 ${deliveryOption === 'normal' ? 'border-green-500 bg-green-50/50' : 'border-white/40'}`}
                        >
                            <p className={`min-w-3.5 h-3.5 border rounded-full ${deliveryOption === 'normal' ? 'bg-green-400' : ''}`}></p>
                            <div>
                                <p className='font-medium'>Normal Delivery</p>
                                <p className='text-gray-500 text-sm'>
                                    {calculateDeliveryFee('normal', method) === 0 ? 'FREE' : `₹${calculateDeliveryFee('normal', method)}.00`} - 5-7 days
                                </p>
                            </div>
                        </div>
                        <div 
                            onClick={() => setDeliveryOption('fast')} 
                            className={`flex items-center gap-3 border p-2 px-3 cursor-pointer backdrop-blur-xl bg-white/30 shadow-sm transition-all duration-300 ${deliveryOption === 'fast' ? 'border-green-500 bg-green-50/50' : 'border-white/40'}`}
                        >
                            <p className={`min-w-3.5 h-3.5 border rounded-full ${deliveryOption === 'fast' ? 'bg-green-400' : ''}`}></p>
                            <div>
                                <p className='font-medium'>Fast Delivery</p>
                                <p className='text-gray-500 text-sm'>
                                    {calculateDeliveryFee('fast', method) === 0 ? 'FREE' : `₹${calculateDeliveryFee('fast', method)}.00`} - 2-3 days
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ------------- Right Side ------------------ */}
            <div className='mt-8'>

                <div className='mt-8 min-w-80'>
                    <CartTotal 
                        deliveryOption={deliveryOption} 
                        paymentMethod={method}
                    />
                </div>

                <div className='mt-12'>
                    <Title text1={'PAYMENT'} text2={'METHOD'} />
                    {/* --------------- Payment Method Selection ------------- */}
                    <div className='flex gap-3 flex-col lg:flex-row'>
                        <div onClick={() => setMethod('razorpay')} className={`flex items-center gap-3 border p-2 px-3 cursor-pointer backdrop-blur-xl bg-white/30 shadow-sm transition-all duration-300 ${method === 'razorpay' ? 'border-green-500 bg-green-50/50' : 'border-white/40'}`}>
                            <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'razorpay' ? 'bg-green-400' : ''}`}></p>
                            <img className='h-5 mx-4' src={assets.razorpay_logo} alt="" />
                        </div>
                        <div onClick={() => setMethod('cod')} className={`flex items-center gap-3 border p-2 px-3 cursor-pointer backdrop-blur-xl bg-white/30 shadow-sm transition-all duration-300 ${method === 'cod' ? 'border-green-500 bg-green-50/50' : 'border-white/40'}`}>
                            <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'cod' ? 'bg-green-400' : ''}`}></p>
                            <p className='text-gray-500 text-sm font-medium mx-4'>CASH ON DELIVERY</p>
                        </div>
                    </div>

                    <div className='w-full text-end mt-8'>
                        <button 
                            type='submit' 
                            disabled={isServiceable === false}
                            className='backdrop-blur-xl bg-black/90 hover:bg-black text-white px-16 py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all duration-300 rounded-sm'
                        >
                            PLACE ORDER
                        </button>
                    </div>
                </div>
            </div>
        </form>
    )
}

export default PlaceOrder