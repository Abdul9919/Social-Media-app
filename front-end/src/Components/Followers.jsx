import React, { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import { AuthContext } from '../Contexts/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';

const Followers = ({ setShowFollowers, type }) => {
    const [followers, setFollowers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const {id} = useParams();
    const navigate = useNavigate();
    const {user} = React.useContext(AuthContext);
    const userId = user?.id;

    useEffect(() => {
        const fetchFollowers = async () => {
            if (type === 'followers') {
                try {
                    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/follow/${id}`);
                    if (!response.ok) throw new Error('Failed to fetch');
                    const data = await response.json();
                    setFollowers(data.followers);
                    // console.log(data)
                } catch (error) {
                    console.error("Error fetching followers:", error);
                } finally {
                    setLoading(false);
                }
            }

        };

        if (id) fetchFollowers();
    }, [id]);
       useEffect(() => {
        const fetchFollowing = async () => {
            if (type === 'following') {
                try {
                    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/follow?userId=${id}`, {
                        method: 'GET',
                    });
                    if (!response.ok) throw new Error('Failed to fetch');
                    const data = await response.json();
                    setFollowers(data.following);
                } catch (error) {
                    console.error("Error fetching following:", error);
                } finally {
                    setLoading(false);
                }
            }
        };

        if (id) fetchFollowing();
    }, [id]);

    // Filter logic for the search bar
    const filteredFollowers = followers.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleRemoveFollower = async (id) => {
        if(type === 'followers') {
            try {
                const res =await fetch(`${import.meta.env.VITE_API_URL}/api/follow/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if(res.status === 200) {
                    const updatedFollowers = followers.filter(follower => follower.id !== id);
                    setFollowers(updatedFollowers);
                }

            } catch (error) {
                alert('Failed to remove follower');
                console.log(error)
            }
        }
        if(type === 'following') {
            try {
                await fetch(`${import.meta.env.VITE_API_URL}/api/follow/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

            } catch (error) {
                alert('Failed to remove follower');
                console.log(error)
            }
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 font-sans">
            {/* Modal Container */}
            <div className="w-full max-w-[400px] bg-[#262626] rounded-xl overflow-hidden shadow-2xl border border-white/10">

                {/* Header */}
                <div className="relative flex items-center justify-center h-11 border-b border-white/10">
                    <h1 className="text-white text-sm font-semibold">Followers</h1>
                    <button onClick={() => setShowFollowers(false)} className="absolute right-3 text-white hover:opacity-70 transition-opacity">
                        <X size={20} />
                    </button>
                </div>

                {/* Search Bar Section */}
                <div className="p-4">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                            <Search size={16} className="text-[#8e8e8e]" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#363636] text-white text-sm rounded-lg py-2 pl-10 pr-4 focus:outline-none placeholder:text-[#8e8e8e]"
                        />
                    </div>
                </div>

                {/* Followers List */}
                <div className="max-h-[400px] min-h-[200px] overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <div className="flex justify-center items-center py-10 text-[#8e8e8e] text-sm">Loading...</div>
                    ) : filteredFollowers.length > 0 ? (
                        filteredFollowers.map((user) => (
                            <div key={user.id} className="flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors cursor-pointer">
                                <div className="flex items-center gap-3">
                                    {/* Avatar */}
                                    <div onClick={() => {
                                        navigate(`/profile/${user.id}`);
                                        setShowFollowers(false);
                                    }} className="cursor-pointer w-11 h-11 rounded-full overflow-hidden bg-zinc-800 border border-white/5">
                                        <img
                                            src={user.profile_picture || '/api/placeholder/40/40'}
                                            alt={user.username}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* User Info */}
                                    <div className="flex flex-col">
                                        <span className="text-white text-[13px] font-semibold leading-tight">
                                            {user.username}
                                        </span>
                                    </div>
                                </div>

                                {userId === user.id && <button onClick={() => handleRemoveFollower(user.id)} className="cursor-pointer bg-[#efefef] hover:bg-[#dbdbdb] text-black text-[13px] font-semibold px-4 py-1.5 rounded-lg transition-colors">
                                    Remove
                                </button>}
                            </div>
                        ))
                    ) : (
                        <div className="flex justify-center items-center py-10 text-[#8e8e8e] text-sm">No followers found.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Followers;