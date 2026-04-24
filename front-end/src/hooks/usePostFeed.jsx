import { useInfiniteQuery } from "@tanstack/react-query";
import axios from 'axios'
export const usePostFeed = () => {
  const token = localStorage.getItem('token');
  const apiUrl = import.meta.env.VITE_API_URL

  const fetchExploreFeed = async ({ pageParam = 1 }) => {
    // console.log(pageParam)
    const response = await axios.get(`${apiUrl}/api/posts/feed?page=${pageParam}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    // console.log('fetchingg')
    return response.data;

  };
  return useInfiniteQuery({
    queryKey: ['explore'],
    queryFn: fetchExploreFeed,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.nextPage && lastPage.nextPage !== 0) {
        return lastPage.nextPage;
      }
      return undefined;
    }
  });
};