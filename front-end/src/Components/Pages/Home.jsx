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
      if (response.data.length > 0) {
        return { posts: response.data, nextPage: response.data.length < 3 ? undefined : pageParam + 1 }
      }

      /*if (response.data.length > 0) {
        setPosts(prev => [...prev, ...response.data]);
      }*/
    } catch (error) {
      console.error('Error fetching posts:', error);
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
      <div className="relative bg-black w-screen h-screen flex overflow-hidden">

        {/* Sidebar */}
        <Navbar/>

        {/* Divider */}
        <div className="w-px bg-zinc-800"></div>

        {/* Scrollable Feed */}
        <div className="flex-1 overflow-y-auto h-screen px-6 py-8">
          <div className="flex flex-col items-center gap-6">
            {data?.pages.flatMap((page) =>
              page.posts.map((post) => (
                <div key={post.id} className="bg-black text-white w-[470px] h-[846px] rounded-md overflow-hidden font-sans">
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 ">
                    <div className="flex items-center gap-3 min-w-[100%]">
                      <img
                        src={post.profile_picture || '/default-profile.jpg'}
                        alt="user"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex items-center gap-1">
                        <span onClick={() => navigate(`/profile/${post.user_id}`)} className="font-semibold text-sm hover:cursor-pointer">{post.username || `user_${post.user_id}`}</span>
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
                      <CiHeart onClick={() => handleLikeToggle({ postId: post.id, alreadyLiked: post.liked_by_user })} className={`${post.liked_by_user ? 'text-red-500' : 'text-white'} w-7 h-7 cursor-pointer ${post.liked_by_user ? null : 'hover:text-gray-400'}`} />
                      <Link to={`/post/${post.id}`}><IoChatbubbleOutline className="text-white w-7 h-7 cursor-pointer hover:text-gray-400" /></Link>
                      <IoPaperPlaneSharp className="text-white w-7 h-7 cursor-pointer hover:text-gray-400" />
                    </div>
                  </div>
                  <div onClick={() => { setActivePostLikes({ postId: post.id, userId: post.user_id }) }} className='hover:cursor-pointer'>
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
              )))}
            {hasMore && (
              <div ref={observerRef} className="text-white mt-4">
                {isFetchingNextPage && <p>Loading more...</p>}
              </div>
            )}
          </div>
        </div>
      </div>
      {activePostOptions && (
        <PostOptions activePostOptions={activePostOptions} setActivePostOptions={setActivePostOptions} />
      )}
      {activePostLikes && (
        <Likes activePostLikes={activePostLikes} setActivePostLikes={setActivePostLikes} />
      )}
      {/*hasMore && <div ref={loaderRef} className="h-10 w-full" />*/}
    </>
  );
};

export default Home;