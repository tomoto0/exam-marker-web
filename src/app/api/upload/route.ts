import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// Define upload directories
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const QUESTIONS_DIR = path.join(UPLOAD_DIR, 'questions');
const ANSWERS_DIR = path.join(UPLOAD_DIR, 'answers');
const CRITERIA_DIR = path.join(UPLOAD_DIR, 'criteria');
const GUIDELINES_DIR = path.join(UPLOAD_DIR, 'guidelines');
const SUBMISSIONS_DIR = path.join(UPLOAD_DIR, 'submissions');
const CONFIG_DIR = path.join(UPLOAD_DIR, 'config');

// Ensure directories exist
async function ensureDirectories() {
  const dirs = [
    UPLOAD_DIR,
    QUESTIONS_DIR,
    ANSWERS_DIR,
    CRITERIA_DIR,
    GUIDELINES_DIR,
    SUBMISSIONS_DIR,
    CONFIG_DIR
  ];
  
  for (const dir of dirs) {
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureDirectories();
    
    const formData = await request.formData();
    const fileType = formData.get('fileType') as string;
    const file = formData.get('file') as File;
    
    if (!file || !fileType) {
      return NextResponse.json(
        { error: 'File or file type is missing' },
        { status: 400 }
      );
    }
    
    // Determine target directory based on file type
    let targetDir;
    switch (fileType) {
      case 'questions':
        targetDir = QUESTIONS_DIR;
        break;
      case 'answers':
        targetDir = ANSWERS_DIR;
        break;
      case 'criteria':
        targetDir = CRITERIA_DIR;
        break;
      case 'guidelines':
        targetDir = GUIDELINES_DIR;
        break;
      case 'submissions':
        targetDir = SUBMISSIONS_DIR;
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid file type' },
          { status: 400 }
        );
    }
    
    // Create a buffer from the file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Save the file
    const filePath = path.join(targetDir, file.name);
    await writeFile(filePath, buffer);
    
    return NextResponse.json({ 
      success: true,
      message: 'File uploaded successfully',
      filePath: filePath
    });
    
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
