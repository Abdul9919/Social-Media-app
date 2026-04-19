import React, {  useState, useRef, useEffect } from 'react';
import { FaHome, FaFacebookMessenger, FaRegCompass } from 'react-icons/fa';
import { CiSearch, CiHeart, CiSquarePlus } from 'react-icons/ci';
import { IoChatbubbleOutline, IoPaperPlaneSharp } from 'react-icons/io5';
import { AuthContext } from '../../Contexts/AuthContext';
import axios from 'axios';
import { Link, Routes, Route } from 'react-router-dom';
import Post from '../Post';
import { BsThreeDots } from "react-icons/bs";
import VideoPlayer from '../VideoPlayer';
import { PostOptions } from '../PostOptions';
import { Likes } from '../Likes';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import  Navbar  from '../Navbar';
import Notifications from '../Notifications';
import {useNavigate} from 'react-router-dom'


const Home = () => {
  //const { logout } = useContext(AuthContext);
  const token = localStorage.getItem('token');
 // const { user } = useContext(AuthContext);
  //const [posts, setPosts] = useState([]);
  const apiUrl = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const [activePostOptions, setActivePostOptions] = useState(null);
  const [activePostLikes, setActivePostLikes] = useState(null)
  const [showNotifications, setShowNotifications] = useState(false);
  // const [showNavbar, setShowNavbar] = useState(true)
  //const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  // const loaderRef = useRef();
  const commentInputRef = useRef({});
  const queryClient = useQueryClient();


  const fetchPosts = async ({ pageParam = 1 }) => {
    try {
      const response = await axios.get(`${apiUrl}/api/posts/`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          page: pageParam
        },
      });

      if (response.data.length < 3) {
        setHasMore(false);
      }
      
      return { 
        posts: response.data, 
        nextPage: response.data.length > 0 && response.data.length >= 3 ? pageParam + 1 : undefined 
      };
    } catch (error) {
      console.error('Error fetching posts:', error);
      return { posts: [], nextPage: undefined };
    }
  }

  const { data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage, } = useInfiniteQuery({
      queryKey: ['posts'],
      queryFn: fetchPosts,
      initialPageParam: 1,
      getNextPageParam: (lastPage) => lastPage.nextPage,
    })


  // Intersection Observer for infinite scroll
  const observerRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage(); // 👈 Fetch next page
        }
      },
      { threshold: 1 } // when 100% visible
    );

    if (observerRef.current) observer.observe(observerRef.current);

    return () => {
      if (observerRef.current) observer.unobserve(observerRef.current);
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

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

  const { mutate: handleLikeToggle } = useMutation({
    mutationKey: ['toggleLike'],
    mutationFn: async ({ postId, alreadyLiked }) => {
      if (alreadyLiked) {
        return await axios.delete(`${apiUrl}/api/likes/${postId}`, {
          headers: {

            Authorization: `Bearer ${token}`
          }
        })
      } else {
        return await axios.post(`${apiUrl}/api/likes/${postId}`, {}, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      }
    },
    onMutate: async ({ postId, alreadyLiked }) => {
      //await queryClient.cancelQueries(['posts']);
      // const previousPosts = queryClient.getQueryData(['posts']);

      queryClient.setQueryData(['posts'], (old) => ({
        ...old,
        pages: old?.pages.map((page) => ({
          ...page,
          posts: page.posts.map((post) =>
            post.id === postId
              ? {
                ...post,
                liked_by_user: !alreadyLiked,
                like_count: alreadyLiked ? post.like_count - 1 : post.like_count + 1,
              }
              : post
          ),
        })),
      }));

      // return { previousPosts };
    },

    onError: (err, variables, context) => {
      // rollback if error occurs
      queryClient.setQueryData(['posts'], context.previousPosts);
    },

    onSettled: () => {
      queryClient.invalidateQueries(['posts']);
    },

  })


  /*const handleLikeToggle = async (postId, alreadyLiked) => {
   try {
     if (alreadyLiked) {
 
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
     console.error('Error toggling like:', error.message);
   }
 };*/


  const { mutateAsync: postComment } = useMutation({
    mutationKey: ['comment'],
    mutationFn: async ({ postId, comment }) => {
      return await axios.post(`${apiUrl}/api/comments/${postId}`, {
        content: comment
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    },
    onMutate: ({ postId }) => {
      queryClient.invalidateQueries(['posts']);
      commentInputRef.current[postId].value = ''
    },
  })

  const handleSubmit = async (e, postId) => {
    e.preventDefault()
    const inputEl = commentInputRef.current[postId];
    const comment = inputEl?.value;
    if (!comment.trim()) {
      return; // Prevent submission of empty comments
    }

    postComment({ postId, comment })
  }


  return (
    <>
      {/* CONTAINER: 
         Mobile: flex-col so navbar and feed stack (though navbar will be fixed)
         Desktop: flex-row for the sidebar layout
      */}
      <div className="relative bg-black w-full min-h-screen flex flex-col md:flex-row overflow-x-hidden">

        {/* Sidebar / Bottom Bar */}
        <Navbar onNotificationsClick={() => setShowNotifications(true)}/>

        {/* Divider: Hidden on mobile */}
        <div className="hidden md:block w-px bg-zinc-800"></div>

        {/* Scrollable Feed: 
           Mobile: Full width (px-0), extra bottom padding (pb-20) to clear the bottom navbar.
           Desktop: Padding-x-6, normal bottom padding.
        */}
        <div className={`flex-1 overflow-y-auto h-screen px-0 md:px-6 py-4 md:py-8 z-10 
          ${showNotifications ? 'md:ml-[20%]' : ''} pb-20 md:pb-8`}>
          
          <div className="flex flex-col items-center gap-6">
            {data?.pages.flatMap((page) =>
              page.posts.map((post) => (
                /* POST CARD:
                   Mobile: w-full (full screen width)
                   Desktop: fixed w-[470px]
                */
                <div key={post.id} className="bg-black text-white w-full md:w-[470px] min-h-fit rounded-none md:rounded-md overflow-hidden font-sans border-b border-zinc-800 md:border-none pb-4">
                  
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3 w-full">
                      <img
                        src={post.profile_picture || '/default-profile.jpg'}
                        alt="user"
                        className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover"
                      />
                      <div className="flex items-center gap-2">
                        <span onClick={() => navigate(`/profile/${post.user_id}`)} className="font-semibold text-sm hover:cursor-pointer">
                          {post.username || `user_${post.user_id}`}
                        </span>
                        <span className="text-gray-400 text-xs">• {getPostAge(post.created_at)}</span>
                      </div>
                      <button onClick={() => setActivePostOptions({ postId: post.id, userId: post.user_id })} className='ml-auto'>
                        <BsThreeDots className="text-white w-5 h-5 cursor-pointer hover:text-gray-400" />
                      </button>
                    </div>
                  </div>

                  {/* Media: Removed fixed w/h, used aspect-square or object-contain for mobile flexibility */}
                  <div className="w-full bg-zinc-900 flex items-center justify-center overflow-hidden">
                    {post.media_type === 'image' ? (
                      <img src={post.media_url} alt="post" className="w-full h-auto max-h-[585px] object-cover" />
                    ) : post.media_type === 'video' ? (
                      <div className="w-full">
                        <VideoPlayer src={post.media_url} />
                      </div>
                    ) : null}
                  </div>

                  {/* Actions & Content: Padding added for mobile edge-to-edge look */}
                  <div className="px-4">
                    <div className="flex justify-between items-center py-3">
                      <div className="flex gap-4">
                        <CiHeart 
                          onClick={() => handleLikeToggle({ postId: post.id, alreadyLiked: post.liked_by_user })} 
                          className={`${post.liked_by_user ? 'text-red-500' : 'text-white'} w-7 h-7 cursor-pointer`} 
                        />
                        <Link to={`/post/${post.id}`}>
                          <IoChatbubbleOutline className="text-white w-7 h-7 cursor-pointer hover:text-gray-400" />
                        </Link>
                        <IoPaperPlaneSharp className="text-white w-7 h-7 cursor-pointer hover:text-gray-400" />
                      </div>
                    </div>

                    <div onClick={() => { setActivePostLikes({ postId: post.id, userId: post.user_id }) }} className='hover:cursor-pointer'>
                      <span className='block mb-1 font-bold text-sm'>{post.like_count} likes</span>
                    </div>

                    <div className="flex gap-2 items-baseline">
                      <span className="font-semibold text-sm">{post.username || `user_${post.user_id}`}</span>
                      <p className="text-white text-sm line-clamp-2">{post.description}</p>
                    </div>

                    <Link to={`/post/${post.id}`} className='w-full'>
                      <div className='mt-2 text-gray-400 text-sm hover:cursor-pointer'>
                        View all {post.comment_count} comments
                      </div>
                    </Link>

                    {/* Comment Input: Hidden on mobile to keep it clean (Instagram style) */}
                    <div className='hidden md:flex items-center mt-3 border-t border-zinc-900 pt-3'>
                      <form
                        onSubmit={(e) => handleSubmit(e, post.id)}
                        className='flex items-center gap-2 w-full'
                      >
                        <input 
                          type="text" 
                          placeholder='Add a comment...' 
                          className='bg-transparent outline-none text-sm w-full' 
                          ref={(el) => (commentInputRef.current[post.id] = el)} 
                        />
                      </form>
                    </div>
                  </div>
                </div>
              )))}
            
            {hasMore && (
              <div ref={observerRef} className="text-white pb-10">
                {isFetchingNextPage && <p className="text-xs text-gray-500">Loading more...</p>}
              </div>
            )}
          </div>
        </div>
      </div>
      {activePostOptions && (
        <div onClick={() => setActivePostOptions(null)} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-1000">
          <PostOptions activePostOptions={activePostOptions} setActivePostOptions={setActivePostOptions} />
        </div>
      )}
      {activePostLikes && (
        <Likes activePostLikes={activePostLikes} setActivePostLikes={setActivePostLikes} />
      )}
      {/*hasMore && <div ref={loaderRef} className="h-10 w-full" />*/}
    </>
  );
};

export default Home;