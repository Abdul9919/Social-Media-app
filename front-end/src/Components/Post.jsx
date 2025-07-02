import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { IoMdClose } from "react-icons/io";
import { CiHeart } from "react-icons/ci";
import { IoChatbubbleOutline, IoPaperPlaneSharp } from "react-icons/io5";
import { Link } from 'react-router-dom';

const Post = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const apiUrl = import.meta.env.VITE_API_URL;

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState('');

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/comments/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setComments(response.data.comments);
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };
    fetchComments();
  }, [id]);


  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/posts/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setPost(response.data);
      } catch (error) {
        console.error('Error fetching post:', error);
      }
    };
    fetchPost();
  }, [id]);

  if (!post) return null;

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

  const handleLikeToggle = async (postId, alreadyLiked) => {
    try {
      if (alreadyLiked) {
        await axios.delete(`${apiUrl}/api/likes/${postId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      } else {
        await axios.post(`${apiUrl}/api/likes/${postId}`, {}, {
          headers: {

            Authorization: `Bearer ${token}`
          }
        });
      }

      const response = await axios.get(`${apiUrl}/api/comments/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setComments(response.data.comments);
      setPost(response.data);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleSubmit = async (e, postId) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${apiUrl}/api/comments/${postId}`, {
        content: comment
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.status === 201) {
        setComment('');
        const response = await axios.get(`${apiUrl}/api/posts/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setPost(response.data);
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    }
  };

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
            <button className='text-blue-500 font-bold ml-2 hover:text-blue-300'>Follow</button>
          </div>

          {/* Description */}
          <div className="flex items-center mb-4">
            <img src={post.profile_picture} alt="" className="w-[32px] h-[32px] rounded-full" />
            <h2 className="text-white font-semibold text-sm ml-4">{post.username}</h2>
            <p className="text-white ml-2">{post.description}</p>
          </div>

          {/* Scrollable Comments */}
          <div className="overflow-y-auto pr-2 mb-48 no-scrollbar w-full">
            {comments.map((comment) => (
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
                    <span className="font-semibold inline-block mr-2">{comment.username}</span>
                    <span className="inline align-top">{comment.content}</span>
                    
                  </p>
                  
                  <div className="flex items-center text-zinc-500 text-xs mt-1">
                    {getCommentAge(comment.created_at)}
                    <span className="ml-2">0 likes</span> {/* I NEED TO ADD A COMMENT LIKE_COUNT */}
                    <span className="ml-2 hover:cursor-pointer hover:text-zinc-300">Reply</span> {/* ALSO A REPLY FUNCTION*/}
                    </div>
                </div>
                <CiHeart className="flex ml-auto text-white w-5 h-5 cursor-pointer hover:text-red-500" /> {/*ALSO NEED TO ADD LIKES FOR COMMENTS MY GODDDDDDD*/}
              </div>
            ))}
          </div>


          {/* Fixed Bottom Actions */}
          <div className="absolute bottom-0 left-0 right-0 bg-zinc-900 px-6 py-4 border-t border-zinc-700">
            {/* Like / Comment / Share Icons */}
            <div className="flex gap-4 mb-2">
              <CiHeart onClick={() => handleLikeToggle(post.id, post.liked_by_user)} className={`${post.liked_by_user ? 'text-red-500' : 'text-white'} w-7 h-7 cursor-pointer hover:text-gray-400`} />
              <IoChatbubbleOutline className="text-white w-7 h-7 cursor-pointer hover:text-gray-400" />
              <IoPaperPlaneSharp className="text-white w-7 h-7 cursor-pointer hover:text-gray-400" />
            </div>

            {/* Like Count */}
            <div className="flex items-center text-white text-sm font-bold mb-1">
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
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment..."
              />
            </form>
          </div>
        </div>


      </div>
      <div onClick={() => navigate(-1)} className="absolute top-4 right-4 text-white cursor-pointer z-50">
        <IoMdClose className='text-white text-4xl' />
      </div>
    </>
  );
};

export default Post;
