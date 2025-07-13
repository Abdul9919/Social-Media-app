import React, { useEffect, useState, useRef, useCallback } from 'react'
import { IoMdClose } from "react-icons/io";
import axios from 'axios'

export const Likes = ({ activePostLikes, setActivePostLikes }) => {
    const [users, setUsers] = useState([])
    const apiUrl = import.meta.env.VITE_API_URL
    const postId = activePostLikes.postId
    const token = localStorage.getItem('token')
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true);
    const loaderRef = useRef();
    const fetchUsers = async (pageNumber) => {
        try {
            const response = await axios.get(`${apiUrl}/api/likes/${postId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                params: {
                    page: pageNumber,
                },
            })
            if (response.data.length < 5) {
                setHasMore(false);
            }

            if (response.data.length > 0) {
                setUsers(prev => [...prev, ...response.data]);
            }
        } catch (error) {
            console.log(error.message)
        }
    }

    useEffect(() => {
        if (hasMore) fetchUsers(page)
        
    }, [page])

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

    return (
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setActivePostLikes(null)} // Close on outside click
        >
            <div
                className="flex flex-col items-center bg-zinc-800 text-white rounded-4xl shadow-lg w-[560px] h-[413px]"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
            >
                <div className='flex justify-center min-w-full my-4 ml-4'>
                    <IoMdClose onClick={() => setActivePostLikes(null)} className='text-4xl ml-2 hover:cursor-pointer' />
                    <h1 className='font-bold text-lg ml-auto min-w-[55%] mt-2'>Likes</h1>
                </div>
                <div className='flex-grow max-h-px min-w-[100%] bg-zinc-700'></div>
                <div className='flex flex-col min-w-full overflow-y-auto'>
                    {users?.map((user, index) => (
                        <div ref={index === users.length - 1 ? lastPostRef : null} key={user.user_id} className='flex items-center ml-4 my-2 gap-2'>
                            <img
                                src={user.profile_picture || '/default-profile.jpg'}
                                alt="user"
                                className="w-12 h-12 rounded-full object-cover"
                            />
                            <span className='font-sans mb-1'>{user.username}</span>
                            <button className='text-white font-bold mr-4 bg-blue-500 px-4 py-2 rounded-lg hover:text-white transition duration-300 ease-in-out text-sm ml-auto '>Follow</button>
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
    )
}
