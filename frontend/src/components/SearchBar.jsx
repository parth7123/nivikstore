import { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import { assets } from '../assets/assets';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const SearchBar = () => {

    const { search, setSearch, showSearch, setShowSearch} = useContext(ShopContext);
    const [visible,setVisible] = useState(false)
    const location = useLocation();

    useEffect(()=>{
        if (location.pathname.includes('collection')) {
            setVisible(true);
        }
        else {
            setVisible(false)
        }
    },[location])
    
  return (
    <AnimatePresence>
      {showSearch && visible && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className='relative py-8 text-center'
        >
          {/* Glassmorphism container */}
          <div className='inline-flex items-center justify-center gap-3 px-6 py-3 mx-3 w-3/4 sm:w-1/2 rounded-full backdrop-blur-xl bg-white/30 border border-white/40 shadow-lg hover:shadow-xl transition-all duration-300'>
            <img className='w-4 opacity-60' src={assets.search_icon} alt="Search" />
            <input 
              value={search} 
              onChange={(e)=>setSearch(e.target.value)} 
              className='flex-1 outline-none bg-transparent text-sm placeholder-gray-500 text-gray-800' 
              type="text" 
              placeholder='Search for products...'
            />
          </div>
          
          {/* Close button outside search bar */}
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={()=>setShowSearch(false)} 
            className='inline-flex items-center justify-center ml-3 p-2 rounded-full backdrop-blur-xl bg-white/30 border border-white/40 hover:bg-white/50 transition-all duration-300 shadow-lg'
            aria-label="Close search"
          >
            <img className='w-3 opacity-70' src={assets.cross_icon} alt="Close" />
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default SearchBar


