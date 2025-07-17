import React, { useContext } from 'react'
import { AuthContext } from '../Contexts/AuthContext';
import {useNavigate} from 'react-router-dom'
import { FaHome, FaFacebookMessenger, FaRegCompass } from 'react-icons/fa';
import { CiSearch, CiHeart, CiSquarePlus } from 'react-icons/ci';

const Navbar = () => {

  const navigate = useNavigate()
  const {user, logout} = useContext(AuthContext)  
  return (
    <div className="flex flex-col my-10 ml-4 gap-5 w-[14%] flex-shrink-0">
              <img src="/assets/chatterly.png" alt="" className="w-[102px] h-[29px] mb-10 ml-2" />
              <div onClick={() => navigate('/')} className="flex gap-2 hover:opacity-70 hover:bg-zinc-800 hover:cursor-pointer transition duration-300 rounded-md p-2">
                <FaHome className="text-white text-3xl" />
                <h2 className="text-white text-lg font-bold">Home</h2>
              </div>
    
              <div className="flex gap-2 hover:opacity-70 hover:bg-zinc-800 hover:cursor-pointer transition duration-300 rounded-md p-2">
                <CiSearch className="text-white text-3xl" />
                <h2 className="text-white text-lg font-bold">Search</h2>
              </div>
    
              <div className="flex gap-2 hover:opacity-70 hover:bg-zinc-800 hover:cursor-pointer transition duration-300 rounded-md p-2">
                <FaRegCompass className="text-white text-3xl" />
                <h2 className="text-white text-lg font-bold">Explore</h2>
              </div>
    
              <div className="flex gap-2 hover:opacity-70 hover:bg-zinc-800 hover:cursor-pointer transition duration-300 rounded-md p-2">
                <FaFacebookMessenger className="text-white text-3xl" />
                <h2 className="text-white text-lg font-bold">Messages</h2>
              </div>
    
              <div className="flex gap-2 hover:opacity-70 hover:bg-zinc-800 hover:cursor-pointer transition duration-300 rounded-md p-2">
                <CiHeart className="text-white text-3xl" />
                <h2 className="text-white text-lg font-bold">Notifications</h2>
              </div>
    
              <div className="flex gap-2 hover:opacity-70 hover:bg-zinc-800 hover:cursor-pointer transition duration-300 rounded-md p-2">
                <CiSquarePlus className="text-white text-3xl" />
                <h2 className="text-white text-lg font-bold">Create</h2>
              </div>
    
              <div onClick={() => navigate(`/profile`)} className="flex gap-2 hover:opacity-70 hover:bg-zinc-800 hover:cursor-pointer transition duration-300 rounded-md p-2">
                <img src={user.profilePicture} alt="profile" className="w-[30px] h-[30px] rounded-full" />
                <h2 className="text-white text-lg font-bold">Profile</h2>
              </div>
    
              <div onClick={logout} className="flex gap-2 hover:opacity-70 hover:cursor-pointer hover:bg-zinc-800 transition duration-300 rounded-md p-2 cursor-pointer">
                <button className="text-white text-lg font-bold">Logout</button>
              </div>
    
            </div>
  )
}

export default Navbar
