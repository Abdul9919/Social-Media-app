import React from 'react'
import Navbar from '../Navbar.jsx'
import { AuthContext } from '../../Contexts/AuthContext.jsx'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import VideoPlayer from '../VideoPlayer.jsx'
import Spinner from '../Spinner.jsx'
import { FaHeart, FaComment  } from "react-icons/fa";
import { useNavigate, useParams} from 'react-router-dom'

export const Profile = () => {
    const { id } = useParams()
    const apiUrl = import.meta.env.VITE_API_URL
    const navigate = useNavigate()

    const fetchUser = async () =>{
        try {
            const response = await axios.get(`${apiUrl}/api/users/${id}`, {});
            return response.data;
        } catch (error) {
            console.error('Error fetching user:', error);
            return null;
        }
    }

    const {data: user} = useQuery({
        queryKey: ['user', id],
        queryFn: fetchUser
    })
    //onsole.log(user)
    const fetchPosts = async () => {
        try {
            const response = await axios.get(`${apiUrl}/api/posts/user-posts/${id}`,{            
            });
            console.log(response.data)
            return response.data;
        } catch (error) {
            console.error('Error fetching posts:', error);
            return [];
        }
    }

    const { data: posts, isLoading, isError } = useQuery({
        queryKey: ['posts',id],
        queryFn: fetchPosts
    })

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
                                src={user.profile_picture || '/default-profile.jpg'}
                                alt="user"
                                className="w-[150px] h-[150px] rounded-full object-cover"
                            />
                        </div>
                        <div className='flex flex-col'>
                            <div className='flex gap-4'>
                                <h1 className="text-white text-2xl">{user.username}</h1>
                                <button className='w-[101px] h-[32px] font-bold rounded-md text-sm bg-zinc-800 hover:bg-zinc-700 hover:cursor-pointer'>Edit Profile</button>
                            </div>
                            <div className='flex gap-8 mt-6'>
                                <span className='text-zinc-400'><span className='font-bold text-white'>8</span> posts</span>
                                <span className='text-zinc-400'><span className='font-bold text-white'>100</span> followers</span>
                                <span className='text-zinc-400'><span className='font-bold text-white'>120</span> following</span>
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
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}