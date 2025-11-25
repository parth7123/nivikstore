import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Shipment from "../models/Shipment.js";
import Stripe from 'stripe'
import razorpay from 'razorpay'
import crypto from 'crypto'
import { cancelShiprocketOrder } from '../services/shiprocket.service.js';

// global variables
const currency = 'inr'

// Function to calculate delivery charge based on delivery option and payment method
const calculateDeliveryCharge = (deliveryOption, paymentMethod) => {
    // New shipping cost structure:
    // Razorpay + Normal Delivery = Free (₹0)
    // Razorpay + Fast Delivery = ₹130
    // COD + Normal Delivery = ₹100
    // COD + Fast Delivery = ₹130
    
    if (paymentMethod === 'Razorpay' && deliveryOption === 'normal') {
        return 0;
    } else if (paymentMethod === 'Razorpay' && deliveryOption === 'fast') {
        return 130;
    } else if (paymentMethod === 'COD' && deliveryOption === 'normal') {
        return 100;
    } else if (paymentMethod === 'COD' && deliveryOption === 'fast') {
        return 130;
    }
    // Default case
    return 0;
};

// gateway initialize
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// Create Razorpay instance lazily when needed
let razorpayInstance = null;

const getRazorpayInstance = () => {
    if (!razorpayInstance) {
        razorpayInstance = new razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
    }
    return razorpayInstance;
};

// Placing orders using COD Method
const placeOrder = async (req,res) => {
    
    try {
        
        const { userId, items, amount, address, deliveryOption, shippingProvider, shiprocketOption } = req.body;

        const orderData = {
            userId,
            items,
            address,
            amount,
            paymentMethod:"COD",
            payment:false,
            date: Date.now(),
            deliveryOption: deliveryOption || 'normal', // Default to normal if not provided
            'shipping.provider': shippingProvider || 'shiprocket',
            'shipping.awb': shiprocketOption ? shiprocketOption.awb : null,
            'shipping.courierName': shiprocketOption ? shiprocketOption.courierName : null,
            'shipping.labelUrl': shiprocketOption ? shiprocketOption.labelUrl : null
        }

        const newOrder = new orderModel(orderData)
        await newOrder.save()

        await userModel.findByIdAndUpdate(userId,{cartData:{}})

        res.json({success:true,message:"Order Placed"})


    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }

}

