"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type ProcessingStatus = "not_started" | "processing" | "completed" | "error";

interface StatusResponse {
  status: ProcessingStatus;
  message: string;
  startTime?: string;
  completedAt?: string;
  totalFiles?: number;
  processId?: number;
  error?: string;
}

export default function Status() {
  const router = useRouter();
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch("/api/status");
        if (!response.ok) {
          throw new Error("Failed to fetch status");
        }
        
        const data = await response.json();
        setStatus(data);
        
        // If processing is complete, redirect to results page after a delay
        if (data.status === "completed") {
          setTimeout(() => {
            router.push("/results");
          }, 3000);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    // Check status immediately
    checkStatus();

    // Then check every 5 seconds
    const interval = setInterval(checkStatus, 5000);

    // Clean up interval on unmount
    return () => clearInterval(interval);
  }, [router]);

  const getStatusColor = (status: ProcessingStatus) => {
    switch (status) {
      case "processing":
        return "text-blue-600";
      case "completed":
        return "text-green-600";
      case "error":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusIcon = (status: ProcessingStatus) => {
    switch (status) {
      case "processing":
        return (
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        );
      case "completed":
        return (
          <svg className="-ml-1 mr-3 h-5 w-5 text-green-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case "error":
        return (
          <svg className="-ml-1 mr-3 h-5 w-5 text-red-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="-ml-1 mr-3 h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow-md rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-6">Processing Status</h2>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="ml-3 text-lg text-gray-700">Loading status...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        ) : status ? (
          <div>
            <div className="flex items-center mb-6">
              {getStatusIcon(status.status)}
              <span className={`text-lg font-medium ${getStatusColor(status.status)}`}>
                {status.status === "processing" ? "Processing in progress" : 
                 status.status === "completed" ? "Processing completed" : 
                 status.status === "error" ? "Processing error" : 
                 "Not started"}
              </span>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <p className="text-gray-700 mb-4">{status.message}</p>
              
              {status.startTime && (
                <p className="text-sm text-gray-600">
                  Started: {new Date(status.startTime).toLocaleString()}
                </p>
              )}
              
              {status.completedAt && (
                <p className="text-sm text-gray-600">
                  Completed: {new Date(status.completedAt).toLocaleString()}
                </p>
              )}
              
              {status.totalFiles && (
                <p className="text-sm text-gray-600">
                  Total files: {status.totalFiles}
                </p>
              )}
            </div>
            
            {status.status === "completed" && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
                <p className="text-green-700">
                  Processing completed successfully. Redirecting to results page...
                </p>
              </div>
            )}
            
            {status.status === "error" && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                <p className="text-red-700">
                  An error occurred during processing. Please check the logs for more details.
                </p>
                {status.error && (
                  <p className="text-red-600 mt-2">{status.error}</p>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
            <p className="text-yellow-700">
              No processing has been started yet. Please upload files first.
            </p>
          </div>
        )}
        
        <div className="flex justify-between mt-8">
          <button
            onClick={() => router.push("/submissions")}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg transition duration-200"
          >
            Back to Submissions
          </button>
          
          {status?.status === "completed" && (
            <button
              onClick={() => router.push("/results")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
            >
              View Results
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
