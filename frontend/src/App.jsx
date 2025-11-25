import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Collection from './pages/Collection'
import About from './pages/About'
import Contact from './pages/Contact'
import Product from './pages/Product'
import Cart from './pages/Cart'
import Login from './pages/Login'
import PlaceOrder from './pages/PlaceOrder'
import Orders from './pages/Orders'
import Profile from './pages/Profile'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import SearchBar from './components/SearchBar'
import ScrollProgress from './components/ScrollProgress'
import GlobalGradientEffect from './components/GlobalGradientEffect'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Verify from './pages/Verify'
import PrivacyPolicy from './pages/PrivacyPolicy'
import Terms from './pages/Terms'
import RefundPolicy from './pages/RefundPolicy'
import ShippingPolicy from './pages/ShippingPolicy'

const App = () => {
  return (
    <div className='relative px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]'>
      <GlobalGradientEffect />
      <div className='relative z-10'>
        <ScrollProgress />
        <ToastContainer />
        <Navbar />
        <SearchBar />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/collection' element={<Collection />} />
        <Route path='/about' element={<About />} />
        <Route path='/contact' element={<Contact />} />
        <Route path='/product/:productId' element={<Product />} />
        <Route path='/cart' element={<Cart />} />
        <Route path='/login' element={<Login />} />
        <Route path='/place-order' element={<PlaceOrder />} />
        <Route path='/orders' element={<Orders />} />
        <Route path='/profile' element={<Profile />} />
        <Route path='/verify' element={<Verify />} />
        <Route path='/privacy-policy' element={<PrivacyPolicy />} />
        <Route path='/terms-conditions' element={<Terms />} />
        <Route path='/refund-policy' element={<RefundPolicy />} />
        <Route path='/shipping-policy' element={<ShippingPolicy />} />
      </Routes>
      <Footer />
      </div>
    </div>
  )
}

export default App
