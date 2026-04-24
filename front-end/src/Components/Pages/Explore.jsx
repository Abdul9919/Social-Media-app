import React from 'react';
// import { useInfiniteQuery } from '@tanstack/react-query';
// import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar';
import Spinner from '../Spinner';
import {  useEffect } from 'react';
import { AuthContext } from '../../Contexts/AuthContext';
import { useInView } from 'react-intersection-observer';
import Post from '../Post';
import { usePostFeed } from '../../hooks/usePostFeed';

const Explore = () => {
  // const token = localStorage.getItem('token');
  // const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  // const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  // const [posts, setPosts] = useState([]);

  const { ref, inView } = useInView();
  const { data,
    status,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = usePostFeed();


  // const fetchExploreFeed = async ({pageParam = 1}) => {
  //   console.log(pageParam)
  //       const response = await axios.get(`${apiUrl}/api/posts/feed?page=${pageParam}`, {
  //         headers: { Authorization: `Bearer ${token}` }
  //       });
  //       // console.log('fetchingg')
  //       return response.data;

  //   };
  // = useInfiniteQuery({
  //   queryKey: ['explore'],
  //   queryFn: fetchExploreFeed,
  //   initialPageParam: 1,
  //   getNextPageParam: (lastPage) => {
  //     if (lastPage.nextPage && lastPage.nextPage !== 0) {
  //           return lastPage.nextPage;
  //       }
  //       return undefined;
  //   }
  // });

    useEffect(() => {
    // Only fetch if the element is in view AND there is actually a next page
    if (inView && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
    }
}, [inView, fetchNextPage, hasNextPage, isFetchingNextPage]);

  // const fetchExploreFeed = async () => {
  //   const response = await axios.get(`${apiUrl}/api/posts/feed`, {
  //     headers: { Authorization: `Bearer ${token}` },
  //     // params: {
  //     //     page: pageParam
  //     //   },
  //   });
  //   return response.data;
  // };

  // const { data,
  //   fetchNextPage,
  //   hasNextPage,
  //   isFetchingNextPage, } = useInfiniteQuery({
  //     queryKey: ['posts'],
  //     queryFn: fetchExploreFeedPosts,
  //     initialPageParam: 1,
  //     getNextPageParam: (lastPage) => lastPage.nextPage,
  //   })

  // const { data: posts, isLoading, isError } = useQuery({
  //   queryKey: ['explore-feed', user?.id],
  //   queryFn: fetchExploreFeed,
  //   staleTime: 1000 * 60 * 5,
  // });

  if (status === 'loading') return <Spinner />;
  if (status === 'error') return <div className="text-white text-center p-10">Failed to load feed.</div>;

  return (
    <>
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
          {data?.pages.flatMap((page) => page.posts).map((post) => {
            // const isFeatured = index % 10 === 2;

            return (
              <div
                key={post.id}
                onClick={() => navigate(`/post/${post.id}`)}
                className={`relative overflow-hidden group bg-zinc-900 cursor-pointer hover:opacity-90 transition-opacity
                  col-span-1 row-span-1`}
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
        <div ref={ref} lassName="py-10 text-center text-zinc-500 text-xs">
          You've caught up with all the latest interests.
        </div>
      </main>
    </div>
    </>
  );
};

export default Explore;