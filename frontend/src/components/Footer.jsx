import React from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'

const Footer = () => {
  const navigate = useNavigate();

  return (
    <div>
      <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm'>

        <div>
            <img src={assets.logo} className='mb-5 w-32' alt="" />
            <p className='w-full md:w-2/3 text-gray-600'>
           Shop the best in Women’s Ethnic & Western Wear, Men’s & Kids’ Apparels, Electronics, Home & Kitchen, Beauty, Jewellery, and more at nivik. Discover top-quality products in Surat, India — from fashion to gadgets, gifts, and eco-products — all at affordable prices!
            </p>
        </div>

        <div>
            <p className='text-xl font-medium mb-5'>COMPANY</p>
            <ul className='flex flex-col gap-1 text-gray-600'>
                <li onClick={()=>{navigate('/'); window.scrollTo(0,0)}} className='cursor-pointer'>Home</li>
                <li onClick={()=>{navigate('/about'); window.scrollTo(0,0)}} className='cursor-pointer'>About us</li>
                <li onClick={()=>{navigate('/privacy-policy'); window.scrollTo(0,0)}} className='cursor-pointer'>Privacy policy</li>
                <li onClick={()=>{navigate('/terms-conditions'); window.scrollTo(0,0)}} className='cursor-pointer'>Terms & Conditions</li>
                <li onClick={()=>{navigate('/refund-policy'); window.scrollTo(0,0)}} className='cursor-pointer'>Refund Policy</li>
                <li onClick={()=>{navigate('/shipping-policy'); window.scrollTo(0,0)}} className='cursor-pointer'>Shipping Policy</li>
            </ul>
        </div>

        <div>
            <p className='text-xl font-medium mb-5'>GET IN TOUCH</p>
            <ul className='flex flex-col gap-1 text-gray-600'>
                <li>+91 7600032223</li>
                <li>+91 7874299732</li>
                <li>nivikstore01@gmail.com</li>
            </ul>
        </div>

      </div>

        <div>
            <hr />
            <p className='py-5 text-sm text-center'>Copyright 2024@ nivik.com - All Right Reserved.</p>
        </div>

    </div>
  )
}

export default Footer
