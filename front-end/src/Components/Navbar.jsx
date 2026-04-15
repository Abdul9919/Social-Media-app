
import React, { useContext, useState } from 'react'
import { AuthContext } from '../Contexts/AuthContext';
import { useNavigate } from 'react-router-dom'
import { FaHome, FaFacebookMessenger, FaRegCompass } from 'react-icons/fa';
import { CiSearch, CiHeart, CiSquarePlus } from 'react-icons/ci';
import Notifications from './Notifications';
import CreatePost from './CreatePost';
import { IoClose } from 'react-icons/io5'
// import { useSocket } from '../Contexts/SocketContext';


const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  // console.log(user)

  

  return (
    <>
      <div className="flex flex-col my-10 ml-4 gap-5 w-[14%] flex-shrink-0">
        <img src="/assets/chatterly.png" alt="" className="w-[102px] h-[29px] mb-10 ml-2" />

        {/* Home */}
        <div onClick={() => navigate('/')} className="flex gap-2 hover:opacity-70 hover:bg-zinc-800 hover:cursor-pointer transition duration-300 rounded-md p-2">
          <FaHome className="text-white text-3xl" />
          <h2 className="text-white text-lg font-bold">Home</h2>
        </div>

        {/* Search */}
        <div className="flex gap-2 hover:opacity-70 hover:bg-zinc-800 hover:cursor-pointer transition duration-300 rounded-md p-2">
          <CiSearch className="text-white text-3xl" />
          <h2 className="text-white text-lg font-bold">Search</h2>
        </div>

        {/* Explore */}
        <div className="flex gap-2 hover:opacity-70 hover:bg-zinc-800 hover:cursor-pointer transition duration-300 rounded-md p-2">
          <FaRegCompass className="text-white text-3xl" />
          <h2 className="text-white text-lg font-bold">Explore</h2>
        </div>

        {/* Messages */}
        <div className="flex gap-2 hover:opacity-70 hover:bg-zinc-800 hover:cursor-pointer transition duration-300 rounded-md p-2">
          <FaFacebookMessenger className="text-white text-3xl" />
          <h2 className="text-white text-lg font-bold">Messages</h2>
        </div>

        {/* Notifications - DYNAMIC SECTION */}
        <div onClick={() => setShowNotifications(true)} className="flex gap-2 hover:opacity-70 hover:bg-zinc-800 hover:cursor-pointer transition duration-300 rounded-md p-2">
          <div className="relative">
            <CiHeart className="text-white text-3xl" />
            {/* Only show badge if count > 0 */}
            {user?.notifCount > 0 && (
              <div className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center border border-black">
                {user.notifCount > 9 ? '9+' : user.notifCount}
              </div>
            )}
          </div>
          <h2 className="text-white text-lg font-bold">Notifications</h2>
        </div>

        {/* Create */}
        <div onClick={() => setShowCreate(true)} className="flex gap-2 hover:opacity-70 hover:bg-zinc-800 hover:cursor-pointer transition duration-300 rounded-md p-2">
          <CiSquarePlus className="text-white text-3xl" />
          <h2 className="text-white text-lg font-bold">Create</h2>
        </div>

        {/* Profile */}
        <div onClick={() => navigate(`/profile/${user?.id}`)} className="flex gap-2 hover:opacity-70 hover:bg-zinc-800 hover:cursor-pointer transition duration-300 rounded-md p-2">
          <img src={user?.profilePicture || '/assets/default-avatar.png'} alt="profile" className="w-[30px] h-[30px] rounded-full object-cover" />
          <h2 className="text-white text-lg font-bold">Profile</h2>
        </div>

        {/* Logout */}
        <div onClick={logout} className="flex gap-2 hover:opacity-70 hover:cursor-pointer hover:bg-zinc-800 transition duration-300 rounded-md p-2 cursor-pointer mt-auto">
          <button className="text-white text-lg font-bold text-left w-full">Logout</button>
        </div>
      </div>
      {showNotifications &&
        <div className='fixed inset-0 z-1000 bg-black/50 flex items-start justify-start'>
          <div className='h-[100%] w-[28%] overflow-y-auto bg-black border-r border-neutral-800 relative'>
            <button
              onClick={() => setShowNotifications(false)}
              className='absolute top-4 right-4 text-white hover:text-gray-400 transition'
            >
              <div className='w-10 h-10  ml-4'>
              <IoClose className='w-6 h-6 cursor-pointer fixed ' />
              </div>
            </button>
            <Notifications onClose={() => setShowNotifications(false)} />
          </div>
        </div>
      }
      {showCreate &&
        <div className='fixed inset-0 z-1000 bg-black/60 backdrop-blur-sm flex items-center justify-center'>
          <CreatePost onClose={() => setShowCreate(false)} />
        </div>
      }
    </>
  )
}

export default Navbar;
