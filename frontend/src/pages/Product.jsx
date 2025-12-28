import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'
import { assets } from '../assets/assets'
import RelatedProducts from '../components/RelatedProducts'

const Product = () => {

  const { productId } = useParams()
  const { products, currency, addToCart } = useContext(ShopContext)
  const [productData, setProductData] = useState(false)
  const [image, setImage] = useState('')
  const [size, setSize] = useState('')
  const navigate = useNavigate()

  const fetchProductData = async () => {

    products.map((item) => {
      if (item._id === productId) {
        setProductData(item)
        setImage(item.image[0])

        if (item.sizes && item.sizes.length > 0) {
          setSize(item.sizes[0])
        }
        return null;
      }
    })

  }

  const handleBuyNow = () => {
    if (!size) {
      // Although auto-selected, keep safety check
      return; 
    }
    addToCart(productData._id, size);
    navigate('/place-order');
  }

  useEffect(() => {
    fetchProductData()
  }, [productId, products])

  return (
    <div className='border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100'>
      {productData ? <div>
        {/* ---------------------- Product Data ------------------- */}
        <div className='flex flex-col sm:flex-row gap-12'>
          {/* -------------- Images ------------------ */}
          <div className='flex-1 flex flex-col-reverse gap-3 sm:flex-row'>
            <div className='flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full'>
              {
                productData.image.map((item, index) => {
                  return <img onClick={() => setImage(item)} src={item} key={index} className='w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer' alt="" />
                })
              }
            </div>
            <div className='w-full sm:w-[80%]'>
              <img className='w-full h-auto' src={image} alt="" />
            </div>
          </div>

          {/* -------------- Product Info ------------------ */}
          <div className='flex-1'>
            <h1 className='font-medium text-2xl mt-2'>{productData.name}</h1>
            <div className='flex items-center gap-1 mt-2'>
              <img src={assets.star_icon} alt="" className='w-3 5' />
              <img src={assets.star_icon} alt="" className='w-3 5' />
              <img src={assets.star_icon} alt="" className='w-3 5' />
              <img src={assets.star_icon} alt="" className='w-3 5' />
              <img src={assets.star_dull_icon} alt="" className='w-3 5' />
              <p className='pl-2'>(122)</p>
            </div>
            <p className='mt-5 text-3xl font-medium'>{currency}{productData.price}</p>
            <p className='mt-5 text-gray-500 md:w-4/5'>{productData.description}</p>
            <div className='flex flex-col gap-4 my-8'>
              <p>Select Size</p>
              <div className='flex gap-2'>
                {productData.sizes.map((item, index) => {
                  return <button onClick={() => setSize(item)} className={`border py-2 px-4 backdrop-blur-sm transition-all duration-300 ${item === size ? 'border-orange-500 bg-orange-50/50' : 'border-gray-200 bg-white/30 hover:bg-white/50'}`} key={index}>{item}</button>
                })}
              </div>
            </div>
            <div className='flex gap-5'>
              <button onClick={() => addToCart(productData._id, size)} className='backdrop-blur-xl bg-black/90 hover:bg-black text-white px-8 py-3 text-sm shadow-lg transition-all duration-300 rounded-sm active:bg-gray-700'>ADD TO CART</button>
              <button onClick={handleBuyNow} className='backdrop-blur-xl bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 text-sm shadow-lg transition-all duration-300 rounded-sm active:bg-orange-800'>BUY NOW</button>
            </div>
            <hr className='mt-8 sm:w-4/5' />
            <div className='text-sm text-gray-500 mt-5 flex flex-col gap-1'>
              <p>100% Original product.</p>
              <p>Cash on delivery is available on this product.</p>
              <p>Easy return and exchange policy within 7 days.</p>
            </div>
          </div>
        </div>
    <div className='flex flex-col sm:flex-row justify-around gap-12 sm:gap-2 text-center py-20 text-xs sm:text-sm md:text-base text-gray-700'>
      
      <div>
        <img src={assets.exchange_icon} className='w-12 m-auto mb-5' alt="" style={{filter: 'brightness(0)'}} />
        <p className=' font-semibold'>Free Shipping</p>
        <p className=' text-gray-400'>We Provide Free Shipping</p>
      </div>
      <div>
        <img src={assets.quality_icon} className='w-12 m-auto mb-5' alt="" />
        <p className=' font-semibold'>3 Days Exchange Policy</p>
        <p className=' text-gray-400'>We offer hassle free  Replacement policy</p>
      </div>
      <div>
        <img src={assets.support_img} className='w-12 m-auto mb-5' alt="" style={{filter: 'brightness(0)'}} />
        <p className=' font-semibold'>Best customer support</p>
        <p className=' text-gray-400'>we provide 24/7 customer support</p>
      </div>
      <div>
        <img src={assets.star_icon} className='w-12 m-auto mb-5' alt="" style={{filter: 'brightness(0)'}} />
        <p className=' font-semibold'>Premium Quality</p>
        <p className=' text-gray-400'>We offer premium quality</p>
      </div>
    </div>
        {/* ---------- Description Section ------------- */}
        <div className='mt-20'>
          <div className='flex'>
            <b className='border px-5 py-3 text-sm backdrop-blur-xl bg-white/30 border-b-0 rounded-t-lg'>Description</b>
          </div>
          <div className='flex flex-col gap-4 border px-6 py-6 text-sm text-gray-500 backdrop-blur-xl bg-white/30 rounded-b-lg rounded-tr-lg shadow-sm'>
            <p>An e-commerce website is an online platform that facilitates the buying and selling of products or services over the internet. It serves as a virtual marketplace where businesses and individuals can showcase their products, interact with customers, and conduct transactions without the need for a physical presence. E-commerce websites have gained immense popularity due to their convenience, accessibility, and the global reach they offer.</p>
            <p>E-commerce websites typically display products or services along with detailed descriptions, images, prices, and any available variations (e.g., sizes, colors). Each product usually has its own dedicated page with relevant information.</p>
          </div>
        </div>

        {/* --------- display related products ---------- */}

        <RelatedProducts category={productData.category} subCategory={productData.subCategory} />

      </div> : <div className='opacity-0'></div>}
    </div>
  )
}

export default Product