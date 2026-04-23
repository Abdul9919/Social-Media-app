import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { IoMdClose } from "react-icons/io";
import { CiHeart } from "react-icons/ci";
import { IoChatbubbleOutline, IoPaperPlaneSharp } from "react-icons/io5";
import { AuthContext } from '../Contexts/AuthContext';
import { BsThreeDots } from "react-icons/bs";
import { useMutation, useQueryClient, useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from "react-intersection-observer";
import Spinner from './Spinner.jsx';
import { PostOptions } from './PostOptions.jsx';
import { Likes } from './Likes.jsx';
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

const Post = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const apiUrl = import.meta.env.VITE_API_URL;

    const [activePostOptions, setActivePostOptions] = useState(null);
    const [activePostLikes, setActivePostLikes] = useState(null);
    const commentRef = React.useRef();
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!id) return;

        const recordView = async () => {
            // Only fire if the user is actually looking at the tab
            if (document.visibilityState === 'visible') {
                try {
                    await axios.post(`${apiUrl}/api/posts/view`,
                        { postId: id },
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    console.log("View heartbeat recorded");
                } catch (error) {
                    console.error("Error tracking view:", error);
                }
            }
        };

        // The timer starts now, but the first execution happens in 5 seconds
        const interval = setInterval(recordView, 5000);

        // Cleanup: stops the timer when the user navigates away or closes the post
        return () => clearInterval(interval);
    }, [id, apiUrl, token]);

    const { mutate: handleLikeToggle } = useMutation({
        mutationKey: ['toggleLike'],
        mutationFn: async ({ postId, alreadyLiked }) => {
            if (alreadyLiked) {
                return await axios.delete(`${apiUrl}/api/likes/${postId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                return await axios.post(`${apiUrl}/api/likes/${postId}`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
        },
        onSuccess: () => queryClient.invalidateQueries(['post', id]),
    });

    const { mutate: handleCommentLikeToggle } = useMutation({
        mutationKey: ['toggleCommentLike'],
        mutationFn: async ({ commentId }) => {
            return await axios.post(
                `${apiUrl}/api/likes/comments/${commentId}`,
                { postId: id },
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
                                    liked_by_user: !alreadyLiked,
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
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    };

    const { data: post, isLoading, isError } = useQuery({
        queryKey: ['post', id],
        queryFn: fetchPost
    });

    const fetchComments = async ({ pageParam = 1 }) => {
        const response = await axios.get(`${apiUrl}/api/comments/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { page: pageParam },
        });
        const { comments, totalPages } = response.data;
        return {
            comments,
            currentPage: pageParam,
            nextPage: pageParam < totalPages ? pageParam + 1 : undefined,
            totalPages
        };
    };

    const { data, fetchNextPage, isFetchingNextPage, hasNextPage } = useInfiniteQuery({
        queryKey: ['comments', id],
        queryFn: fetchComments,
        initialPageParam: 1,
        getNextPageParam: (lastPage) => lastPage.nextPage,
    });

    const { ref, inView } = useInView({ threshold: 0.1 });

    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

    const getCommentAge = (createdAt) => {
        const postDate = new Date(createdAt);
        const now = new Date();
        const diffInSeconds = Math.floor((now - postDate) / 1000);
        const hours = Math.floor(diffInSeconds / 3600);
        if (diffInSeconds < 60) return `${diffInSeconds}s`;
        if (hours < 1) return `${Math.floor(diffInSeconds / 60)}m`;
        if (hours < 24) return `${Math.floor(hours)}h`;
        if (hours < 720) return `${Math.floor(hours / 24)}d`;
        return postDate.toLocaleDateString();
    };

    const { mutateAsync: postComment } = useMutation({
        mutationKey: ['comment'],
        mutationFn: async ({ postId, comment }) => {
            return await axios.post(`${apiUrl}/api/comments/${postId}`, {
                content: comment
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
        },
        onMutate: () => { commentRef.current.value = ''; },
        onSuccess: () => { queryClient.invalidateQueries(['comments', id]); }
    });

    const handleSubmit = async (e, postId) => {
        e.preventDefault();
        const comment = commentRef.current.value;
        if (comment) postComment({ postId, comment });
    };

    const mutation = useMutation({
        mutationFn: async (userId) => {
            await axios.post(`${apiUrl}/api/follow/${userId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
        },
        onSuccess: () => { queryClient.invalidateQueries(['user', id]); }
    });

    const handleFollow = (userId) => {
        mutation.mutate(userId);
    };

    const getAdjacentPostIds = () => {
        const cachedData = queryClient.getQueryData(['explore']);
        if (!cachedData) return { prevId: null, nextId: null };

        const allPosts = cachedData.pages.flatMap(page => page.posts);
        const numericId = Number(id);
        const currentIndex = allPosts.findIndex(p => p.id === numericId);

        if (currentIndex === -1) return { prevId: null, nextId: null };

        return {
            prevId: currentIndex > 0 ? allPosts[currentIndex - 1].id : null,
            nextId: currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1].id : null
        };
    };

    const { prevId, nextId } = getAdjacentPostIds();
    const handleRemoteLoad = () => {
        // 1. Grab the internal query object from the cache
        const query = queryClient.getQueryCache().find(['explore']);

        // 2. If it exists, trigger the fetch
        if (query) {
            // This tells React Query to execute the fetch function for the next page
            query.fetchNextPage();
        }
    };

    const goToPost = (targetId) => {
        if (targetId) navigate(`/post/${targetId}`);
        if (!targetId) handleRemoteLoad();
    };

    if (isLoading) return <Spinner />;
    if (isError) return <div>Error</div>;

    return (
        <>
            <div className="fixed inset-0 bg-black md:bg-black/80 flex flex-col md:flex-row items-center justify-center z-50 overflow-y-auto md:overflow-hidden">
                {prevId && (
                    <button
                        onClick={() => goToPost(prevId)}
                        // Change 'hidden md:block' to 'block'
                        className="fixed left-2 top-1/2 -translate-y-1/2 z-[60] p-1 bg-black/40 md:bg-white/10 hover:bg-white/20 rounded-full transition-all block"
                    >
                        <IoIosArrowBack className="text-white text-2xl md:text-3xl" />
                    </button>
                )}

                {/* Next Button */}
                {nextId && (
                    <button
                        onClick={() => goToPost(nextId)}
                        // Change 'hidden md:block' to 'block'
                        className="fixed right-2 top-1/2 -translate-y-1/2 z-[60] p-1 bg-black/40 md:bg-white/10 hover:bg-white/20 rounded-full transition-all block"
                    >
                        <IoIosArrowForward className="text-white text-2xl md:text-3xl" />
                    </button>
                )}

                <div
                    onClick={() => navigate(-1)}
                    className="absolute top-4 right-4 text-white cursor-pointer z-[60] hover:opacity-70"
                >
                    <IoMdClose className='text-3xl md:text-4xl' />
                </div>

                <div className="flex flex-col md:flex-row w-full max-w-none md:max-w-[1083px] bg-black md:bg-transparent min-h-screen md:min-h-0">
                    <div key={post.id} className="w-full md:w-[678px] aspect-square md:h-[678px] flex items-center bg-black">
                        {post.media_type === 'image' ? (
                            <img src={post.media_url} className="w-full h-full object-contain md:object-cover" alt="post" />
                        ) : (
                            <video autoPlay loop className="w-full h-full object-contain md:object-cover">
                                <source src={post.media_url} />
                            </video>
                        )}
                    </div>

                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="bg-black md:bg-zinc-900 w-full md:w-[405px] h-full md:h-[678px] flex flex-col relative border-t border-zinc-800 md:border-t-0"
                    >
                        <div className="flex items-center p-4 md:p-6 border-b border-zinc-800 md:border-none">
                            <img src={post.profile_picture} alt="" className="w-8 h-8 rounded-full object-cover" />
                            <h2 onClick={() => navigate(`/profile/${post.user_id}`)} className="text-white font-semibold text-sm ml-4 hover:cursor-pointer">
                                {post.username}
                            </h2>
                            <div className='h-[3px] w-[3px] bg-white mx-2 rounded-full hidden md:block'></div>
                            {(post?.is_following || post.user_id === user.id) ? null : (
                                <button onClick={() => handleFollow(post.user_id)} className='text-blue-500 font-bold text-sm ml-2 hover:text-blue-300'>
                                    Follow
                                </button>
                            )}
                            <button onClick={() => setActivePostOptions({ postId: post.id, userId: post.user_id })} className='ml-auto'>
                                <BsThreeDots className="text-white w-5 h-5 cursor-pointer" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-4 md:px-6 no-scrollbar pb-[180px] md:pb-0">
                            <div className="hidden md:flex items-start mb-6 pt-2">
                                <img src={post.profile_picture} alt="" className="w-8 h-8 rounded-full flex-shrink-0 object-cover" />
                                <div className="ml-4">
                                    <span className="text-white font-semibold text-sm mr-2">{post.username}</span>
                                    <span className="text-white text-sm">{post.description}</span>
                                </div>
                            </div>

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

            {activePostOptions && <PostOptions activePostOptions={activePostOptions} setActivePostOptions={setActivePostOptions} />}
            {activePostLikes && <Likes activePostLikes={activePostLikes} setActivePostLikes={setActivePostLikes} />}
        </>
    );
};

export default Post;