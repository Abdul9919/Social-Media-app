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
import { useContext } from 'react';

const Post = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
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

  const { mutate: handleCommentLikeToggle } = useMutation({
    mutationKey: ['toggleCommentLike'],
    mutationFn: async ({ commentId }) => {
      // Single POST endpoint for both liking and unliking
      return await axios.post(
        `${apiUrl}/api/likes/comments/${commentId}`,
        {postId: id},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    },
    onMutate: async ({ commentId, alreadyLiked }) => {
      await queryClient.cancelQueries(['comments', id]);
      const previousComments = queryClient.getQueryData(['comments', id]);

      queryClient.setQueryData(['comments', id], (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            comments: page.comments.map((comment) => {
              if (comment.id === commentId) {
                return {
                  ...comment,
                  // Toggle the "red heart" state immediately
                  liked_by_user: !alreadyLiked,
                  // Increment or decrement the number immediately
                  likes: alreadyLiked ? Math.max(0, comment.likes - 1) : comment.likes + 1,
                };
              }
              return comment;
            }),
          })),
        };
      });

      return { previousComments };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['comments', id], context.previousComments);
    },
    onSettled: () => {
      queryClient.invalidateQueries(['comments', id]);
    },
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

  const mutation = useMutation({
    mutationFn: async (id) => {
      await axios.post(`${apiUrl}/api/follow/${id}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['user', id])
    }
  })

  const handleFollow = (id) => {
    mutation.mutate(id)
  }

  if (isLoading) {
    return (<Spinner />)
  }
  if (isError) {
    return <div>Error</div>
  }

  return (
    <>
  {/* Modal Overlay: 
      On mobile, we make it a full-screen view. 
      On desktop, it remains a centered modal with a backdrop. */}
  <div className="fixed inset-0 bg-black md:bg-black/80 flex flex-col md:flex-row items-center justify-center z-50 overflow-y-auto md:overflow-hidden">
    
    {/* Close Button: 
        On mobile, it needs to be clearly visible at the top. */}
    <div 
      onClick={() => navigate(-1)} 
      className="absolute top-4 right-4 text-white cursor-pointer z-[60] hover:opacity-70"
    >
      <IoMdClose className='text-3xl md:text-4xl' />
    </div>

    {/* CONTAINER: Wraps both Media and Comments */}
    <div className="flex flex-col md:flex-row w-full max-w-none md:max-w-[1083px] bg-black md:bg-transparent min-h-screen md:min-h-0">
      
      {/* Left (Top on Mobile): Post Media */}
      <div className="w-full md:w-[678px] aspect-square md:h-[678px] flex items-center bg-black">
        {post.media_type === 'image' ? (
          <img src={post.media_url} className="w-full h-full object-contain md:object-cover" alt="post" />
        ) : (
          <video autoPlay loop muted className="w-full h-full object-contain md:object-cover">
            <source src={post.media_url} />
          </video>
        )}
      </div>

      {/* Right (Bottom on Mobile): Metadata and Comments */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-black md:bg-zinc-900 w-full md:w-[405px] h-full md:h-[678px] flex flex-col relative border-t border-zinc-800 md:border-t-0"
      >
        {/* Header: Fixed at top of comment section */}
        <div className="flex items-center p-4 md:p-6 border-b border-zinc-800 md:border-none">
          <img src={post.profile_picture} alt="" className="w-8 h-8 rounded-full object-cover" />
          <h2 onClick={() => navigate(`/profile/${post.user_id}`)} className="text-white font-semibold text-sm ml-4 hover:cursor-pointer">
            {post.username}
          </h2>
          <div className='h-[3px] w-[3px] bg-white mx-2 rounded-full hidden md:block' ></div>
          {post?.is_following && post.user_id === user.id ? null : (
            <button onClick={() => handleFollow(post.user_id)} className='text-blue-500 font-bold text-sm ml-2 hover:text-blue-300'>
              Follow
            </button>
          )}
          <button onClick={() => setActivePostOptions({ postId: post.id, userId: post.user_id })} className='ml-auto'>
            <BsThreeDots className="text-white w-5 h-5 cursor-pointer" />
          </button>
        </div>

        {/* Scrollable Comments Area */}
        <div className="flex-1 overflow-y-auto px-4 md:px-6 no-scrollbar pb-[180px] md:pb-0">
          {/* Post Description (Only visible in comments area on Desktop) */}
          <div className="hidden md:flex items-start mb-6 pt-2">
            <img src={post.profile_picture} alt="" className="w-8 h-8 rounded-full flex-shrink-0 object-cover" />
            <div className="ml-4">
              <span className="text-white font-semibold text-sm mr-2">{post.username}</span>
              <span className="text-white text-sm">{post.description}</span>
            </div>
          </div>

          {/* Map Comments */}
          {data?.pages?.flatMap((page) =>
            page.comments.map((comment) => (
              <div key={comment.id} className="py-3 flex gap-3 w-full">
                <img src={comment.profile_picture} alt="" className="w-8 h-8 rounded-full flex-shrink-0 object-cover" />
                <div className="flex flex-col flex-1">
                  <p className="text-white text-sm">
                    <span onClick={() => navigate(`/profile/${comment.user_id}`)} className="font-semibold mr-2 hover:cursor-pointer">
                      {comment.username}
                    </span>
                    {comment.content}
                  </p>
                  <div className="flex items-center text-zinc-500 text-xs mt-1 gap-3">
                    <span>{getCommentAge(comment.created_at)}</span>
                    <span className="font-semibold cursor-pointer">{comment.likes} likes</span>
                    <span className="font-semibold cursor-pointer">Reply</span>
                  </div>
                </div>
                <CiHeart 
                  onClick={() => handleCommentLikeToggle({ commentId: comment.id, alreadyLiked: comment.liked_by_user })}
                  className={`w-4 h-4 cursor-pointer mt-1 ${comment.liked_by_user ? 'text-red-500' : 'text-zinc-500'}`} 
                />
              </div>
            ))
          )}

          <div ref={ref} className="py-4 text-center text-zinc-500 text-xs">
            {isFetchingNextPage ? 'Loading...' : !data?.pages?.[0]?.comments?.length && 'No comments yet.'}
          </div>
        </div>

        {/* Fixed Bottom Actions (Input/Likes) */}
        <div className="absolute bottom-0 left-0 right-0 bg-black md:bg-zinc-900 p-4 md:px-6 md:py-4 border-t border-zinc-800">
          <div className="flex gap-4 mb-3">
            <CiHeart 
              onClick={() => handleLikeToggle({ postId: post.id, alreadyLiked: post.liked_by_user })} 
              className={`${post.liked_by_user ? 'text-red-500' : 'text-white'} w-7 h-7 cursor-pointer`} 
            />
            <IoChatbubbleOutline className="text-white w-7 h-7 cursor-pointer" />
            <IoPaperPlaneSharp className="text-white w-7 h-7 cursor-pointer" />
          </div>

          <div 
            onClick={() => setActivePostLikes({ postId: post.id, userId: post.user_id })} 
            className="text-white text-sm font-bold mb-1 cursor-pointer"
          >
            {post.like_count} likes
          </div>

          <div className="text-zinc-500 text-[10px] uppercase mb-3">
            {getCommentAge(post.created_at)}
          </div>

          <form onSubmit={(e) => handleSubmit(e, post.id)} className="flex items-center gap-2 border-t border-zinc-800 pt-3">
            <input
              type="text"
              className="bg-transparent border-none text-sm text-white w-full outline-none"
              ref={commentRef}
              placeholder="Add a comment..."
            />
          </form>
        </div>
      </div>
    </div>
  </div>

  {/* Other Modals */}
  {activePostOptions && <PostOptions activePostOptions={activePostOptions} setActivePostOptions={setActivePostOptions} />}
  {activePostLikes && <Likes activePostLikes={activePostLikes} setActivePostLikes={setActivePostLikes} />}
</>
  );
};

export default Post;
