import React, { useContext } from 'react';
import { AuthContext } from '../Contexts/AuthContext.jsx';
import axios from 'axios'
import {Link} from 'react-router-dom'

export const PostOptions = ({activePostOptions, setActivePostOptions}) => {
  const { user } = useContext(AuthContext)
  const apiUrl = import.meta.env.VITE_API_URL
  const token = localStorage.getItem('token')
  const handleDelete = async () => {
    try {
      const postId = activePostOptions.postId
      await axios.delete(`${apiUrl}/api/posts/${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
    } catch (error) {
      console.log(error.message)
    }
  }
  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={() => setActivePostOptions(null)} // Close on outside click
    >
      <div
        className="flex flex-col items-center bg-zinc-800 text-white rounded-4xl shadow-lg w-[400px] h-[350px]"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        {activePostOptions.userId !== user.id ? <span className='flex text-red-400 font-bold py-4 hover:cursor-pointer'>Unfollow</span> : <button className='flex text-red-400 font-bold py-4 hover:cursor-pointer' onClick={handleDelete}>Delete</button>} {/*NEED TO WORK ON THIS FUNCTIONALITY */}
        <div className='flex-grow max-h-px min-w-[100%] bg-zinc-700'></div>
        <span className='flex text-white  py-4 hover:cursor-pointer'>Share to...</span> {/*NEED TO WORK ON THIS FUNCTIONALITY */}
        <div className='flex-grow max-h-px min-w-[100%] bg-zinc-700'></div>
        <span className='flex text-white  py-4 hover:cursor-pointer'>Copy link</span> {/*NEED TO WORK ON THIS FUNCTIONALITY */}
        <div className='flex-grow max-h-px min-w-[100%] bg-zinc-700'></div>
        {activePostOptions.userId === user.id ? <span className='flex text-white  py-4 hover:cursor-pointer'>Edit</span> : <Link to={`/post/${activePostOptions.postId}`}><span className='flex text-white  py-4 hover:cursor-pointer'>Go to Post</span></Link>} {/*NEED TO WORK ON THIS FUNCTIONALITY */}
        <div className='flex-grow max-h-px min-w-[100%] bg-zinc-700'></div>
        <span className='flex text-white  py-4 hover:cursor-pointer'>About this Account</span> {/*NEED TO WORK ON THIS FUNCTIONALITY */}
        <div className='flex-grow max-h-px min-w-[100%] bg-zinc-700'></div>
        <span onClick={() => setActivePostOptions(null)} className='flex text-white  py-4 hover:cursor-pointer'>Cancel</span>
      </div>
    </div>
  )
}
