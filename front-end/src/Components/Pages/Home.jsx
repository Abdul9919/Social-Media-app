import React, { useContext, useEffect, useState, useRef, useCallback } from 'react';
import { FaHome, FaFacebookMessenger, FaRegCompass } from 'react-icons/fa';
import { CiSearch, CiHeart, CiSquarePlus } from 'react-icons/ci';
import { IoChatbubbleOutline, IoPaperPlaneSharp } from 'react-icons/io5';
import { AuthContext } from '../../Contexts/AuthContext';
import axios from 'axios';
import { Link, useNavigate, Routes, Route } from 'react-router-dom';
import Post from '../Post';
import { BsThreeDots } from "react-icons/bs";
import VideoPlayer from '../VideoPlayer';
import { PostOptions } from '../PostOptions';
import { Likes } from '../Likes';


const Home = () => {
  const { logout } = useContext(AuthContext);
  const token = localStorage.getItem('token');
  const { user } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const apiUrl = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const [activePostOptions, setActivePostOptions] = useState(null);
  const [activePostLikes, setActivePostLikes] = useState(null)
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef();
  const commentInputRef = useRef({});

  
  const fetchPosts = useCallback(async (pageNumber) => {
    try {
      const response = await axios.get(`${apiUrl}/api/posts/`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          page: pageNumber,
        },
      });

      if (response.data.length < 3) {
        setHasMore(false);
      }

      if (response.data.length > 0) {
        setPosts(prev => [...prev, ...response.data]);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  }, []);

  useEffect(() => {
    if (hasMore) fetchPosts(page);
  }, [page, fetchPosts]);

  // Intersection Observer for infinite scroll
  const observer = useRef();
  const lastPostRef = useCallback(node => {
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prev => prev + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [hasMore]);
  const getPostAge = (createdAt) => {
    const postDate = new Date(createdAt);
    const now = new Date();
    const diffInSeconds = Math.floor((now - postDate) / 1000);
    const hours = Math.floor(diffInSeconds / 3600);
    if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`;
    }
    else if (hours < 1) {
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    }
    else if (hours < 24) {
      return `${Math.floor(hours)} hours ago`;

    }
    else if (hours < 720) {
      return `${Math.floor(hours / 24)} days ago`;
    }
    else if (hours < 168) {
      return `${Math.floor(hours / 24 / 7)} weeks ago`;
    }
    else if (hours < 8760) {
      return `${Math.floor(hours / 720)} months ago`;
    }
    else {
      return postDate.toLocaleDateString();
    }
  }

  const handleLikeToggle = async (postId, alreadyLiked) => {
    try {
      if (alreadyLiked) {
        await axios.delete(`${apiUrl}/api/likes/${postId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      } else {
        await axios.post(`${apiUrl}/api/likes/${postId}`, {}, {
          headers: {

            Authorization: `Bearer ${token}`
          }
        });
      }

      const response = await axios.get(`${apiUrl}/api/posts/${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setPosts(prevPosts => {
        const index = prevPosts.findIndex(p => p.id === response.data.id);

        if (index !== -1) {
          // Update (replace existing post at that index)
          const updated = [...prevPosts];
          updated[index] = response.data;
          return updated;
        } else {
          // Insert at a specific position (e.g., top or any index)
          const insertIndex = 0; // or wherever you want
          return [
            ...prevPosts.slice(0, insertIndex),
            response.data,
            ...prevPosts.slice(insertIndex)
          ];
        }
      });
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };
  const handleSubmit = async (e, postId) => {
    e.preventDefault();
    const inputEl = commentInputRef.current[postId];
    const comment = inputEl?.value;
    if (!comment.trim()) {
      return; // Prevent submission of empty comments
    }
    try {
      const response = await axios.post(`${apiUrl}/api/comments/${postId}`, {
        content: comment
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.status === 201) {
        commentInputRef.current[postId].value = '';
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    }
  };


  return (
    <>
      <div className="relative bg-black w-screen h-screen flex overflow-hidden">

        {/* Sidebar */}
        <div className="flex flex-col my-10 ml-4 gap-5 w-[14%] flex-shrink-0">
          <img src="/assets/chatterly.png" alt="" className="w-[102px] h-[29px] mb-10 ml-2" />
          {[
            { icon: <FaHome onClick={() => navigate('/')} />, text: 'Home' },
            { icon: <CiSearch />, text: 'Search' },
            { icon: <FaRegCompass />, text: 'Explore' },
            { icon: <FaFacebookMessenger />, text: 'Messages' },
            { icon: <CiHeart />, text: 'Notifications' },
            { icon: <CiSquarePlus />, text: 'Create' }
          ].map((item, idx) => (
            <div key={idx} className="flex gap-2 hover:opacity-70 hover:bg-zinc-800 transition duration-300 rounded-md p-2">
              {React.cloneElement(item.icon, { className: 'text-white text-3xl' })}
              <h2 className="text-white text-lg font-bold">{item.text}</h2>
            </div>
          ))}
          <div className="flex gap-2 hover:opacity-70 hover:bg-zinc-800 transition duration-300 rounded-md p-2">
            <img src={user.profilePicture} alt="profile" className="w-[30px] h-[30px] rounded-full" />
            <h2 className="text-white text-lg font-bold">Profile</h2>
          </div>
          <div onClick={logout} className="flex gap-2 hover:opacity-70 hover:bg-zinc-800 transition duration-300 rounded-md p-2 cursor-pointer">
            <button className="text-white text-lg font-bold">Logout</button>
          </div>
        </div>

        {/* Divider */}
        <div className="w-px bg-zinc-800"></div>

        {/* Scrollable Feed */}
        <div className="flex-1 overflow-y-auto h-screen px-6 py-8">
          <div className="flex flex-col items-center gap-6">
            {posts.map((post, index) => (
              <div ref={index === posts.length - 1 ? lastPostRef : null} key={post.id} className="bg-black text-white w-[470px] h-[846px] rounded-md overflow-hidden font-sans">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 ">
                  <div className="flex items-center gap-3 min-w-[100%]">
                    <img
                      src={post.profile_picture || '/default-profile.jpg'}
                      alt="user"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-sm">{post.username || `user_${post.user_id}`}</span>
                      <span className="text-gray-400 text-xs ml-1">{getPostAge(post.created_at)}</span>
                    </div>
                    <div className={`flex flex-1 text-gray-400 text-xs ml-auto `}>
                      <button onClick={() => setActivePostOptions({ postId: post.id, userId: post.user_id })} className='ml-auto'>
                        <BsThreeDots className="text-white w-5 h-5 cursor-pointer hover:text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Media */}
                {post.media_type === 'image' ? (
                  <img src={post.media_url} alt="post" className="w-[470px] h-[575px] object-cover" />
                ) : post.media_type === 'video' ? (
                  <VideoPlayer src={post.media_url} />
                ) : null}

                {/* Actions */}
                <div className="flex justify-between items-center py-2">
                  <div className="flex gap-4">
                    <CiHeart onClick={() => handleLikeToggle(post.id, post.liked_by_user)} className={`${post.liked_by_user ? 'text-red-500' : 'text-white'} w-7 h-7 cursor-pointer ${post.liked_by_user ? null : 'hover:text-gray-400'}`} />
                    <Link to={`/post/${post.id}`}><IoChatbubbleOutline className="text-white w-7 h-7 cursor-pointer hover:text-gray-400" /></Link>
                    <IoPaperPlaneSharp className="text-white w-7 h-7 cursor-pointer hover:text-gray-400" />
                  </div>
                </div>
                <div onClick={()=>{setActivePostLikes({postId: post.id, userId: post.user_id})}} className='hover:cursor-pointer'>
                  <span className='flex items-center mb-4 mt-2 font-bold' >{post.like_count} likes</span>
                </div>
                <div className="flex gap-4 items-center">
                  <span className="font-semibold text-sm">{post.username || `user_${post.user_id}`}</span>
                  <p className="text-white text-sm">{post.description}</p>
                </div>
                <Link to={`/post/${post.id}`} className='w-full'>
                  <div className='flex items-center my-2 text-gray-400 text-sm hover:text-gray-600 hover:cursor-pointer'>
                    View All {post.comment_count} Comments
                  </div>
                </Link>
                <div className='flex items-center'>
                  <form
                    action=""
                    onSubmit={(e) => handleSubmit(e, post.id)}
                    className='flex items-center gap-2 w-full'
                  >
                    <input type="text" placeholder='Add a Comment' className='outline-0 text-sm' ref={(el) => (commentInputRef.current[post.id] = el)} />
                  </form>
                </div>
                <div className='flex-grow h-px bg-zinc-700 mt-4'></div>
              </div>
            ))}
            {hasMore && (
              <div ref={loaderRef} className="text-white mt-4">
                Loading more posts...
              </div>
            )}
          </div>
        </div>
      </div>
      {activePostOptions && (
        <PostOptions activePostOptions={activePostOptions} setActivePostOptions={setActivePostOptions}/>
      )}
      {activePostLikes && (
        <Likes activePostLikes={activePostLikes} setActivePostLikes={setActivePostLikes}/>
      )}
      {/*hasMore && <div ref={loaderRef} className="h-10 w-full" />*/}
    </>
  );
};

export default Home;