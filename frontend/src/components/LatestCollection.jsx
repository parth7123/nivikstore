import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title';
import ProductItem from './ProductItem';
import { motion } from 'framer-motion';

const LatestCollection = () => {

    const { products } = useContext(ShopContext);
    const [latestProducts,setLatestProducts] = useState([]);

    useEffect(()=>{
        if (products && products.length > 0) {
            setLatestProducts(products.slice(0,10));
        }
    },[products])

  return (
    <div className='my-10'>
      <div className='text-center py-8 text-3xl'>
          <Title text1={'LATEST'} text2={'COLLECTIONS'} />
          <p className='w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600'>
          Explore the newest trends in fashion, lifestyle, and electronics! Shop our latest arrivals — where style meets quality at unbeatable prices.
          </p>
      </div>

      {/* Rendering Products */}
      {latestProducts.length === 0 ? (
        <div className='text-center py-10'>
          <p className='text-gray-500'>Loading products...</p>
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
              latestProducts.map((item,index)=>(
                <motion.div 
                  key={index} 
                  className='flex-shrink-0 w-[160px] sm:w-auto'
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    show: { opacity: 1, y: 0 }
                  }}
                >
                  <ProductItem id={item._id} image={item.image} name={item.name} price={item.price} />
                </motion.div>
              ))
            }
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default LatestCollection

