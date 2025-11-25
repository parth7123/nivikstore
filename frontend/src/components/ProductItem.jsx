import { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import {Link} from 'react-router-dom'
import { motion } from 'framer-motion'

const ProductItem = ({id,image,name,price}) => {
    const {currency} = useContext(ShopContext);

  return (
    <Link onClick={()=>scrollTo(0,0)} className='block group' to={`/product/${id}`}>
      <motion.div
        className='relative overflow-hidden w-full aspect-square rounded-xl bg-white shadow-lg'
        whileHover={{ y: -8, scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <motion.img 
          className='w-full h-full object-cover' 
          src={image[0]} 
          alt={name}
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
        
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-pink-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </motion.div>
      
      <motion.p 
        className='pt-3 pb-1 text-sm font-medium line-clamp-2 text-gray-700'
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {name}
      </motion.p>
      <motion.p 
        className='text-sm font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent'
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        {currency}{price}
      </motion.p>
    </Link>
  )
}

export default ProductItem





