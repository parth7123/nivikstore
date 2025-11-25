import React, { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title';

const CartTotal = ({ deliveryOption, paymentMethod }) => {

    const {currency, calculateDeliveryFee, getCartAmount} = useContext(ShopContext);
    
    // Calculate delivery fee based on delivery option and payment method
    const deliveryFee = calculateDeliveryFee(deliveryOption, paymentMethod);

  return (
    <div className='w-full'>
      <div className='text-2xl'>
        <Title text1={'CART'} text2={'TOTALS'} />
      </div>

      <div className='flex flex-col gap-2 mt-2 text-sm'>
            <div className='flex justify-between'>
                <p>Subtotal</p>
                <p>{currency} {getCartAmount()}.00</p>
            </div>
            <hr />
            <div className='flex justify-between'>
                <p>Shipping Fee</p>
                <p>{currency} {deliveryFee}.00</p>
            </div>
            <hr />
            <div className='flex justify-between'>
                <b>Total</b>
                <b>{currency} {getCartAmount() + deliveryFee}.00</b>
            </div>
      </div>
    </div>
  )
}

export default CartTotal