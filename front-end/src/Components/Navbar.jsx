import React, { useContext, useState } from 'react'
import { AuthContext } from '../Contexts/AuthContext';
import { useNavigate } from 'react-router-dom'
import { FaHome, FaFacebookMessenger, FaRegCompass, FaBars } from 'react-icons/fa'; // Added FaBars
import { CiSearch, CiHeart, CiSquarePlus } from 'react-icons/ci';
import { IoClose, IoLogOutOutline, IoPersonOutline } from 'react-icons/io5' // Added icons for the menu
import Notifications from './Notifications';
import CreatePost from './CreatePost';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showMore, setShowMore] = useState(false); // State for hamburger menu

  return (
    <>
      {/* CONTAINER */}
      <div className="fixed bottom-0 left-0 w-full h-[60px] bg-black border-t border-zinc-800 flex flex-row items-center justify-around px-2 z-50 
                      md:static md:h-screen md:w-[240px] md:flex-col md:justify-start md:items-stretch md:border-t-0 md:border-r md:p-4 md:gap-2">
        
        {/* LOGO */}
        <div className="hidden md:block mb-10 px-2">
           <img src="/assets/chatterly.png" alt="logo" className="w-[102px] h-[29px]" />
        </div>

        {/* Home */}
        <div onClick={() => navigate('/')} className="flex items-center gap-4 hover:bg-zinc-900 transition duration-300 rounded-lg p-3 cursor-pointer">
          <FaHome className="text-white text-2xl md:text-3xl" />
          <h2 className="text-white text-lg font-medium hidden md:block">Home</h2>
        </div>

        {/* Search */}
        <div className="flex items-center gap-4 hover:bg-zinc-900 transition duration-300 rounded-lg p-3 cursor-pointer">
          <CiSearch className="text-white text-2xl md:text-3xl" />
          <h2 className="text-white text-lg font-medium hidden md:block">Search</h2>
        </div>

        {/* Explore */}
        <div className="flex items-center gap-4 hover:bg-zinc-900 transition duration-300 rounded-lg p-3 cursor-pointer">
          <FaRegCompass className="text-white text-2xl md:text-3xl" />
          <h2 className="text-white text-lg font-medium hidden md:block">Explore</h2>
        </div>

        {/* Messages */}
        <div className="flex items-center gap-4 hover:bg-zinc-900 transition duration-300 rounded-lg p-3 cursor-pointer">
          <FaFacebookMessenger className="text-white text-2xl md:text-3xl" />
          <h2 className="text-white text-lg font-medium hidden md:block">Messages</h2>
        </div>

        {/* Notifications */}
        <div onClick={() => setShowNotifications(true)} className="flex items-center gap-4 hover:bg-zinc-900 transition duration-300 rounded-lg p-3 cursor-pointer">
          <div className="relative">
            <CiHeart className="text-white text-2xl md:text-3xl" />
            {user?.notifCount > 0 && (
              <div className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center border border-black">
                {user.notifCount > 9 ? '9+' : user.notifCount}
              </div>
            )}
          </div>
          <h2 className="text-white text-lg font-medium hidden md:block">Notifications</h2>
        </div>

        {/* Create */}
        <div onClick={() => setShowCreate(true)} className="flex items-center gap-4 hover:bg-zinc-900 transition duration-300 rounded-lg p-3 cursor-pointer">
          <CiSquarePlus className="text-white text-2xl md:text-3xl" />
          <h2 className="text-white text-lg font-medium hidden md:block">Create</h2>
        </div>

        {/* PROFILE (Desktop Only) */}
        <div onClick={() => navigate(`/profile/${user?.id}`)} className="hidden md:flex items-center gap-4 hover:bg-zinc-900 transition duration-300 rounded-lg p-3 cursor-pointer">
          <img src={user?.profilePicture || '/assets/default-avatar.png'} alt="profile" className="w-[30px] h-[30px] rounded-full object-cover" />
          <h2 className="text-white text-lg font-medium">Profile</h2>
        </div>

        {/* HAMBURGER MENU (Mobile Only) */}
        <div className="md:hidden relative">
          <div onClick={() => setShowMore(!showMore)} className="flex items-center p-3 cursor-pointer">
            <FaBars className="text-white text-2xl" />
          </div>

          {/* Mobile Menu Popup */}
          {showMore && (
            <div className="absolute bottom-16 right-0 w-48 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-[60] overflow-hidden">
              <div 
                onClick={() => { navigate(`/profile/${user?.id}`); setShowMore(false); }}
                className="flex items-center gap-3 p-4 hover:bg-zinc-800 text-white transition-colors"
              >
                <IoPersonOutline size={20} />
                <span className="font-medium text-sm">Profile</span>
              </div>
              <div className="h-px bg-zinc-800 w-full" />
              <div 
                onClick={logout}
                className="flex items-center gap-3 p-4 hover:bg-zinc-800 text-red-500 transition-colors"
              >
                <IoLogOutOutline size={20} />
                <span className="font-medium text-sm">Logout</span>
              </div>
            </div>
          )}
        </div>

        {/* Logout (Desktop Only) */}
        <div onClick={logout} className="hidden md:flex items-center gap-4 hover:bg-zinc-900 transition duration-300 rounded-lg p-3 cursor-pointer mt-auto">
          <button className="text-white text-lg font-medium">Logout</button>
        </div>
      </div>

      {/* Notifications Modal */}
      {showNotifications && (
        <div className='fixed inset-0 z-[100] bg-black/50 flex items-start justify-start'>
          <div className='h-full w-full md:w-[350px] overflow-y-auto bg-black border-r border-zinc-800 relative'>
             <button onClick={() => setShowNotifications(false)} className='absolute top-4 right-4 text-white'><IoClose size={24}/></button>
             <Notifications onClose={() => setShowNotifications(false)} />
          </div>
        </div>
      )}

      {/* Create Post Modal */}
      {showCreate && (
        <div className='fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4'>
          <CreatePost onClose={() => setShowCreate(false)} />
        </div>
      )}
    </>
  )
}

export default Navbar;