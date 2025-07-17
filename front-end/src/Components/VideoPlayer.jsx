import React, { useEffect, useRef } from 'react';

const VideoPlayer = ({ src }) => {
  const videoRef = useRef(null);


  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        const video = videoRef.current;
        if (!video) return;

        if (entry.isIntersecting) {
          video.play();
        } else {
          video.pause();
        }
      },
      {
        threshold: 0.5, // play when 50% of video is visible
      }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => {
      if (videoRef.current) {
        observer.unobserve(videoRef.current);
      }
    };
  }, []);

  return (
    <video
      ref={videoRef}
      src={src}
      className="w-[470px] h-[575px] object-cover"
      muted
      loop
      playsInline
    />
    
  );
};

export default VideoPlayer;