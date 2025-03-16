"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface FeedbackFile {
  candidateNumber: string;
  filename: string;
  content: string;
}

interface ResultsResponse {
  success: boolean;
  totalFiles: number;
  combinedFeedback: string | null;
  individualFeedbacks: FeedbackFile[];
  error?: string;
}

export default function Results() {
  const router = useRouter();
  const [results, setResults] = useState<ResultsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackFile | null>(null);
  const [viewMode, setViewMode] = useState<"individual" | "combined">("individual");

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await fetch("/api/results");
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("No results found. Please process exam submissions first.");
          }
          throw new Error("Failed to fetch results");
        }
        
        const data = await response.json();
        setResults(data);
        
        // Set the first feedback as selected by default
        if (data.individualFeedbacks && data.individualFeedbacks.length > 0) {
          setSelectedFeedback(data.individualFeedbacks[0]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  const downloadFeedback = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white shadow-md rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-6">Grading Results</h2>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="ml-3 text-lg text-gray-700">Loading results...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => router.push("/submissions")}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
            >
              Go to Submissions
            </button>
          </div>
        ) : results ? (
          <div>
            <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
              <p className="text-green-700">
                Successfully processed {results.totalFiles} exam submissions.
              </p>
            </div>
            
            <div className="flex mb-6">
              <button
                onClick={() => setViewMode("individual")}
                className={`px-4 py-2 font-medium rounded-l-lg ${
                  viewMode === "individual"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Individual Feedback
              </button>
              <button
                onClick={() => setViewMode("combined")}
                className={`px-4 py-2 font-medium rounded-r-lg ${
                  viewMode === "combined"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Combined Feedback
              </button>
            </div>
            
            {viewMode === "individual" ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-bold text-lg mb-3">Exam Submissions</h3>
                  <div className="max-h-96 overflow-y-auto">
                    <ul className="space-y-2">
                      {results.individualFeedbacks.map((feedback) => (
                        <li key={feedback.filename}>
                          <button
                            onClick={() => setSelectedFeedback(feedback)}
                            className={`w-full text-left px-3 py-2 rounded ${
                              selectedFeedback?.filename === feedback.filename
                                ? "bg-blue-100 text-blue-700"
                                : "hover:bg-gray-200"
                            }`}
                          >
                            {feedback.candidateNumber}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  {selectedFeedback ? (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg">
                          Feedback for {selectedFeedback.candidateNumber}
                        </h3>
                        <button
                          onClick={() => downloadFeedback(
                            selectedFeedback.content,
                            selectedFeedback.filename
                          )}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
                        >
                          Download
                        </button>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800 max-h-[60vh] overflow-y-auto">
                          {selectedFeedback.content}
                        </pre>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
                      <p className="text-yellow-700">
                        Select a submission from the list to view feedback.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-lg">Combined Feedback</h3>
                  {results.combinedFeedback && (
                    <button
                      onClick={() => downloadFeedback(
                        results.combinedFeedback as string,
                        "all_exam_feedback.md"
                      )}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
                    >
                      Download All
                    </button>
                  )}
                </div>
                {results.combinedFeedback ? (
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800 max-h-[70vh] overflow-y-auto">
                      {results.combinedFeedback}
                    </pre>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
                    <p className="text-yellow-700">
                      Combined feedback is not available.
                    </p>
                  </div>
                )}
              </div>
            )}
            
            <div className="mt-8">
              <button
                onClick={() => router.push("/")}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg transition duration-200"
              >
                Back to Home
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
            <p className="text-yellow-700">
              No results found. Please process exam submissions first.
            </p>
            <button
              onClick={() => router.push("/submissions")}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
            >
              Go to Submissions
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
