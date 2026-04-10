import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../Contexts/AuthContext";

function Avatar({ profilePicture, onClick }) {
  if (profilePicture) {
    return (
      <img
        src={profilePicture}
        alt="avatar"
        onClick={onClick}
        className="w-11 h-11 rounded-full object-cover flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
      />
    );
  }
  return (
    <div
      onClick={onClick}
      className="w-11 h-11 rounded-full bg-neutral-800 flex items-center justify-center text-sm font-medium text-neutral-400 flex-shrink-0 cursor-pointer hover:bg-neutral-700 transition-colors"
    >
      U
    </div>
  );
}

function Thumbnail({ mediaUrl, mediaType }) {
  if (mediaUrl) {
    if (mediaType?.includes('video')) {
      return (
        <div className="w-11 h-11 rounded bg-neutral-800 flex-shrink-0 flex items-center justify-center">
          <span className="text-xs text-neutral-400">▶</span>
        </div>
      );
    }
    return (
      <img
        src={mediaUrl}
        alt="post thumbnail"
        className="w-11 h-11 rounded object-cover flex-shrink-0"
      />
    );
  }
  return <div className="w-11 h-11 rounded bg-neutral-800 flex-shrink-0" />;
}

function FollowButton() {
  const [following, setFollowing] = useState(true);
  return (
    <button
      onClick={() => setFollowing(!following)}
      className={`text-sm font-semibold px-4 py-1.5 rounded-lg flex-shrink-0 transition-colors ${
        following
          ? "bg-neutral-700 text-white hover:bg-neutral-600"
          : "bg-blue-500 text-white hover:bg-blue-600"
      }`}
    >
      {following ? "Following" : "Follow"}
    </button>
  );
}

function NotificationItem({ notif }) {
  const navigate = useNavigate();
  const text = notif.message || "You have a new notification";
  const type = notif.type;
  const createdAt = notif.createdAt ? new Date(notif.createdAt).toLocaleString() : "now";
  const isUnread = notif.isRead === false;
  const actorProfilePicture = notif.actor?.profilePicture;
  const actorId = notif.actor?.id;
  const postMediaUrl = notif.post?.mediaUrl;
  const postMediaType = notif.post?.mediaType;
  const postId = notif.post?.id;

  const handlePostClick = () => {
    if (type === "postLike" && postId) {
      navigate(`/post/${postId}`);
    }
  };

  const handleAvatarClick = (e) => {
    e.stopPropagation();
    if (actorId) {
      navigate(`/profile/${actorId}`);
    }
  };

  return (
    <div
      onClick={handlePostClick}
      className={`flex items-center gap-3 my-2 px-4 py-3 rounded-lg cursor-pointer transition-colors ${
        isUnread ? 'bg-neutral-800/40 ' : 'hover:bg-neutral-900'
      }`}
    >
      <Avatar profilePicture={actorProfilePicture} onClick={handleAvatarClick} />
      <div className="flex-1 min-w-0">
        <p className={`text-sm leading-snug ${isUnread ? 'text-white font-semibold' : 'text-white'}`}>
          {text}
        </p>
        <p className="text-xs text-neutral-500 mt-0.5">{createdAt}</p>
      </div>
      {type === "follow" ? <FollowButton /> : <Thumbnail mediaUrl={postMediaUrl} mediaType={postMediaType} />}
    </div>
  );
}

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (!user?.id) return;

    const fetchNotifications = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${apiUrl}/api/notifications/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications(response.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Unable to load notifications');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [user?.id]);

  return (
    <div className="max-w-sm bg-black min-h-screen text-white">
      <h1 className="text-xl font-semibold px-4 pt-4 pb-3">Notifications</h1>
      <div className="flex flex-col px-4 pb-4">
        {loading ? (
          <p className="text-neutral-500 py-4">Loading notifications...</p>
        ) : error ? (
          <p className="text-red-500 py-4">{error}</p>
        ) : notifications.length === 0 ? (
          <p className="text-neutral-500 py-4">No notifications yet</p>
        ) : (
          notifications.map((notif) => (
            <NotificationItem key={notif.id} notif={notif} />
          ))
        )}
      </div>
    </div>
  );
}
