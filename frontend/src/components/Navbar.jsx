import { useContext, useState } from 'react'
import {assets} from '../assets/assets'
import { Link, NavLink } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext';
import GooeyNav from './GooeyNav';

const Navbar = () => {

    const [visible,setVisible] = useState(false);

    const {setShowSearch , getCartCount , navigate, token, setToken, setCartItems} = useContext(ShopContext);

    const logout = () => {
        navigate('/login')
        localStorage.removeItem('token')
        setToken('')
        setCartItems({})
    }

  return (
    <div className='flex items-center justify-between py-5 font-medium relative'>
      
      {/* Left side - Logo */}
      <Link to='/' className='flex-shrink-0'>
        <img src={assets.logo} className='w-28 sm:w-36' alt="" />
      </Link>



      {/* Desktop navigation menu */}
      {/* Desktop navigation menu */}
      <div className='hidden sm:flex flex-1 justify-center'>
        <GooeyNav
          items={[
            { label: "HOME", href: "/" },
            { label: "COLLECTION", href: "/collection" },
            { label: "ABOUT", href: "/about" },
            { label: "CONTACT", href: "/contact" },
          ]}
          particleCount={15}
          particleDistances={[90, 10]}
          particleR={100}
          initialActiveIndex={0}
          animationTime={600}
          timeVariance={300}
          colors={[1, 2, 3, 1, 2, 3, 1, 4]}
        />
      </div>

      {/* Right side - Icons */}
      <div className='flex items-center gap-3 sm:gap-6 flex-shrink-0'>
            <img onClick={()=> { setShowSearch(true); navigate('/collection') }} src={assets.search_icon} className='w-5 cursor-pointer' alt="" />
            
            <div className='group relative'>
                <img onClick={()=> token ? null : navigate('/login') } className='w-5 cursor-pointer' src={assets.profile_icon} alt="" />
                {/* Dropdown Menu */}
                {token && 
                <div className='group-hover:block hidden absolute dropdown-menu right-0 pt-4 z-50'>
                    <div className='flex flex-col gap-2 w-36 py-3 px-5 backdrop-blur-xl bg-white/30 border border-white/40 shadow-lg rounded text-gray-500'>
                        <p onClick={()=>navigate('/profile')} className='cursor-pointer hover:text-black transition-colors'>My Profile</p>
                        <p onClick={()=>navigate('/orders')} className='cursor-pointer hover:text-black transition-colors'>Orders</p>
                        <p onClick={logout} className='cursor-pointer hover:text-black transition-colors'>Logout</p>
                    </div>
                </div>}
            </div> 
            <Link to='/cart' className='relative'>
                <img src={assets.cart_icon} className='w-5 min-w-5' alt="" />
                <p className='absolute right-[-5px] bottom-[-5px] w-4 text-center leading-4 bg-black text-white aspect-square rounded-full text-[8px]'>{getCartCount()}</p>
            </Link> 
            <img onClick={()=>setVisible(true)} src={assets.menu_icon} className='w-5 cursor-pointer sm:hidden' alt="" /> 
      </div>

        {/* Sidebar menu for small screens */}
        <div className={`fixed top-0 right-0 bottom-0 overflow-hidden backdrop-blur-xl bg-white/90 transition-all z-50 ${visible ? 'w-full' : 'w-0'}`}>
                <div className='flex flex-col text-gray-600'>
                    <div onClick={()=>setVisible(false)} className='flex items-center gap-4 p-3 cursor-pointer text-black'>
                        <img className='h-4 rotate-180' src={assets.dropdown_icon} alt="" />
                        <p>Back</p>
                    </div>
                    <NavLink onClick={()=>setVisible(false)} className={({isActive}) => `py-3 pl-6 border-b border-gray-200 ${isActive ? 'bg-black text-white' : 'hover:bg-gray-50'}`} to='/'>HOME</NavLink>
                    <NavLink onClick={()=>setVisible(false)} className={({isActive}) => `py-3 pl-6 border-b border-gray-200 ${isActive ? 'bg-black text-white' : 'hover:bg-gray-50'}`} to='/collection'>COLLECTION</NavLink>
                    <NavLink onClick={()=>setVisible(false)} className={({isActive}) => `py-3 pl-6 border-b border-gray-200 ${isActive ? 'bg-black text-white' : 'hover:bg-gray-50'}`} to='/about'>ABOUT</NavLink>
                    <NavLink onClick={()=>setVisible(false)} className={({isActive}) => `py-3 pl-6 border-b border-gray-200 ${isActive ? 'bg-black text-white' : 'hover:bg-gray-50'}`} to='/contact'>CONTACT</NavLink>
                </div>
        </div>

    </div>
  )
}

export default Navbar
