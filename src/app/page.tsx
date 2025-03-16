"use client";

import { useState } from "react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow-md rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-6">Welcome to Economics Exam Auto-Grader</h2>
        
        <p className="mb-6 text-gray-700">
          This application automates the grading of economics exams using Google&apos;s Gemini AI. 
          It analyzes student submissions, evaluates their answers against model solutions, 
          and provides detailed feedback based on predefined marking criteria.
        </p>
        
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8">
          <h3 className="font-bold text-blue-700 mb-2">How It Works</h3>
          <ol className="list-decimal pl-5 space-y-2 text-gray-700">
            <li>Upload your exam questions, model answers, and marking criteria</li>
            <li>Upload student exam submissions (PDF format)</li>
            <li>The system will automatically grade the exams</li>
            <li>Review and download the detailed feedback for each student</li>
          </ol>
        </div>
        
        <div className="flex justify-center">
          <Link 
            href="/upload" 
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
          >
            Get Started
          </Link>
        </div>
      </div>
      
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="font-bold text-lg mb-3">Automated Grading</h3>
          <p className="text-gray-600">
            Save time by automating the grading process for economics exams with AI-powered analysis.
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="font-bold text-lg mb-3">Detailed Feedback</h3>
          <p className="text-gray-600">
            Provide students with comprehensive feedback on their answers, including specific areas for improvement.
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="font-bold text-lg mb-3">Graph Analysis</h3>
          <p className="text-gray-600">
            Evaluate economic graphs and diagrams with advanced image recognition capabilities.
          </p>
        </div>
      </div>
    </div>
  );
}
