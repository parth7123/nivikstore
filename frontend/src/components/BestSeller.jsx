import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title';
import ProductItem from './ProductItem';
import { motion } from 'framer-motion';

const BestSeller = () => {

    const {products} = useContext(ShopContext);
    const [bestSeller,setBestSeller] = useState([]);

    useEffect(()=>{
        if (products && products.length > 0) {
            const bestProduct = products.filter((item)=>(item.bestseller));
            setBestSeller(bestProduct.slice(0,5))
        }
    },[products])

  return (
    <div className='my-10'>
      <div className='text-center text-3xl py-8'>
        <Title text1={'BEST'} text2={'SELLERS'}/>
        <p className='w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600'>
        Find the best collection in Surat, India — from ethnic wear to electronics, gifts, and home products. Shop the latest arrivals only at nivik and upgrade your everyday living!
        </p>
      </div>

      {bestSeller.length === 0 ? (
        <div className='text-center py-10'>
          <p className='text-gray-500'>Loading best sellers...</p>
        </div>
      ) : (
        <div className='overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0'>
          <motion.div 
            className='flex sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-y-6 min-w-max sm:min-w-0'
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
          >
            {
              bestSeller.map((item,index)=>(
                <motion.div 
                  key={index} 
                  className='flex-shrink-0 w-[160px] sm:w-auto'
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    show: { opacity: 1, y: 0 }
                  }}
                >
                  <ProductItem id={item._id} name={item.name} image={item.image} price={item.price} />
                </motion.div>
              ))
            }
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default BestSeller

