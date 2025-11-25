import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title';
import { assets } from '../assets/assets';
import CartTotal from '../components/CartTotal';

const Cart = () => {

  const { products, currency, cartItems, updateQuantity, navigate } = useContext(ShopContext);

  const [cartData, setCartData] = useState([]);

  useEffect(() => {

    if (products.length > 0) {
      const tempData = [];
      for (const items in cartItems) {
        for (const item in cartItems[items]) {
          if (cartItems[items][item] > 0) {
            tempData.push({
              _id: items,
              size: item,
              quantity: cartItems[items][item]
            })
          }
        }
      }
      setCartData(tempData);
    }
  }, [cartItems, products])

  return (
    <div className='border-t pt-14'>

      <div className=' text-2xl mb-3'>
        <Title text1={'YOUR'} text2={'CART'} />
      </div>

      <div>
        {
          cartData.map((item, index) => {

            const productData = products.find((product) => product._id === item._id);

            if (!productData) {
              return null;
            }

            return (
              <div key={index} className='py-4 border-t border-b border-gray-200/50 text-gray-700 grid grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4 backdrop-blur-sm bg-white/10 hover:bg-white/20 transition-colors rounded-lg my-2 px-2'>
                <div className=' flex items-start gap-6'>
                  <img className='w-16 sm:w-20 rounded shadow-sm' src={productData.image[0]} alt="" />
                  <div>
                    <p className='text-xs sm:text-lg font-medium'>{productData.name}</p>
                    <div className='flex items-center gap-5 mt-2'>
                      <p>{currency}{productData.price}</p>
                      <p className='px-2 sm:px-3 sm:py-1 border border-white/40 bg-white/30 backdrop-blur-md rounded'>{item.size}</p>
                    </div>
                  </div>
                </div>
                <input onChange={(e) => e.target.value === '' || e.target.value === '0' ? null : updateQuantity(item._id, item.size, Number(e.target.value))} className='border border-white/40 max-w-10 sm:max-w-20 px-1 sm:px-2 py-1 backdrop-blur-xl bg-white/30 rounded focus:outline-none focus:ring-1 focus:ring-white/50' type="number" min={1} defaultValue={item.quantity} />
                <img onClick={() => updateQuantity(item._id, item.size, 0)} className='w-4 mr-4 sm:w-5 cursor-pointer hover:scale-110 transition-transform' src={assets.bin_icon} alt="" />
              </div>
            )

          })
        }
      </div>

      <div className='flex justify-end my-20'>
        <div className='w-full sm:w-[450px] backdrop-blur-xl bg-white/30 border border-white/40 shadow-lg rounded-xl p-6'>
          <CartTotal />
          <div className=' w-full text-end'>
            <button onClick={() => navigate('/place-order')} className='bg-black/90 hover:bg-black text-white text-sm my-8 px-8 py-3 rounded shadow-lg transition-all duration-300 backdrop-blur-md'>PROCEED TO CHECKOUT</button>
          </div>
        </div>
      </div>

    </div>
  )
}

export default Cart
