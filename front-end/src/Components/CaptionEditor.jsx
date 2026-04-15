import { useContext } from "react";
import { AuthContext } from "../Contexts/AuthContext";

export default function CaptionEditor({ src, userName, caption, setCaption, fileType }) {
  const { user } = useContext(AuthContext);
  const MAX_CAPTION_CHARS = 2200;

  return (
    <div className="flex h-[480px] w-full">
      {/* Left: Final Image with Tag Overlay */}
      <div className="flex-1 bg-black flex items-center justify-center overflow-hidden relative border-r border-[#363636]">
        {fileType === "image" ? (
          <img
            src={src}
            alt="Final Edit"
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <video
            src={src}
            controls
            className="max-w-full max-h-full object-contain"
          />
        )}
        <span className="absolute top-[15%] left-1/2 -translate-x-1/2 text-white/90 text-[11px] font-medium tracking-wide">
          Click photo to tag people
        </span>
      </div>

      {/* Right: Caption & Share Panel */}
      <div className="w-[320px] flex flex-col bg-[#262626] p-4 text-[#f5f5f5]">
        {/* User Info */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
            {user?.profilePicture ? (
              <img
                src={user.profilePicture}
                alt="Profile"
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-sm font-semibold">{userName.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <span className="text-sm font-semibold">{user?.userName || userName}</span>
        </div>

        {/* Caption Textarea + Characters Count */}
        <div className="flex-1 flex flex-col gap-2 mb-4">
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write a caption..."
            maxLength={MAX_CAPTION_CHARS}
            className="flex-1 bg-transparent text-sm resize-none focus:outline-none custom-scrollbar"
          />
          <div className="flex items-center justify-between text-xs text-[#a8a8a8]">
            {/* Emoji Button */}
            <button className="text-[#a8a8a8] hover:text-[#f5f5f5] transition-colors">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                <line x1="9" y1="9" x2="9.01" y2="9" />
                <line x1="15" y1="9" x2="15.01" y2="9" />
              </svg>
            </button>
            <span>
              {caption.length + "/" + MAX_CAPTION_CHARS.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Expandable Menus */}
        <div className="space-y-4 border-t border-[#363636] pt-4 text-sm font-medium">
          <div className="flex items-center justify-between text-[#a8a8a8]">
            <span>Add location</span>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 2a10 10 0 0 1 10 10c0 5.25-10 10-10 10S2 17.25 2 12A10 10 0 0 1 12 2z" />
            </svg>
          </div>
          <div className="flex items-center justify-between text-[#a8a8a8]">
            <span>Add collaborators</span>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className="flex items-center justify-between text-[#f5f5f5] font-semibold">
            <span>Accessibility</span>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
          <div className="flex items-center justify-between text-[#f5f5f5] font-semibold">
            <span>Advanced settings</span>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
