import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const Login = () => {

  const [currentState, setCurrentState] = useState('Login');
  const { token, setToken, navigate, backendUrl } = useContext(ShopContext)

  const [name,setName] = useState('')
  const [password,setPasword] = useState('')
  const [email,setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const onSubmitHandler = async (event) => {
      event.preventDefault();
      try {
        if (currentState === 'Sign Up') {
          
          const response = await axios.post(backendUrl + '/api/user/register',{name,email,password})
          if (response.data.success) {
            setToken(response.data.token)
            localStorage.setItem('token',response.data.token)
          } else {
            toast.error(response.data.message)
          }

        } else if (currentState === 'Login') {

          const response = await axios.post(backendUrl + '/api/user/login', {email,password})
          if (response.data.success) {
            setToken(response.data.token)
            localStorage.setItem('token',response.data.token)
          } else {
            toast.error(response.data.message)
          }

        } else if (currentState === 'Reset Password') {
            const response = await axios.post(backendUrl + '/api/user/reset-password', {email, newPassword})
            if (response.data.success) {
                toast.success(response.data.message)
                setCurrentState('Login')
            } else {
                toast.error(response.data.message)
            }
        }


      } catch (error) {
        console.log(error)
        toast.error(error.message)
      }
  }

  useEffect(()=>{
    if (token) {
      navigate('/')
    }
  },[token])

  return (
    <form onSubmit={onSubmitHandler} className='flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800'>
        <div className='inline-flex items-center gap-2 mb-2 mt-10'>
            <p className='prata-regular text-3xl'>{currentState}</p>
            <hr className='border-none h-[1.5px] w-8 bg-gray-800' />
        </div>
        {currentState === 'Login' ? '' : currentState === 'Reset Password' ? '' : <input onChange={(e)=>setName(e.target.value)} value={name} type="text" className='w-full px-3 py-2 backdrop-blur-xl bg-white/30 border border-white/40 shadow-sm rounded focus:ring-2 focus:ring-white/50 focus:outline-none placeholder-gray-500' placeholder='Name' required/>}
        <input onChange={(e)=>setEmail(e.target.value)} value={email} type="email" className='w-full px-3 py-2 backdrop-blur-xl bg-white/30 border border-white/40 shadow-sm rounded focus:ring-2 focus:ring-white/50 focus:outline-none placeholder-gray-500' placeholder='Email' required/>
        
        <div className='relative w-full'>
            {currentState === 'Reset Password' 
                ? <input onChange={(e)=>setNewPassword(e.target.value)} value={newPassword} type={showPassword ? "text" : "password"} className='w-full px-3 py-2 backdrop-blur-xl bg-white/30 border border-white/40 shadow-sm rounded focus:ring-2 focus:ring-white/50 focus:outline-none placeholder-gray-500' placeholder='New Password' required/>
                : <input onChange={(e)=>setPasword(e.target.value)} value={password} type={showPassword ? "text" : "password"} className='w-full px-3 py-2 backdrop-blur-xl bg-white/30 border border-white/40 shadow-sm rounded focus:ring-2 focus:ring-white/50 focus:outline-none placeholder-gray-500' placeholder='Password' required/>
            }
            <button type="button" onClick={() => setShowPassword(!showPassword)} className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800'>
                {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                )}
            </button>
        </div>
        <div className='w-full flex justify-between text-sm mt-[-8px]'>
            {currentState === 'Login' && <p onClick={()=>setCurrentState('Reset Password')} className=' cursor-pointer hover:text-gray-600'>Forgot your password?</p>}
            {
              currentState === 'Login' 
              ? <p onClick={()=>setCurrentState('Sign Up')} className=' cursor-pointer hover:text-gray-600'>Create account</p>
              : <p onClick={()=>setCurrentState('Login')} className=' cursor-pointer hover:text-gray-600'>Login Here</p>
            }
        </div>
        <button className='backdrop-blur-xl bg-black/90 hover:bg-black text-white font-light px-8 py-2 mt-4 shadow-lg transition-all duration-300 rounded-sm'>{currentState === 'Login' ? 'Sign In' : currentState === 'Sign Up' ? 'Sign Up' : 'Reset Password'}</button>
    </form>
  )
}

export default Login
