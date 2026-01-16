'use client';

import { useEffect, useState } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * FirebaseErrorListener component
 * Listens to global Firebase/Firestore errors and displays them to the user.
 * This component is typically rendered once at the root level within FirebaseProvider.
 */
export const FirebaseErrorListener: React.FC = () => {
  const [errors, setErrors] = useState<FirestorePermissionError[]>([]);

  useEffect(() => {
    const handlePermissionError = (error: FirestorePermissionError) => {
      console.error('Permission Error:', error);
      setErrors(prev => [...prev, error]);

      // Auto-dismiss after 10 seconds
      setTimeout(() => {
        setErrors(prev => prev.filter(e => e !== error));
      }, 10000);
    };

    // Subscribe to permission errors
    errorEmitter.on('permission-error', handlePermissionError);

    // Cleanup subscription on unmount
    return () => {
      errorEmitter.off('permission-error', handlePermissionError);
    };
  }, []);

  if (errors.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-md">
      {errors.map((error, index) => (
        <div
          key={index}
          className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg"
          role="alert"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-800 mb-1">
                Permission Error
              </h3>
              <p className="text-xs text-red-700 mb-2">
                {error.message.split('\n')[0]}
              </p>
              <details className="text-xs text-red-600">
                <summary className="cursor-pointer hover:text-red-800">
                  View Details
                </summary>
                <pre className="mt-2 p-2 bg-red-100 rounded overflow-x-auto">
                  {JSON.stringify(error.request, null, 2)}
                </pre>
              </details>
            </div>
            <button
              onClick={() => setErrors(prev => prev.filter(e => e !== error))}
              className="ml-2 text-red-400 hover:text-red-600 transition-colors"
              aria-label="Dismiss error"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