// Placing orders using Stripe Method
const placeOrderStripe = async (req,res) => {
    try {
        
        const { userId, items, amount, address, deliveryOption, shippingProvider, shiprocketOption } = req.body
        const { origin } = req.headers;

        const orderData = {
            userId,
            items,
            address,
            amount,
            paymentMethod:"Stripe",
            payment:false,
            date: Date.now(),
            deliveryOption: deliveryOption || 'normal', // Default to normal if not provided
            'shipping.provider': shippingProvider || 'shiprocket',
            'shipping.awb': shiprocketOption ? shiprocketOption.awb : null,
            'shipping.courierName': shiprocketOption ? shiprocketOption.courierName : null,
            'shipping.labelUrl': shiprocketOption ? shiprocketOption.labelUrl : null
        }

        const newOrder = new orderModel(orderData)
        await newOrder.save()

        const line_items = items.map((item) => ({
            price_data: {
                currency:currency,
                product_data: {
                    name:item.name
                },
                unit_amount: item.price * 100
            },
            quantity: item.quantity
        }))

        // Use appropriate delivery charge based on delivery option and payment method
        const selectedDeliveryCharge = calculateDeliveryCharge(deliveryOption, "Stripe");
        
        line_items.push({
            price_data: {
                currency:currency,
                product_data: {
                    name:'Delivery Charges'
                },
                unit_amount: selectedDeliveryCharge * 100
            },
            quantity: 1
        })

        const session = await stripe.checkout.sessions.create({
            success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url:  `${origin}/verify?success=false&orderId=${newOrder._id}`,
            line_items,
            mode: 'payment',
        })

        res.json({success:true,session_url:session.url});

    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

// Verify Stripe 
const verifyStripe = async (req,res) => {

    const { orderId, success, userId } = req.body

    try {
        if (success === "true") {
            await orderModel.findByIdAndUpdate(orderId, {payment:true});
            await userModel.findByIdAndUpdate(userId, {cartData: {}})
            res.json({success: true});
        } else {
            await orderModel.findByIdAndDelete(orderId)
            res.json({success:false})
        }
        
    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }

}

// Placing orders using Razorpay Method
const placeOrderRazorpay = async (req,res) => {
    try {
        
        const { userId, items, amount, address, deliveryOption, shippingProvider, shiprocketOption } = req.body

        const orderData = {
            userId,
            items,
            address,
            amount,
            paymentMethod:"Razorpay",
            payment:false,
            date: Date.now(),
            deliveryOption: deliveryOption || 'normal', // Default to normal if not provided
            'shipping.provider': shippingProvider || 'shiprocket',
            'shipping.awb': shiprocketOption ? shiprocketOption.awb : null,
            'shipping.courierName': shiprocketOption ? shiprocketOption.courierName : null,
            'shipping.labelUrl': shiprocketOption ? shiprocketOption.labelUrl : null
        }

        const newOrder = new orderModel(orderData)
        await newOrder.save()

        const options = {
            amount: Math.round(amount * 100), // Ensure amount is in paise and is an integer
            currency: currency.toUpperCase(),
            receipt : newOrder._id.toString()
        }

        // Get Razorpay instance and create order
        const instance = getRazorpayInstance();
        const razorpayOrder = await instance.orders.create(options)
        
        res.json({
            success: true,
            order: {
                id: razorpayOrder.id,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                receipt: razorpayOrder.receipt
            }
        })

    } catch (error) {
        console.log('Razorpay order creation error:', error)
        res.json({
            success: false,
            message: error.message || 'Failed to create Razorpay order'
        })
    }
}

const verifyRazorpay = async (req,res) => {
    try {
        
        const { userId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body
        
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.json({ success: false, message: 'Missing payment verification data' })
        }
        
        // Verify payment signature
        const body = razorpay_order_id + "|" + razorpay_payment_id
        const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
                                       .update(body.toString())
                                       .digest('hex')
        
        if (expectedSignature === razorpay_signature) {
            // Payment is verified, fetch order by receipt (order_id)
            const instance = getRazorpayInstance();
            const orderInfo = await instance.orders.fetch(razorpay_order_id)
            
            if (orderInfo && orderInfo.receipt) {
                await orderModel.findByIdAndUpdate(orderInfo.receipt, { payment: true })
                await userModel.findByIdAndUpdate(userId, { cartData: {} })
                res.json({ success: true, message: "Payment Successful" })
            } else {
                res.json({ success: false, message: 'Order not found in Razorpay' })
            }
        } else {
            res.json({ success: false, message: 'Payment verification failed - Invalid signature' })
        }

    } catch (error) {
        console.log('Razorpay verification error:', error)
        res.json({success:false,message:error.message || 'Payment verification failed'})
    }
}

// Cancel Order (User)
const cancelOrder = async (req, res) => {
    try {
        const { orderId } = req.body;
        const userId = req.user.id; // Get userId from the authenticated user (from auth middleware)
        
        // Find the order and check if it belongs to the user
        const order = await orderModel.findOne({ _id: orderId, userId: userId });
        
        if (!order) {
            return res.json({ success: false, message: 'Order not found or you do not have permission to cancel this order' });
        }
        
        // Check if order can be cancelled (only if not already cancelled and not delivered)
        if (order.cancelled) {
            return res.json({ success: false, message: 'Order is already cancelled' });
        }
        
        if (order.status === 'Delivered') {
            return res.json({ success: false, message: 'Cannot cancel delivered order' });
        }
        
        // Update order as cancelled
        await orderModel.findByIdAndUpdate(order._id, {
            cancelled: true,
            cancellationDate: Date.now(),
            status: 'Cancelled',
            cancelledBy: 'user'
        });
        
        // Cancel in Shiprocket if shipment exists
        if (order.shipping && order.shipping.providerOrderId) {
            try {
                await cancelShiprocketOrder(order.shipping.providerOrderId);
                console.log(`✓ Shiprocket order ${order.shipping.providerOrderId} cancelled successfully`);
            } catch (error) {
                console.error('✗ Failed to cancel Shiprocket order:', error.message);
                // Continue with order cancellation even if Shiprocket fails
            }
        }
        
        res.json({ success: true, message: 'Order cancelled successfully' });
        
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Cancel Order (Admin)
const adminCancelOrder = async (req, res) => {
    try {
        const { orderId } = req.body;
        
        // Find the order
        const order = await orderModel.findById(orderId);
        
        if (!order) {
            return res.json({ success: false, message: 'Order not found' });
        }
        
        // Check if order can be cancelled (only if not already cancelled and not delivered)
        if (order.cancelled) {
            return res.json({ success: false, message: 'Order is already cancelled' });
        }
        
        if (order.status === 'Delivered') {
            return res.json({ success: false, message: 'Cannot cancel delivered order' });
        }
        
        // Update order as cancelled
        await orderModel.findByIdAndUpdate(orderId, {
            cancelled: true,
            cancellationDate: Date.now(),
            status: 'Cancelled',
            cancelledBy: 'admin'
        });
        
        // Cancel in Shiprocket if shipment exists
        if (order.shipping && order.shipping.providerOrderId) {
            try {
                await cancelShiprocketOrder(order.shipping.providerOrderId);
                console.log(`✓ Shiprocket order ${order.shipping.providerOrderId} cancelled successfully (admin)`);
            } catch (error) {
                console.error('✗ Failed to cancel Shiprocket order:', error.message);
                // Continue with order cancellation even if Shiprocket fails
            }
        }
        
        res.json({ success: true, message: 'Order cancelled successfully' });
        
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// All Orders data for Admin Panel
const allOrders = async (req,res) => {

    try {
        
        const orders = await orderModel.find({ hiddenFromAdmin: { $ne: true } })
        res.json({success:true,orders})

    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }

}

// User Order Data For Forntend
const userOrders = async (req,res) => {
    try {
        
        const { userId } = req.body

        const orders = await orderModel.find({ userId })
        res.json({success:true,orders})

    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

// update order status from Admin Panel
const updateStatus = async (req,res) => {
    try {
        
        const { orderId, status } = req.body

        await orderModel.findByIdAndUpdate(orderId, { status })
        res.json({success:true,message:'Status Updated'})

    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

// hide order from Admin Panel (for delivered or cancelled orders)
const hideOrderFromAdmin = async (req,res) => {
    try {
        
        const { orderId } = req.body

        await orderModel.findByIdAndUpdate(orderId, { hiddenFromAdmin: true })
        res.json({success:true,message:'Order Hidden from Admin Panel'})

    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

export {verifyRazorpay, verifyStripe ,placeOrder, placeOrderStripe, placeOrderRazorpay, allOrders, userOrders, updateStatus, hideOrderFromAdmin, cancelOrder, adminCancelOrder}
