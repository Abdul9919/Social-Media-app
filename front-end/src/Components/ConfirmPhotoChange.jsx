import React from 'react';
import { AlertCircle } from 'lucide-react';

const ConfirmPhotoChange = ({ onConfirm, onCancel }) => {
  return (
    // Backdrop Overlay
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      
      {/* Modal Card */}
      <div className="w-full max-w-sm bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
        
        <div className="flex flex-col items-center text-center">
          {/* Warning Icon */}
          <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="text-[#4a9eff]" size={28} />
          </div>

          <h3 className="text-xl font-semibold text-white mb-2">
            Update profile picture?
          </h3>
          
          <p className="text-gray-400 text-sm mb-8">
            This will replace your current photo with the new one you selected.
          </p>

          {/* Action Buttons */}
          <div className="flex w-full gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-800 text-gray-300 font-medium hover:bg-gray-800 transition-colors"
            >
              No, cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#4a9eff] text-white font-semibold hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20"
            >
              Yes, change it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmPhotoChange;