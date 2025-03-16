import { NextRequest, NextResponse } from 'next/server';
import { readFile, readdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// Define paths
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const RESULTS_DIR = path.join(UPLOAD_DIR, 'results');

export async function GET(request: NextRequest) {
  try {
    // Check if results directory exists
    if (!existsSync(RESULTS_DIR)) {
      return NextResponse.json(
        { error: 'Results directory not found' },
        { status: 404 }
      );
    }
    
    // Get all files in results directory
    const files = await readdir(RESULTS_DIR);
    const feedbackFiles = files.filter(file => file.endsWith('_feedback.md'));
    
    // Check if combined feedback file exists
    const combinedFeedbackPath = path.join(RESULTS_DIR, 'all_exam_feedback.md');
    let combinedFeedback = null;
    
    if (existsSync(combinedFeedbackPath)) {
      combinedFeedback = await readFile(combinedFeedbackPath, 'utf8');
    }
    
    // Get individual feedback files
    const individualFeedbacks = [];
    for (const file of feedbackFiles) {
      const filePath = path.join(RESULTS_DIR, file);
      const content = await readFile(filePath, 'utf8');
      
      // Extract candidate number from filename
      const candidateNumber = file.replace('_feedback.md', '');
      
      individualFeedbacks.push({
        candidateNumber,
        filename: file,
        content
      });
    }
    
    return NextResponse.json({
      success: true,
      totalFiles: feedbackFiles.length,
      combinedFeedback,
      individualFeedbacks
    });
    
  } catch (error) {
    console.error('Error retrieving results:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve results' },
      { status: 500 }
    );
  }
}
