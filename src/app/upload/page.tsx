"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type FileType = "questions" | "answers" | "criteria" | "guidelines";

export default function Upload() {
  const router = useRouter();
  const [files, setFiles] = useState<{
    questions: File | null;
    answers: File | null;
    criteria: File | null;
    guidelines: File | null;
  }>({
    questions: null,
    answers: null,
    criteria: null,
    guidelines: null,
  });
  
  const [uploading, setUploading] = useState(false);
  const [configuring, setConfiguring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFileChange = (type: FileType) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFiles({
        ...files,
        [type]: e.target.files[0],
      });
    }
  };

  const uploadFile = async (file: File, type: FileType) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileType", type);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to upload file");
    }

    return await response.json();
  };

  const generateConfig = async () => {
    const response = await fetch("/api/config", {
      method: "POST",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to generate configuration");
    }

    return await response.json();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setUploading(true);

    try {
      // Validate required files
      if (!files.questions || !files.answers || !files.criteria) {
        throw new Error("Please upload questions, answers, and marking criteria files");
      }

      // Upload files
      await uploadFile(files.questions, "questions");
      await uploadFile(files.answers, "answers");
      await uploadFile(files.criteria, "criteria");
      
      // Upload guidelines if provided
      if (files.guidelines) {
        await uploadFile(files.guidelines, "guidelines");
      }

      setSuccess("Files uploaded successfully. Generating configuration...");
      setUploading(false);
      setConfiguring(true);

      // Generate configuration
      await generateConfig();

      setSuccess("Configuration generated successfully. Please proceed to upload student submissions.");
      
      // Redirect to submissions page after a short delay
      setTimeout(() => {
        router.push("/submissions");
      }, 2000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      setUploading(false);
      setConfiguring(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow-md rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-6">Upload Exam Materials</h2>
        
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-8">
          <p className="text-yellow-700">
            Please upload the following files to configure the exam grading system. 
            The files should contain the exam questions, model answers, and marking criteria.
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
                Exam Questions <span className="text-red-500">*</span>
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                {files.questions ? (
                  <div className="text-green-600">
                    <p className="font-medium">{files.questions.name}</p>
                    <p className="text-sm text-gray-500">
                      {(files.questions.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-500 mb-2">Upload a file containing the exam questions</p>
                    <input
                      type="file"
                      onChange={handleFileChange("questions")}
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

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Model Answers <span className="text-red-500">*</span>
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                {files.answers ? (
                  <div className="text-green-600">
                    <p className="font-medium">{files.answers.name}</p>
                    <p className="text-sm text-gray-500">
                      {(files.answers.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-500 mb-2">Upload a file containing the model answers</p>
                    <input
                      type="file"
                      onChange={handleFileChange("answers")}
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

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Marking Criteria <span className="text-red-500">*</span>
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                {files.criteria ? (
                  <div className="text-green-600">
                    <p className="font-medium">{files.criteria.name}</p>
                    <p className="text-sm text-gray-500">
                      {(files.criteria.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-500 mb-2">Upload a file containing the marking criteria</p>
                    <input
                      type="file"
                      onChange={handleFileChange("criteria")}
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

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Marking Guidelines (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                {files.guidelines ? (
                  <div className="text-green-600">
                    <p className="font-medium">{files.guidelines.name}</p>
                    <p className="text-sm text-gray-500">
                      {(files.guidelines.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-500 mb-2">Upload a file containing the marking guidelines (optional)</p>
                    <input
                      type="file"
                      onChange={handleFileChange("guidelines")}
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
                disabled={uploading || configuring}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200 disabled:bg-blue-400"
              >
                {uploading ? "Uploading..." : configuring ? "Configuring..." : "Upload and Configure"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
