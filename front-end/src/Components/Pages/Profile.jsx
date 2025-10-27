import React from 'react'
import Navbar from '../Navbar.jsx'
import { AuthContext } from '../../Contexts/AuthContext.jsx'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import VideoPlayer from '../VideoPlayer.jsx'
import Spinner from '../Spinner.jsx'
import { FaHeart, FaComment  } from "react-icons/fa";
import { useNavigate, useParams} from 'react-router-dom'

export const Profile = () => {
    const { id } = useParams()
    const {user} = React.useContext(AuthContext)
    const token = localStorage.getItem('token')
    const apiUrl = import.meta.env.VITE_API_URL
    const navigate = useNavigate()
    const queryClient = useQueryClient();

    const fetchUser = async () =>{
        try {
            const response = await axios.get(`${apiUrl}/api/users/${id}`,{
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

    const {data: userProfile} = useQuery({
        queryKey: ['user', id],
        queryFn: fetchUser
    })
    const fetchPosts = async () => {
            const response = await axios.get(`${apiUrl}/api/posts/user-posts/${id}`,{
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
            
    }

    const { data: posts, isLoading, isError } = useQuery({
        queryKey: ['posts',id],
        queryFn: fetchPosts
    })

    const mutation = useMutation({
        mutationFn: async(id)=>{
                await axios.post(`${apiUrl}/api/follow/${id}`,{},{
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['user', id])
        }
    })

    const handleSubmit = (id) =>{
        mutation.mutate(id)
    }

    const unfollowMutation = useMutation({
        mutationKey: ['unfollow'],
        mutationFn: async(id)=>{
                await axios.delete(`${apiUrl}/api/follow/${id}`,{
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['user', id])
        }
    })

    const handleunFollow = (id) =>{
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
            <div className="relative bg-black w-screen h-screen flex overflow-hidden">
                <Navbar />
                <div className="w-px bg-zinc-800"></div>
                <div className="w-full h-full mr-[13%] ml-[13%] px-[20px] pt-[35px]">
                    <div className='flex ml-[5%] mr-[5%]'>
                        <div className='w-[270px] h-[175px]'>
                            <img
                                src={userProfile?.profile_picture || '/default-profile.jpg'}
                                alt="user"
                                className="w-[150px] h-[150px] rounded-full object-cover"
                            />
                        </div>
                        <div className='flex flex-col'>
                            <div className='flex gap-4'>
                                <h1 className="text-white text-2xl">{userProfile?.username}</h1>
                                {userProfile?.id === user.id ? <button className='w-[101px] h-[32px] font-bold rounded-md text-sm bg-zinc-800 hover:bg-zinc-700 hover:cursor-pointer'>Edit Profile</button> : 
                                 userProfile?.is_following && userProfile?.id !== user.id ? <button onClick={() => handleunFollow(userProfile?.id)} className='bg-zinc-800 text-white text-sm font-bold px-5 py-2 rounded-md hover:bg-zinc-700 hover:cursor-pointer transition duration-300 ease-in-out'>Following</button> : <button onClick={() => handleSubmit(userProfile?.id)} className='bg-blue-600 text-white text-sm font-bold px-5 py-2 rounded-md hover:bg-blue-700 hover:cursor-pointer transition duration-300 ease-in-out'>Follow</button>}
                            </div>
                            <div className='flex gap-8 mt-6'>
                                <span className='text-zinc-400'><span className='font-bold text-white'>{userProfile?.post_count}</span> posts</span>
                                <span className='text-zinc-400'><span className='font-bold text-white'>{userProfile?.follower_count}</span> followers</span>
                                <span className='text-zinc-400'><span className='font-bold text-white'>{userProfile?.following_count}</span> following</span>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className='relative w-full h-full grid grid-cols-3 gap-7'>
                            {posts?.map((post) => (
                                <div onClick={()=> navigate(`/post/${post.post_id}`)} key={post.post_id} className="relative group w-[306px] h-[408px] overflow-hidden hover:cursor-pointer">
                                    {post.media_type === 'image' ? (
                                        <img
                                            src={post.media_url}
                                            alt=""
                                            className="w-full h-full object-cover transition-opacity duration-200 group-hover:opacity-60"
                                        />
                                    ) : (
                                        <VideoPlayer
                                            src={post.media_url}
                                            className="w-full h-full object-cover transition-opacity duration-200 group-hover:opacity-60"
                                        />
                                    )}

                                    {/* Overlay on hover */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/30">
                                        <div className="text-white font-semibold text-lg flex gap-4">
                                            <span className="flex items-center gap-1">
                                                <FaHeart/>  {post.likeCount || 0}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <FaComment /> {post.comment_count || 0}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {posts?.length === 0 && <div className="text-white flex items-center justify-center text-xl">No posts to show</div>}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}