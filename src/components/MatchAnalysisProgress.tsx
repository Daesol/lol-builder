import React from 'react';
import { MatchAnalysisProgress } from '@/lib/api/riot';

interface Props {
  progress: MatchAnalysisProgress;
}

export const MatchAnalysisProgress: React.FC<Props> = ({ progress }) => {
  const percentage = Math.round((progress.current / progress.total) * 100);
  
  return (
    <div className="w-full max-w-md mx-auto p-4 bg-gray-100 rounded-lg shadow">
      <div className="mb-2 flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">
          Analyzing matches...
        </span>
        <span className="text-sm text-gray-500">
          {progress.matchesProcessed} processed, {progress.matchesSkipped} skipped
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className={`h-2.5 rounded-full transition-all duration-300 ${
            progress.error ? 'bg-red-500' : 'bg-blue-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {progress.error && (
        <p className="mt-2 text-sm text-red-500">
          Error: {progress.error}
        </p>
      )}
      
      {progress.completed && !progress.error && (
        <p className="mt-2 text-sm text-green-500">
          Analysis completed!
        </p>
      )}
    </div>
  );
}; 