import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// Define paths
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const RESULTS_DIR = path.join(UPLOAD_DIR, 'results');
const STATUS_FILE = path.join(RESULTS_DIR, 'process_status.json');

export async function GET(request: NextRequest) {
  try {
    // Check if status file exists
    if (!existsSync(STATUS_FILE)) {
      return NextResponse.json(
        { status: 'not_started', message: 'No processing has been started yet' }
      );
    }
    
    // Read status file
    const statusContent = await readFile(STATUS_FILE, 'utf8');
    const statusData = JSON.parse(statusContent);
    
    // Check if processing is complete by looking for the combined feedback file
    const combinedFeedbackPath = path.join(RESULTS_DIR, 'all_exam_feedback.md');
    if (existsSync(combinedFeedbackPath)) {
      // Processing is complete
      return NextResponse.json({
        status: 'completed',
        message: 'Processing completed successfully',
        completedAt: new Date().toISOString(),
        ...statusData
      });
    }
    
    // Check if process is still running
    let isRunning = false;
    if (statusData.processId) {
      try {
        // On Unix-like systems, sending signal 0 checks if process exists
        process.kill(statusData.processId, 0);
        isRunning = true;
      } catch (e) {
        // Process is not running
        isRunning = false;
      }
    }
    
    if (isRunning) {
      return NextResponse.json({
        status: 'processing',
        message: 'Processing is in progress',
        ...statusData
      });
    } else {
      // Process is not running but combined file doesn't exist - likely an error
      return NextResponse.json({
        status: 'error',
        message: 'Processing stopped unexpectedly',
        ...statusData
      });
    }
    
  } catch (error) {
    console.error('Error checking processing status:', error);
    return NextResponse.json(
      { error: 'Failed to check processing status' },
      { status: 500 }
    );
  }
}
