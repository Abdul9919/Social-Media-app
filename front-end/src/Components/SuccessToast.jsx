import React from 'react';
import { CheckCircle } from 'lucide-react'; // Optional: for a nice icon

const SuccessToast = () => {
  return (
    <div className="flex items-center justify-center w-[25%] h-[10%] bg-black">
      <div className="flex items-center gap-3 px-6 py-4 rounded-xl border border-green-200/50 bg-green-500/20 backdrop-blur-md shadow-lg">
        <CheckCircle className="w-5 h-5 text-green-600" />
        <p className="text-green-900 font-medium text-sm">
          Your previous operation was successful
        </p>
      </div>
    </div>
  );
};

export default SuccessToast;