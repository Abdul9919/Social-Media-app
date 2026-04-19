import React from 'react'
import Navbar from '../Navbar.jsx'
import { AuthContext } from '../../Contexts/AuthContext.jsx'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import VideoPlayer from '../VideoPlayer.jsx'
import Spinner from '../Spinner.jsx'
import { FaHeart, FaComment } from "react-icons/fa";
import { useNavigate, useParams } from 'react-router-dom'
import EditProfile from '../EditProfile.jsx'
import SuccessToast from '../SuccessToast.jsx';

export const Profile = () => {
    const { id } = useParams()
    const { user } = React.useContext(AuthContext)
    const token = localStorage.getItem('token')
    const apiUrl = import.meta.env.VITE_API_URL
    const navigate = useNavigate()
    const queryClient = useQueryClient();
    const [isEditing, setIsEditing] = React.useState(false)
    const [successToast, setSuccessToast] = React.useState(false)

    const fetchUser = async () => {
        try {
            const response = await axios.get(`${apiUrl}/api/users/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching user:', error);
            return null;
        }
    }

    const { data: userProfile } = useQuery({
        queryKey: ['user', id],
        queryFn: fetchUser
    })
    const fetchPosts = async () => {
        const response = await axios.get(`${apiUrl}/api/posts/user-posts/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;

    }

    const { data: posts, isLoading, isError } = useQuery({
        queryKey: ['posts', id],
        queryFn: fetchPosts
    })

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

    const handleSubmit = (id) => {
        mutation.mutate(id)
    }

    const unfollowMutation = useMutation({
        mutationKey: ['unfollow'],
        mutationFn: async (id) => {
            await axios.delete(`${apiUrl}/api/follow/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['user', id])
        }
    })

    const handleunFollow = (id) => {
        unfollowMutation.mutate(id)
    }

    if (isLoading) {
        return <div><Spinner /></div>
    }
    if (isError) {
        return <div>Error getting posts</div>
    }
    return (
        <>
    {/* 1. Main Container: Changed to flex-col on mobile, flex-row on desktop */}
    <div className="relative bg-black w-full min-h-screen flex flex-col md:flex-row overflow-x-hidden text-white">
        <Navbar />
        
        {/* Divider: Hidden on mobile */}
        <div className="hidden md:block w-px bg-zinc-800"></div>

        {/* 2. Content Area: Removed fixed horizontal margins on mobile */}
        <div className="flex-1 h-full md:mx-[10%] lg:mx-[13%] px-0 md:px-[20px] pt-4 md:pt-[35px] pb-20 md:pb-0">
            {successToast && <SuccessToast />}

            {/* 3. Profile Header: Responsive layout */}
            <div className='flex flex-col md:flex-row items-center md:items-start px-4 md:px-0 md:ml-[5%] md:mr-[5%] mb-8'>
                
                {/* Profile Picture Container */}
                <div className='flex md:w-[270px] justify-center md:justify-start mb-4 md:mb-0'>
                    <img
                        src={userProfile?.profile_picture || '/default-profile.jpg'}
                        alt="user"
                        className="w-20 h-20 md:w-[150px] md:h-[150px] rounded-full object-cover border border-zinc-800"
                    />
                </div>

                {/* Profile Info */}
                <div className='flex flex-col flex-1 w-full'>
                    {/* Username and Edit/Follow Action */}
                    <div className='flex items-center gap-4 mb-6'>
                        <h1 className="text-xl md:text-2xl font-light">{userProfile?.username}</h1>
                        <div className="hidden md:block">
                            {userProfile?.id === user.id ? (
                                <button onClick={() => setIsEditing(true)} className='px-4 py-1.5 font-bold rounded-md text-sm bg-zinc-800 hover:bg-zinc-700 transition'>Edit Profile</button>
                            ) : (
                                userProfile?.is_following ? (
                                    <button onClick={() => handleunFollow(userProfile?.id)} className='bg-zinc-800 px-5 py-1.5 rounded-md text-sm font-bold'>Following</button>
                                ) : (
                                    <button onClick={() => handleSubmit(userProfile?.id)} className='bg-blue-600 px-5 py-1.5 rounded-md text-sm font-bold'>Follow</button>
                                )
                            )}
                        </div>
                    </div>

                    {/* Mobile Action Button (Full width) */}
                    <div className="md:hidden w-full mb-6">
                        {userProfile?.id === user.id ? (
                            <button onClick={() => setIsEditing(true)} className='w-full py-1.5 font-bold rounded-md text-sm bg-zinc-800'>Edit Profile</button>
                        ) : (
                            userProfile?.is_following ? (
                                <button onClick={() => handleunFollow(userProfile?.id)} className='w-full bg-zinc-800 py-1.5 rounded-md text-sm font-bold'>Following</button>
                            ) : (
                                <button onClick={() => handleSubmit(userProfile?.id)} className='w-full bg-blue-600 py-1.5 rounded-md text-sm font-bold'>Follow</button>
                            )
                        )}
                    </div>

                    {/* Stats */}
                    <div className='flex justify-around md:justify-start border-t border-b border-zinc-800 md:border-none py-3 md:py-0 md:gap-10 md:mt-2'>
                        <div className='flex flex-col md:flex-row items-center md:gap-1'>
                            <span className='font-bold text-white'>{userProfile?.post_count}</span>
                            <span className='text-zinc-400 text-sm'>posts</span>
                        </div>
                        <div className='flex flex-col md:flex-row items-center md:gap-1'>
                            <span className='font-bold text-white'>{userProfile?.follower_count}</span>
                            <span className='text-zinc-400 text-sm'>followers</span>
                        </div>
                        <div className='flex flex-col md:flex-row items-center md:gap-1'>
                            <span className='font-bold text-white'>{userProfile?.following_count}</span>
                            <span className='text-zinc-400 text-sm'>following</span>
                        </div>
                    </div>

                    {/* Bio */}
                    <div className='mt-4 text-sm px-4 md:px-0'>
                        <span className="block font-semibold mb-1">{userProfile?.full_name}</span>
                        <p className="whitespace-pre-wrap">{userProfile?.bio}</p>
                    </div>
                </div>
            </div>

            {/* 4. Post Grid: Removed fixed pixel widths */}
            <div className='border-t border-zinc-800 md:border-none'>
                <div className='grid grid-cols-3 gap-1 md:gap-7'>
                    {posts?.map((post) => (
                        <div 
                            onClick={() => navigate(`/post/${post.post_id}`)} 
                            key={post.post_id} 
                            className="relative group aspect-square w-full overflow-hidden hover:cursor-pointer"
                        >
                            {post.media_type === 'image' ? (
                                <img
                                    src={post.media_url}
                                    alt=""
                                    className="w-full h-full object-cover transition-opacity duration-200 group-hover:opacity-60"
                                />
                            ) : (
                                <div className="w-full h-full">
                                    <VideoPlayer
                                        src={post.media_url}
                                        className="w-full h-full object-cover transition-opacity duration-200 group-hover:opacity-60"
                                    />
                                </div>
                            )}

                            {/* Overlay on hover: Visible on desktop, usually hidden on mobile touch */}
                            <div className="absolute inset-0 hidden md:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/30">
                                <div className="text-white font-semibold text-lg flex gap-4">
                                    <span className="flex items-center gap-1">
                                        <FaHeart /> {post.likeCount || 0}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <FaComment /> {post.comment_count || 0}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                
                {posts?.length === 0 && (
                    <div className="text-zinc-500 flex flex-col items-center justify-center mt-20">
                        <div className="border-2 border-zinc-500 p-4 rounded-full mb-4">
                           {/* Add an icon here if desired */}
                        </div>
                        <p className="text-2xl font-bold text-white">No posts yet</p>
                    </div>
                )}
            </div>
        </div>
    </div>

    {isEditing && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-[1001] p-4'>
            <EditProfile setIsEditing={setIsEditing} setSuccessToast={setSuccessToast} />
        </div>
    )}
</>
    )
}