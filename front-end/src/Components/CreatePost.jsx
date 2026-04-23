import { useState, useRef, useContext } from "react";
import CaptionEditor from "./CaptionEditor";
import FilterEditor from "./FilterEditor";
import CropEditor from "./CropEditor";
import { AuthContext } from "../Contexts/AuthContext";

// ── Main Component ─────────────────────────────────────────────────────────────
export default function CreatePost({ onClose }) {
    const [preview, setPreview] = useState(null); // Cropped image dataURL
    const [originalSrc, setOriginalSrc] = useState(null);
    const [finalEditedPreview, setFinalEditedPreview] = useState(null); // Composite dataURL
    const [filename, setFilename] = useState("");
    const [caption, setCaption] = useState("");
    const [dragging, setDragging] = useState(false);
    const [cropping, setCropping] = useState(false);
    const [editing, setEditing] = useState(false);
    const [captioning, setCaptioning] = useState(false);
    const [fileType, setFileType] = useState(null); // 'image' or 'video'
    const inputRef = useRef();
    const editingRef = useRef();
    const { user } = useContext(AuthContext);
    const [disabled, setisDisabled] = useState(false);

    // User data (Parameterize for real ap

    const handleFile = (file) => {
        if (!file || !(file.type.startsWith("image/") || file.type.startsWith("video/"))) return;

        const type = file.type.startsWith("video/") ? "video" : "image";
        setFileType(type);
        setFilename(file.name);
        const url = URL.createObjectURL(file);
        setPreview(url);
        setOriginalSrc(url);
    };

    const handleCropDone = (dataUrl) => {
        setPreview(dataUrl);
        setCropping(false);
    };

    const handleEditingDone = (compositeDataUrl) => {
        setFinalEditedPreview(compositeDataUrl);
        setEditing(false);
        setCaptioning(true);
    };

    const handleShare = async () => {
        try {
            setisDisabled(true);
            // Convert dataURL to blob
            const response = await fetch(finalEditedPreview);
            const blob = await response.blob();

            // Create FormData
            const formData = new FormData();
            formData.append("description", caption);
            formData.append("media", blob, filename || "post.jpg");

            // Get token from localStorage
            const token = localStorage.getItem("token");

            // Make POST request
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/`, { 
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
                body: formData,
            });

            if (res.ok) {
                onClose();
            } else {
                console.error("Failed to create post");
            }
        } catch (error) {
            console.error("Error sharing post:", error);
        }
    };

    const title = captioning ? "Create new post" : editing ? "Edit" : cropping ? "Crop" : preview ? "Edit photo" : "Create new post";
    // const modalWidth = (editing || captioning) ? "max-w-[800px]" : "max-w-[520px]";


        return (
            /* Main Container: Responsive width and centering */
            <div className="bg-[#262626] rounded-xl overflow-hidden border border-[#363636] transition-all duration-300 w-[95%] sm:w-[80%] md:w-[70%] lg:w-[50%] max-w-[750px] h-fit mx-auto">

                {/* Header */}
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#363636]">
                    {/* Left Side: Back Button */}
                    <div className="w-10">
                        {(cropping || editing || captioning) && (
                            <button
                                className="text-[#f5f5f5] hover:opacity-60 transition-opacity"
                                onClick={() => {
                                    if (captioning) {
                                        setCaptioning(false);
                                        setEditing(true);
                                    } else if (editing) {
                                        setEditing(false);
                                    } else {
                                        setCropping(false);
                                    }
                                }}
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <polyline points="15 18 9 12 15 6" />
                                </svg>
                            </button>
                        )}
                    </div>

                    {/* Center: Title */}
                    <span className="text-[#f5f5f5] text-sm md:text-base font-semibold">{title}</span>

                    {/* Right Side: Action & Close Buttons */}
                    <div className="flex items-center justify-end gap-3 min-w-10">
                        {captioning ? (
                            <button
                                onClick={handleShare}
                                disabled={disabled}
                                className="disabled:opacity-50 text-[#0095f6] font-semibold text-sm hover:text-white transition-colors"
                                
                            >
                                Share
                            </button>
                        ) : editing ? (
                            <button
                                className="text-[#0095f6] font-semibold text-sm hover:text-white transition-colors"
                                onClick={() => editingRef.current?.applyFiltersToCanvas()}
                            >
                                Next
                            </button>
                        ) : (preview && !cropping) ? (
                            <button
                                className="text-[#0095f6] font-semibold text-sm hover:text-white transition-colors"
                                onClick={() => {
                                    if (fileType === "image") {
                                        setEditing(true);
                                    } else {
                                        setFinalEditedPreview(preview);
                                        setCaptioning(true);
                                    }
                                }}
                            >
                                Next
                            </button>
                        ) : null}

                        {/* Close button always visible per mobile design */}
                        <button
                            onClick={onClose}
                            className="text-[#f5f5f5] hover:opacity-60 transition-opacity"
                        >
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Dynamic Body */}
                <div className="flex flex-col">
                    {!preview ? (
                        <div
                            className={`h-[350px] md:h-[420px] flex flex-col items-center justify-center gap-4 cursor-pointer p-6 text-center ${dragging ? "bg-white/5" : ""}`}
                            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                            onDragLeave={() => setDragging(false)}
                            onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
                            onClick={() => inputRef.current.click()}
                        >
                            <svg className="w-16 h-16 md:w-24 md:h-20" viewBox="0 0 96 77" fill="none">
                                <path d="M24 12h48M12 24h72M12 24v41a4 4 0 004 4h64a4 4 0 004-4V24M41.5 45.5l5.5-5.5 5.5 5.5M47 40v14" stroke="#f5f5f5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span className="text-[#f5f5f5] text-lg md:text-xl font-light">Drag photos and videos here</span>
                            <button className="bg-[#0095f6] text-white text-sm font-semibold px-4 py-1.5 rounded-lg active:scale-95 transition-transform">
                                Select from computer
                            </button>
                            <input
                                ref={inputRef}
                                type="file"
                                accept="image/*,video/*"
                                className="hidden"
                                onChange={(e) => handleFile(e.target.files[0])}
                            />
                        </div>
                    ) : cropping && fileType === "image" ? (
                        <CropEditor src={originalSrc} onDone={handleCropDone} onCancel={() => setCropping(false)} />
                    ) : editing && fileType === 'image' ? (
                        <FilterEditor
                            src={preview}
                            onDone={handleEditingDone}
                            userName={user?.userName}
                            ref={editingRef}
                        />
                    ) : captioning ? (
                        <CaptionEditor
                            src={finalEditedPreview}
                            userName={user?.userName}
                            caption={caption}
                            setCaption={setCaption}
                            fileType={fileType}
                        />
                    ) : (
                        <div className="h-[350px] md:h-[420px] relative bg-black flex items-center justify-center">
                            {fileType === "video" ? (
                                <video
                                    src={preview}
                                    controls
                                    className="max-w-full max-h-full object-contain"
                                />
                            ) : (
                                <img
                                    src={preview}
                                    className="max-w-full max-h-full object-contain"
                                    alt="Preview"
                                />
                            )}
                            <button
                                className="absolute bottom-4 left-4 bg-black/70 hover:bg-black/90 p-2.5 rounded-full text-white transition-colors border border-white/20"
                                onClick={() => setCropping(true)}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <polyline points="6 2 6 18 22 18" />
                                    <polyline points="2 6 18 6 18 22" />
                                </svg>
                            </button>
                        </div>
                    )}
                </div>
            </div>
          );
    }
