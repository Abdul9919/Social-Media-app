import React from 'react'
import { useState } from 'react'
import axios from 'axios'
import { NavLink, useNavigate } from 'react-router-dom'

export const Register = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null)
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/users/register`, { username, email, password });
            if (res.data) {
                alert('Registration successful! You can now log in.');
                // Optionally redirect to login page
                navigate('/login');
            } else {
                console.error('Invalid response format');
            }
        } catch (error) {
            setError(error.response.data.message || 'Registration failed. Please try again.');
        }
    }
    return (
        <div className='bg-black w-screen h-screen flex flex-col items-center justify-center'>
            <div className='flex flex-col items-center mt-[2rem] lg:border-1 border-zinc-700 max-w-[75%] lg:max-w-[30%] h-[72%]'>
                <img src="/assets/chatterly.png" alt="" className='w-[200px] h-[65px] m-10' />
                <div className='max-w-[75%]'>
                    <h6 className='text-zinc-400 font-semibold mb-4'>Sign up to see photos and videos from your friends.</h6>
                </div>
                {error ? <div className='text-[#FF0000]'>{error}</div> : null}
                <div className='flex items-center my-4'>
                    <div className='flex-grow h-px w-[100px] bg-zinc-700'></div>
                    <div className='mx-4 text-gray-500 text-sm'>
                        OR
                    </div>
                    <div className='flex-grow h-px bg-zinc-700 w-[100px]'></div>
                </div>
                <form action="" onSubmit={handleSubmit} className='flex flex-col items-center justify-center w-full p-4 gap-2'>
                    <input type="text" placeholder="Username" onChange={(e) => setUsername(e.target.value)} value={username} style={{ fontFamily: 'Aerial' }} className='bg-zinc-900 text-[#F5F5F5] py-[9px] pl-[7px] w-64 border-1 rounded-sm border-stone-500 text-[16px]' />
                    <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} value={email} style={{ fontFamily: 'Aerial' }} className='bg-zinc-900 text-[#F5F5F5] py-[9px] pl-[7px] w-64 border-1 rounded-sm border-stone-500 text-[16px]' />
                    <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} value={password} style={{ fontFamily: 'Aerial' }} className='bg-zinc-900 text-[#F5F5F5] py-[9px] pl-[7px] w-64 border-1 rounded-sm border-stone-500 text-[16px]' />
                    <button type="submit" className='bg-blue-500 text-white p-2 rounded my-2'>Sign Up</button>
                </form>

            </div>
            <div className='flex flex-col items-center mt-8 lg:border-1 border-zinc-700 h-[81px] w-[382px]'>
                <div><p className='text-[#F5F5F5] mt-4'>Already have an account?</p></div>
                <NavLink to="/login" className='text-[#4F46E5] hover:text-[#4338CA] transition duration-300 ease-in-out text-sm'>
                    Log In
                </NavLink>
            </div>
        </div>
    )
}
