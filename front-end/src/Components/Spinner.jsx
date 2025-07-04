import React from 'react';

export default function Spinner() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="w-12 h-12 border-4 border-rose-800 border-dashed rounded-full animate-spin" />
    </div>
  );
}