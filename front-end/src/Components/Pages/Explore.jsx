import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar';
import Spinner from '../Spinner';
import { useContext } from 'react';
import {AuthContext} from '../../Contexts/AuthContext';

const Explore = () => {
  const token = localStorage.getItem('token');
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const {user} = useContext(AuthContext);
  const navigate = useNavigate();

  const fetchExploreFeed = async () => {
    const response = await axios.get(`${apiUrl}/api/posts/feed`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  };

  const { data: posts, isLoading, isError } = useQuery({
    queryKey: ['explore-feed', user?.id],
    queryFn: fetchExploreFeed,
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) return <Spinner />;
  if (isError) return <div className="text-white text-center p-10">Failed to load feed.</div>;

  return (
    /* 1. h-screen: Locks the main container to the height of the screen.
       2. overflow-hidden: Prevents the whole body from scrolling.
    */
    <div className="flex flex-col md:flex-row h-screen w-full bg-black overflow-hidden">
      
      {/* Navbar Container 
          On mobile, this stays at the top/bottom. 
          On desktop, it takes its natural width but stays fixed because the parent is h-screen.
      */}
      <Navbar />

      {/* Vertical Divider */}
      <div className="hidden md:block w-px bg-zinc-800 h-full"></div>

      {/* Main Content Area
          1. flex-1: Takes up the remaining width.
          2. overflow-y-auto: This creates the independent scroll wheel for the feed.
          3. no-scrollbar: (Optional) if you want that clean look.
      */}
      <main className="flex-1 h-full overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-3 grid-flow-dense auto-rows-[150px] md:auto-rows-[300px] gap-1">
          {posts?.map((post, index) => {
            const isFeatured = index % 10 === 2;

            return (
              <div
                key={post.id}
                onClick={() => navigate(`/post/${post.id}`)}
                className={`relative overflow-hidden group bg-zinc-900 cursor-pointer hover:opacity-90 transition-opacity
                  ${isFeatured ? 'col-span-2 row-span-2' : 'col-span-1 row-span-1'}`}
              >
                {post.media_type === 'video' ? (
                  <video
                    src={post.media_url}
                    className="w-full h-full object-cover"
                    muted
                    loop
                    onMouseOver={(e) => e.target.play()}
                    onMouseOut={(e) => {
                        e.target.pause();
                        e.target.currentTime = 0;
                    }}
                    playsInline
                  />
                ) : (
                  <img
                    src={post.media_url}
                    alt={post.description}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                )}
                
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-4 font-bold">
                    <span>❤️ {post.like_count || 0}</span>
                    <span>💬 {post.comment_count || 0}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="py-10 text-center text-zinc-500 text-xs">
          You've caught up with all the latest interests.
        </div>
      </main>
    </div>
  );
};

export default Explore;