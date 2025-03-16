"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Submissions() {
  const router = useRouter();
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(e.target.files);
    }
  };

  const uploadFiles = async () => {
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        throw new Error(`File ${file.name} is not a PDF file`);
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileType", "submissions");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to upload file ${file.name}`);
      }
    }
  };

  const startProcessing = async () => {
    const response = await fetch("/api/process", {
      method: "POST",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to start processing");
    }

    return await response.json();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setUploading(true);

    try {
      // Validate files
      if (!files || files.length === 0) {
        throw new Error("Please select at least one PDF file");
      }

      // Upload files
      await uploadFiles();

      setSuccess("Files uploaded successfully. Starting processing...");
      setUploading(false);
      setProcessing(true);

      // Start processing
      const result = await startProcessing();

      setSuccess(`Processing started for ${result.totalFiles} files. You will be redirected to the status page.`);
      
      // Redirect to status page after a short delay
      setTimeout(() => {
        router.push("/status");
      }, 2000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      setUploading(false);
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow-md rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-6">Upload Student Submissions</h2>
        
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8">
          <p className="text-blue-700">
            Please select the PDF files containing student exam submissions. 
            The system will process these files and generate feedback based on the configuration you provided.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
            <p className="text-green-700">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Student Submissions (PDF files) <span className="text-red-500">*</span>
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                {files && files.length > 0 ? (
                  <div className="text-green-600">
                    <p className="font-medium">{files.length} files selected</p>
                    <ul className="text-sm text-gray-500 mt-2 max-h-40 overflow-y-auto">
                      {Array.from(files).map((file, index) => (
                        <li key={index} className="text-left">
                          {file.name} ({(file.size / 1024).toFixed(2)} KB)
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-500 mb-2">Select PDF files containing student exam submissions</p>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      multiple
                      accept=".pdf"
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={uploading || processing}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200 disabled:bg-blue-400"
              >
                {uploading ? "Uploading..." : processing ? "Starting Processing..." : "Upload and Process"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
