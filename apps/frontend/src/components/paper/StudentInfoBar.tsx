import React from 'react';

export function StudentInfoBar() {
  return (
    <div className="border border-gray-300 rounded-lg p-3 sm:p-4 bg-white">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Name:</span>
          <span className="flex-1 border-b border-gray-400 min-w-[80px]">
            &nbsp;
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Roll No:</span>
          <span className="flex-1 border-b border-gray-400 min-w-[60px]">
            &nbsp;
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Section:</span>
          <span className="flex-1 border-b border-gray-400 min-w-[40px]">
            &nbsp;
          </span>
        </div>
      </div>
    </div>
  );
}
