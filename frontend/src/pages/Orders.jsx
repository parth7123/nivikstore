import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title';
import axios from 'axios'
import { toast } from 'react-toastify';

const Orders = () => {

  const { backendUrl, token , currency} = useContext(ShopContext);

  const [orderData,setorderData] = useState([])
  const [loading, setLoading] = useState(false)

  const loadOrderData = async () => {
    try {
      if (!token) {
        return null
      }

      setLoading(true)
      const response = await axios.post(backendUrl + '/api/order/userorders',{},{headers:{token}})
      if (response.data.success) {
        let allOrdersItem = []
        response.data.orders.map((order)=>{
          order.items.map((item)=>{
            item['status'] = order.status
            item['payment'] = order.payment
            item['paymentMethod'] = order.paymentMethod
            item['date'] = order.date
            item['deliveryOption'] = order.deliveryOption // Add delivery option to item
            item['cancelled'] = order.cancelled // Add cancellation status to item
            item['cancelledBy'] = order.cancelledBy // Add who cancelled the order
            item['orderId'] = order._id // Add order ID to item
            allOrdersItem.push(item)
          })
        })
        setorderData(allOrdersItem.reverse())
      }
      
    } catch (error) {
      console.error('Error loading orders:', error)
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const cancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }
    
    try {
      const response = await axios.post(backendUrl + '/api/order/cancel', {orderId}, {headers:{token}})
      if (response.data.success) {
        toast.success('Order cancelled successfully')
        loadOrderData() // Refresh the orders list
      } else {
        toast.error(response.data.message || 'Failed to cancel order')
      }
    } catch (error) {
      console.error('Error cancelling order:', error)
      toast.error('Failed to cancel order')
    }
  }

  useEffect(()=>{
    loadOrderData()
  },[token])

  // Auto-refresh orders every 30 seconds to show updated status
  useEffect(() => {
    const interval = setInterval(() => {
      if (token) {
        loadOrderData()
      }
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [token])

  return (
    <div className='border-t pt-16'>

        <div className='text-2xl mb-4 flex justify-between items-center'>
            <Title text1={'MY'} text2={'ORDERS'}/>
            <button 
              onClick={loadOrderData} 
              disabled={loading}
              className={`px-4 py-2 text-sm rounded transition-colors ${
                loading 
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                  : 'bg-black text-white hover:bg-gray-800'
              }`}
            >
              {loading ? 'Refreshing...' : 'Refresh Orders'}
            </button>
        </div>

        <div>
            {
              orderData.map((item,index) => (
                <div key={index} className='py-4 border-t border-b border-gray-200/50 text-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4 backdrop-blur-sm bg-white/10 hover:bg-white/20 transition-colors rounded-lg my-2 px-4 shadow-sm'>
                    <div className='flex items-start gap-6 text-sm'>
                        <img className='w-16 sm:w-20 rounded shadow-sm' src={item.image[0]} alt="" />
                        <div>
                          <p className='sm:text-base font-medium'>{item.name}</p>
                          <div className='flex items-center gap-3 mt-1 text-base text-gray-700'>
                            <p>{currency}{item.price}</p>
                            <p>Quantity: {item.quantity}</p>
                            <p>Size: {item.size}</p>
                          </div>
                          <p className='mt-1'>Date: <span className=' text-gray-400'>{new Date(item.date).toDateString()}</span></p>
                          <p className='mt-1'>Payment: <span className=' text-gray-400'>{item.paymentMethod}</span></p>
                          <p className='mt-1'>Delivery: <span className=' text-gray-400'>{item.deliveryOption === 'fast' ? 'Fast Delivery' : 'Normal Delivery'}</span></p>
                          {item.cancelled && (
                            <p className='mt-1'>Status: <span className='text-red-500 font-medium'>
                              Cancelled by {item.cancelledBy === 'admin' ? 'Admin' : 'You'}
                            </span></p>
                          )}
                        </div>
                    </div>
                    <div className='md:w-1/2 flex justify-between items-center'>
                        <div className='flex items-center gap-2'>
                            <p className={`min-w-2 h-2 rounded-full ${item.status === 'Delivered' ? 'bg-green-500' : 'bg-orange-500'}`}></p>
                            <p className='text-sm md:text-base'>{item.status}</p>
                        </div>
                        {!item.cancelled && item.status !== 'Delivered' && item.status !== 'Cancelled' && (
                          <button 
                            onClick={() => cancelOrder(item.orderId)}
                            className='backdrop-blur-xl bg-white/30 border border-red-200 text-red-500 px-4 py-2 text-sm font-medium rounded-sm hover:bg-red-50/50 transition-colors shadow-sm'
                          >
                            Cancel Order
                          </button>
                        )}
                        {(item.cancelled || item.status === 'Cancelled') && (
                          <button 
                            disabled
                            className='backdrop-blur-xl bg-gray-100/50 border border-gray-200 text-gray-400 px-4 py-2 text-sm font-medium rounded-sm cursor-not-allowed'
                          >
                            Cancelled
                          </button>
                        )}
                    </div>
                </div>
              ))
            }
        </div>
    </div>
  )
}

export default Orders