import React, { useState, useRef } from 'react';
import { User, Camera } from 'lucide-react';
import { AuthContext } from '../Contexts/AuthContext.jsx';
import ConfirmPhotoChange from './ConfirmPhotoChange.jsx';

const EditProfile = ({ setIsEditing, setSuccessToast }) => {
    const { user } = React.useContext(AuthContext);
    const [username, setUserName] = useState(user?.userName || '');
    const [bio, setBio] = useState(user.bio || '');
    const fileInputRef = useRef(null);
    const [profileImage, setProfileImage] = useState(user?.profilePicture);
    const apiUrl = import.meta.env.VITE_API_URL
    const [confirmation, setConfirmation] = useState(false)
    const [successMessage, setSuccessMessage] = useState('');
    // console.log(user)
    const handleImageClick = () => {
        // 3. Trigger the hidden input when the div is clicked
        fileInputRef.current.click();
    };

    const handlePfpUpload = async (file) => {
        const formData = new FormData();
        formData.append('image', file);
        try {
            const response = await fetch(`${apiUrl}/api/users/upload-pfp`, {
                method: 'PUT',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const result = await response.json();

                // Set the success message
                setSuccessMessage('Profile picture changed successfully!');

                // Clear the message after 3 seconds
                setTimeout(() => setSuccessMessage(''), 3000);

                console.log('Upload successful:', result);
            }
        } catch (error) {
            console.error('Upload failed:', error);
        }
    }
    const handleConfirmation = () => {
        setConfirmation(false);
        if (fileInputRef.current.files[0]) {
            handlePfpUpload(fileInputRef.current.files[0])
        }
    }
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            // 4. Create a local URL for the selected image to show a preview
            const imageUrl = URL.createObjectURL(file);
            setProfileImage(imageUrl);
        }
    };

    const handleSaveChanges = async () => {
        try {
            const response = await fetch(`${apiUrl}/api/users/username-bio`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ username, bio })
            });

            if (response.ok) {
                setSuccessToast(true);
                setTimeout(() => setSuccessToast(false), 3000);
                setIsEditing(false);
            }
        } catch (error) {
            console.log(error)
            alert('Failed to save changes. Please try again later.')
        }
    }

    return (
        <>
            <div className="min-h-[70%] min-w-[30%] bg-[#0a0a0a] flex items-center justify-center p-4 font-sans">
                <div className="w-full max-w-md bg-[#1a1a1a] border border-gray-800 rounded-2xl p-8 shadow-2xl">

                    {/* Profile Picture Section */}
                    <div className="flex flex-col items-center mb-8">
                        {/* Hidden File Input */}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                        />

                        {/* Profile Picture Container */}
                        <div
                            onClick={handleImageClick}
                            className="w-24 h-24 bg-[#2a3a4a] rounded-full flex items-center justify-center mb-4 relative overflow-hidden group border border-gray-700 cursor-pointer"
                        >
                            {profileImage ? (
                                <img
                                    src={profileImage}
                                    alt="Profile Preview"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                /* Placeholder icon if no image is selected */
                                <div className="text-[#4a9eff] text-2xl font-bold">JD</div>
                            )}

                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera size={24} className="text-white" />
                            </div>
                        </div>
                        {successMessage && (
                            <div className="mb-4 px-4 py-1 bg-green-500/10 border border-green-500/20 rounded-full animate-in fade-in slide-in-from-top-1 duration-300">
                                <p className="text-green-400 text-xs font-medium">
                                    {successMessage}
                                </p>
                            </div>
                        )}

                        <button
                            onClick={() => {
                                if (fileInputRef.current.files[0]) {
                                    setConfirmation(true)
                                }
                                else {
                                    alert('Please choose a photo first')
                                }

                            }}
                            className="cursor-pointer text-sm font-medium text-gray-300 hover:text-white transition-colors bg-[#2a2a2a] px-4 py-1.5 rounded-lg border border-gray-700"
                        >
                            Edit profile picture
                        </button>
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-6">
                        {/* Username Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUserName(e.target.value.slice(0, 30))}
                                className="w-full bg-[#121212] border border-gray-800 rounded-lg px-4 py-3 text-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-600 transition-all"
                            />
                            <div className="text-right text-xs text-gray-500 mt-1">
                                {username.length}/30
                            </div>
                        </div>

                        {/* Bio Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Bio</label>
                            <textarea
                                rows="4"
                                value={bio}
                                onChange={(e) => setBio(e.target.value.slice(0, 160))}
                                className="w-full bg-[#121212] border border-gray-800 rounded-lg px-4 py-3 text-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-600 transition-all resize-none"
                            />
                            <div className="text-right text-xs text-gray-500 mt-1">
                                {bio.length}/160
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-2">
                            <button onClick={() => setIsEditing(false)} className="cursor-pointer flex-1 px-4 py-2.5 rounded-lg border border-gray-800 text-gray-300 font-medium hover:bg-gray-800 transition-colors">
                                Cancel
                            </button>
                            <button onClick={handleSaveChanges} className="cursor-pointer flex-1 px-4 py-2.5 rounded-lg border border-gray-800 text-gray-100 font-medium hover:bg-gray-800 transition-colors">
                                Save changes
                            </button>
                        </div>
                    </div>
                </div>
                {successMessage && (
                    <div className="mb-4 px-4 py-1 bg-green-500/10 border border-green-500/20 rounded-full animate-in fade-in slide-in-from-top-1 duration-300">
                        <p className="text-green-400 text-xs font-medium">
                            {successMessage}
                        </p>
                    </div>
                )}
            </div>
            {confirmation &&
                <ConfirmPhotoChange onConfirm={handleConfirmation} onCancel={() => setConfirmation(false)} />
            }
        </>
    );
};

export default EditProfile;