import React from 'react'
import { useState, useContext } from 'react'
import axios from 'axios'
import { AuthContext } from '../../Contexts/AuthContext'
import { NavLink, useNavigate } from 'react-router-dom'


export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const apiUrl = import.meta.env.VITE_API_URL;
  const { login, isAuthenticated } = useContext(AuthContext);

  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null)
    try {
      const res = await axios.post(`${apiUrl}/api/users/login`, { email, password });
      if (res.data && res.data.id) {
        login(res.data.token, {
          id: res.data.id,
          username: res.data.username,
          email: res.data.email,
          profile_picture : res.data.profile_picture
        });
        console.log('Login successful');
        navigate('/')
      } else {
        console.error('Invalid response format');
      }
      if (isAuthenticated) {
        navigate('/');
      }

    } catch (err) {
        setError(err.response.data.message || 'Invalid email or password');
    }
  }
  return (
    <div className='bg-black w-screen h-screen flex items-center justify-center'>
      <div><img src="/assets/loginImage.png" alt="" className='hidden lg:block w-[552px] h-[450px] mr-[5rem]' /></div>
      <div className='text-white'>
        <img src="/assets/chatterly.png" alt="" className='w-[250px] h-[100px] m-10' />
        <form action="" onSubmit={handleSubmit} className='flex flex-col items-center justify-center'>
          <input type="email" name="email" value={email} onChange={(e) => { setEmail(e.target.value) }} id="email" placeholder='Email' className='bg-zinc-900 mb-2 border-1 rounded-sm border-zinc-700 pl-4 py-2 pr-[8rem] text-sm' />
          <input type="password" name="password" value={password} onChange={(e) => { setPassword(e.target.value) }} id="password" placeholder='Password' className='bg-zinc-900 mb-5 border-1 rounded-sm border-zinc-700 pl-4 py-2 pr-[8rem] text-sm' />
          <button type="submit" className='bg-[#4F46E5] text-white px-6 py-2 rounded-md hover:bg-[#4338CA] transition duration-300 ease-in-out'>
            Sign in
          </button>
        </form>
        <div className='flex items-center my-4'>
          <div className='flex-grow h-px bg-zinc-700'></div>
          <div className='mx-4 text-gray-500 text-sm'>
            OR
          </div>
          <div className='flex-grow h-px bg-zinc-700'></div>
        </div>
        <div className='text-[#FF0000] my-4'>{error}</div>
        <div className='flex items-center justify-center gap-2 mb-4'>
          <div>Dont have an account?</div>
          <NavLink to="/register" className='text-[#4F46E5] hover:text-white transition duration-300 ease-in-out text-sm'>
            Sign Up
          </NavLink>
        </div>
      </div>
    </div>
  )
}
