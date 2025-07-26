import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { IoMdClose } from "react-icons/io";
import { CiHeart } from "react-icons/ci";
import { IoChatbubbleOutline, IoPaperPlaneSharp } from "react-icons/io5";
import { Link } from 'react-router-dom';
import { AuthContext } from '../Contexts/AuthContext';
import { BsThreeDots } from "react-icons/bs";
import { useMutation, useQueryClient, useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { useInView } from "react-intersection-observer";
import Spinner from './Spinner.jsx'
import { PostOptions } from './PostOptions.jsx';
import { Likes } from './Likes.jsx';

const Post = () => {
  const { id } = useParams();

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const apiUrl = import.meta.env.VITE_API_URL;

  //const [post, setPost] = useState(null);
  //const [comments, setComments] = useState([]);
  const [activePostOptions, setActivePostOptions] = useState(null);
  const [activePostLikes, setActivePostLikes] = useState(null)
  const commentRef = React.useRef();
  //const [page, setPage] = useState(1);
  //const [hasMore, setHasMore] = useState(true);
  // const loaderRef = useRef();
  const queryClient = useQueryClient();

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
    onSuccess: () => queryClient.invalidateQueries(['post', id]),
  });

  const fetchPost = async () => {
    const response = await axios.get(`${apiUrl}/api/posts/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data
  };

  const { data: post, isLoading, isError } = useQuery({
    queryKey: ['post', id],
    queryFn: fetchPost
  })


  const fetchComments = async ({ pageParam = 1 }) => {
    const response = await axios.get(`${apiUrl}/api/comments/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: {
        page: pageParam,
      },
    });
    const { comments } = response.data;
    const totalPages = response.data.totalPages
    const currentPage = pageParam

    return {
      comments,
      currentPage,
      nextPage: currentPage < totalPages ? pageParam + 1 : undefined,
      totalPages
    };
  };
  const { data, fetchNextPage,
    isFetchingNextPage, hasNextPage } = useInfiniteQuery({
      queryKey: ['comments', id],
      queryFn: fetchComments,
      initialPageParam: 1,
      getNextPageParam: (lastPage) => {
        return lastPage.totalPages !== lastPage.currentPage ? lastPage.nextPage : undefined
      }
    })

  const { ref, inView } = useInView({
    threshold: 0.1, // Trigger when 10% of the element is visible
  });

  useEffect(() => {
    if (
      inView &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      const lastPage = data?.pages[data.pages.length - 1];
      if (lastPage?.currentPage < lastPage?.totalPages) {
        fetchNextPage();
      }
    }
  }, [fetchNextPage, inView, isFetchingNextPage, hasNextPage, data]);




  const getCommentAge = (createdAt) => {
    const postDate = new Date(createdAt);
    const now = new Date();
    const diffInSeconds = Math.floor((now - postDate) / 1000);
    const hours = Math.floor(diffInSeconds / 3600);
    if (diffInSeconds < 60) {
      return `${diffInSeconds}s`;
    }
    else if (hours < 1) {
      return `${Math.floor(diffInSeconds / 60)}m`;
    }
    else if (hours < 24) {
      return `${Math.floor(hours)}h`;

    }
    else if (hours < 720) {
      return `${Math.floor(hours / 24)}d`;
    }
    else if (hours < 168) {
      return `${Math.floor(hours / 24 / 7)}w`;
    }
    else {
      return postDate.toLocaleDateString();
    }
  }

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
    onMutate: () => {
      commentRef.current.value = ''
    },
    onSuccess: () => {
      // ✅ Invalidate the specific query key to refetch fresh data
      queryClient.invalidateQueries(['comments', id]);
    }
  })

  const handleSubmit = async (e, postId) => {
    e.preventDefault()
    const comment = commentRef.current.value
    postComment({ postId, comment })
  }

  if (isLoading) {
    return (<Spinner />)
  }
  if (isError) {
    return <div>Error</div>
  }

  return (
    <>
      <div className="fixed  inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
        {/* Left: Post Media */}
        <div className="flex items-center">
          {post.media_type === 'image' ? (
            <img src={post.media_url} className="w-[678px] h-[678px] object-cover" />
          ) : (
            <video autoPlay loop className="w-[678px] h-[678px] object-cover">
              <source src={post.media_url} />
            </video>
          )}
        </div>

        {/* Right: Metadata and Comments */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-zinc-900 w-[405px] max-w-[700px] h-[678px] p-6 flex flex-col relative"
        >
          {/* Header */}
          <div className="flex items-center mb-4">
            <img src={post.profile_picture} alt="" className="w-[32px] h-[32px] rounded-full" />
            <h2 className="text-white font-semibold text-sm ml-4">{post.username}</h2>
            <div className='h-[3px] w-[3px] bg-white mx-2' ></div>
            <button className='text-blue-500 font-bold ml-2 hover:text-blue-300 hover:cursor-pointer'>Follow</button>
            <div className={`flex flex-1 text-gray-400 text-xs ml-auto `}>
              <button onClick={() => setActivePostOptions({ postId: post.id, userId: post.user_id })} className='ml-auto'>
                <BsThreeDots className="text-white w-5 h-5 cursor-pointer hover:text-gray-400" />
              </button>
            </div>
          </div>

          {/* Description */}
          <div className="flex items-center mb-4">
            <img src={post.profile_picture} alt="" className="w-[32px] h-[32px] rounded-full" />
            <h2 className="text-white font-semibold text-sm ml-4">{post.username}</h2>
            <p className="text-white ml-2">{post.description}</p>
          </div>

          {/* Scrollable Comments */}
          <div className="overflow-y-auto pr-2 mb-48 no-scrollbar w-full" style={{ height: 'calc(100% - 200px)' }}>
            {data?.pages?.flatMap((page) =>
              page.comments.map((comment) => (
                <div key={comment.id} className="py-4 flex gap-3 mr-6 w-full">
                  {/* Profile Picture */}
                  <img
                    src={comment.profile_picture}
                    alt=""
                    className="w-[32px] h-[32px] rounded-full flex-shrink-0"
                  />

                  {/* Comment Content */}
                  <div className="inline flex-col ">
                    <p className="text-left text-white text-sm leading-snug">
                      <span onClick={() => navigate(`/profile/${comment.user_id}`)} className="font-semibold inline-block mr-2 hover:cursor-pointer">{comment.username}</span>
                      <span className="inline align-top">{comment.content}</span>

                    </p>

                    <div className="flex items-center text-zinc-500 text-xs mt-1">
                      {getCommentAge(comment.created_at)}
                      <span className="ml-2">0 likes</span> {/* I NEED TO ADD A COMMENT LIKE_COUNT */}
                      <span className="ml-2 hover:cursor-pointer hover:text-zinc-300">Reply</span> {/* ALSO A REPLY FUNCTION*/}
                    </div>
                  </div>
                  <CiHeart className="flex ml-auto text-white min-w-4 min-h-4 w-4 h-4 cursor-pointer hover:text-red-500" /> {/*ALSO NEED TO ADD LIKES FOR COMMENTS MY GODDDDDDD*/}
                </div>
              )))}
            <div
              ref={ref}
              className="h-10 flex items-center justify-center text-white mt-4"
              style={{ minHeight: '40px' }}
            >
              {isFetchingNextPage ? (
                'Loading...'
              ) : (
                !data?.pages?.[0]?.comments?.length && <span>No comments yet</span>
              )}
            </div>
          </div>


          {/* Fixed Bottom Actions */}
          <div className="absolute bottom-0 left-0 right-0 bg-zinc-900 px-6 py-4 border-t border-zinc-700">
            {/* Like / Comment / Share Icons */}
            <div className="flex gap-4 mb-2">
              <CiHeart onClick={() => handleLikeToggle({ postId: post.id, alreadyLiked: post.liked_by_user })} className={`${post.liked_by_user ? 'text-red-500' : 'text-white'} w-7 h-7 cursor-pointer ${post.liked_by_user ? null : 'hover:text-gray-400'}`} />
              <IoChatbubbleOutline className="text-white w-7 h-7 cursor-pointer hover:text-gray-400" />
              <IoPaperPlaneSharp className="text-white w-7 h-7 cursor-pointer hover:text-gray-400" />
            </div>

            {/* Like Count */}
            <div onClick={() => { setActivePostLikes({ postId: post.id, userId: post.user_id }) }} className="flex items-center text-white text-sm font-bold mb-1 hover:cursor-pointer">
              {post.like_count} likes
            </div>

            {/* View All Comments */}
            <div className="flex items-center text-gray-400 text-sm hover:text-gray-300 block mb-2">
              {getCommentAge(post.created_at)} ago
            </div>

            {/* Comment Input */}
            <form onSubmit={(e) => handleSubmit(e, post.id)} className="flex items-center gap-2">
              <input
                type="text"
                className="outline-none bg-transparent border-none text-sm text-white w-full"
                ref={commentRef}
                placeholder="Add a comment..."
              />
            </form>
          </div>
        </div>


      </div>
      <div onClick={() => navigate(-1)} className="absolute top-4 right-4 text-white cursor-pointer z-50">
        <IoMdClose className='text-white text-4xl' />
      </div>
      {activePostOptions && (
        <PostOptions activePostOptions={activePostOptions} setActivePostOptions={setActivePostOptions} />
      )}
      {activePostLikes && (
        <Likes activePostLikes={activePostLikes} setActivePostLikes={setActivePostLikes} />
      )}
    </>
  );
};

export default Post;
