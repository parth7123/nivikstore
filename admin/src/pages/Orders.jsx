import React from 'react'
import { useEffect } from 'react'
import { useState } from 'react'
import axios from 'axios'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'
import ShippingPanel from '../components/ShippingPanel'
import TrackingWidget from '../components/TrackingWidget'

const Orders = ({ token }) => {

  const [orders, setOrders] = useState([])

  const fetchAllOrders = async () => {

    if (!token) {
      return null;
    }

    try {

      const response = await axios.post(backendUrl + '/api/order/list', {}, { headers: { token } })
      if (response.data.success) {
        setOrders(response.data.orders.reverse())
      } else {
        toast.error(response.data.message)
      }

    } catch (error) {
      toast.error(error.message)
    }


  }

  const statusHandler = async ( event, orderId ) => {
    try {
      const response = await axios.post(backendUrl + '/api/order/status' , {orderId, status:event.target.value}, { headers: {token}})
      if (response.data.success) {
        await fetchAllOrders()
      }
    } catch (error) {
      console.log(error)
      toast.error(response.data.message)
    }
  }

  const hideHandler = async (orderId) => {
    if (window.confirm('Are you sure you want to clear this order from admin view?')) {
      try {
        const response = await axios.post(backendUrl + '/api/order/hide', {orderId}, { headers: {token}})
        if (response.data.success) {
          toast.success('Order cleared from admin view')
          await fetchAllOrders()
        } else {
          toast.error(response.data.message)
        }
      } catch (error) {
        console.log(error)
        toast.error('Failed to clear order')
      }
    }
  }

  const adminCancelOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        const response = await axios.post(backendUrl + '/api/order/admin-cancel', {orderId}, { headers: {token}})
        if (response.data.success) {
          toast.success('Order cancelled successfully')
          await fetchAllOrders()
        } else {
          toast.error(response.data.message)
        }
      } catch (error) {
        console.log(error)
        toast.error('Failed to cancel order')
      }
    }
  }

  const handleShipmentCreated = () => {
    // Refresh orders to show updated shipment information
    fetchAllOrders()
  }

  useEffect(() => {
    fetchAllOrders();
  }, [token])

  return (
    <div>
      <h3>Order Page</h3>
      <div>
        {
          orders.map((order, index) => (
            <div 
              className={`grid grid-cols-1 sm:grid-cols-[0.5fr_2fr_1fr] lg:grid-cols-[0.5fr_2fr_1fr_1fr_1fr_1fr_1fr] gap-3 items-start border-2 p-5 md:p-8 my-3 md:my-4 text-xs sm:text-sm text-gray-700 ${
                order.cancelled ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`} 
              key={index}
            >
              <img className='w-12' src={assets.parcel_icon} alt="" />
              <div>
                <div>
                  {order.items.map((item, index) => {
                    if (index === order.items.length - 1) {
                      return <p className='py-0.5' key={index}> {item.name} x {item.quantity} <span> {item.size} </span> </p>
                    }
                    else {
                      return <p className='py-0.5' key={index}> {item.name} x {item.quantity} <span> {item.size} </span> ,</p>
                    }
                  })}
                </div>
                <p className='mt-3 mb-2 font-medium'>{order.address.firstName + " " + order.address.lastName}</p>
                <div>
                  <p>{order.address.street + ","}</p>
                  <p>{order.address.city + ", " + order.address.state + ", " + order.address.country + ", " + order.address.zipcode}</p>
                </div>
                <p>{order.address.phone}</p>
                {order.cancelled && (
                  <p className='mt-2 text-red-600 font-semibold'>
                    CANCELLED by {order.cancelledBy === 'admin' ? 'Admin' : 'User'}
                  </p>
                )}
              </div>
              <div>
                <p className='text-sm sm:text-[15px]'>Items : {order.items.length}</p>
                <p className='mt-3'>Method : {order.paymentMethod}</p>
                <p>Payment : { order.payment ? 'Done' : 'Pending' }</p>
                <p>Date : {new Date(order.date).toLocaleDateString()}</p>
              </div>
              <div>
                <p>Delivery Option:</p>
                <p className='font-semibold'>{order.deliveryOption === 'fast' ? 'Fast Delivery' : 'Normal Delivery'}</p>
              </div>
              <p className='text-sm sm:text-[15px]'>{currency}{order.amount}</p>
              <div className='flex flex-col gap-2'>
                {order.cancelled ? (
                  <p className='p-2 font-semibold text-red-600'>Cancelled</p>
                ) : (
                  <>
                    <select onChange={(event)=>statusHandler(event,order._id)} value={order.status} className='p-2 font-semibold'>
                      <option value="Order Placed">Order Placed</option>
                      <option value="Packing">Packing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Out for delivery">Out for delivery</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </>
                )}
                {/* Show hide button for delivered or cancelled orders */}
                {(order.status === 'Delivered' || order.cancelled) && (
                  <button 
                    onClick={() => hideHandler(order._id)}
                    className='bg-red-500 text-white px-3 py-1 text-xs rounded hover:bg-red-600 transition-colors'
                  >
                    Clear Order
                  </button>
                )}
              </div>
              <div className='flex flex-col gap-2'>
                {!order.cancelled && order.status !== 'Delivered' && (
                  <button 
                    onClick={() => adminCancelOrder(order._id)}
                    className='bg-red-500 text-white px-3 py-1 text-xs rounded hover:bg-red-600 transition-colors'
                  >
                    Cancel Order
                  </button>
                )}
              </div>
              {/* Shipping Panel */}
              <div className='col-span-full mt-4'>
                <ShippingPanel 
                  token={token} 
                  order={order} 
                  onShipmentCreated={handleShipmentCreated} 
                />
              </div>
            </div>
          ))
        }
      </div>
    </div>
  )
}

export default Orders