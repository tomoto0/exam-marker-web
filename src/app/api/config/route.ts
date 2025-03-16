import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// Define paths
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const QUESTIONS_DIR = path.join(UPLOAD_DIR, 'questions');
const ANSWERS_DIR = path.join(UPLOAD_DIR, 'answers');
const CRITERIA_DIR = path.join(UPLOAD_DIR, 'criteria');
const GUIDELINES_DIR = path.join(UPLOAD_DIR, 'guidelines');
const CONFIG_DIR = path.join(UPLOAD_DIR, 'config');
const ENV_FILE_PATH = path.join(CONFIG_DIR, '.env');

// Function to parse text files into environment variables
async function generateEnvFile() {
  try {
    // Initialize env content with API key
    let envContent = `# API Configuration\nGEMINI_API_KEY=${process.env.GEMINI_API_KEY || ''}\n\n`;
    
    // Process questions file
    const questionsFiles = await readdir(QUESTIONS_DIR);
    if (questionsFiles.length > 0) {
      const questionsPath = path.join(QUESTIONS_DIR, questionsFiles[0]);
      const questionsContent = await readFile(questionsPath, 'utf8');
      
      // Parse questions and add to env content
      envContent += "# Question Texts (actual questions)\n";
      const questions = parseQuestions(questionsContent);
      for (const [key, value] of Object.entries(questions)) {
        envContent += `QUESTION_TEXT_${key}=${value}\n`;
      }
      envContent += "\n";
    }
    
    // Process answers file
    const answersFiles = await readdir(ANSWERS_DIR);
    if (answersFiles.length > 0) {
      const answersPath = path.join(ANSWERS_DIR, answersFiles[0]);
      const answersContent = await readFile(answersPath, 'utf8');
      
      // Parse answers and add to env content
      envContent += "# Key answers\n";
      const answers = parseAnswers(answersContent);
      for (const [key, value] of Object.entries(answers)) {
        envContent += `SOLUTION_${key}=${value}\n`;
      }
      envContent += "\n";
    }
    
    // Process criteria file
    const criteriaFiles = await readdir(CRITERIA_DIR);
    if (criteriaFiles.length > 0) {
      const criteriaPath = path.join(CRITERIA_DIR, criteriaFiles[0]);
      const criteriaContent = await readFile(criteriaPath, 'utf8');
      
      // Parse criteria and add to env content
      envContent += "# Marking Criteria - These are used for actual marking (format: score,criteria|score,criteria)\n";
      const criteria = parseCriteria(criteriaContent);
      for (const [key, value] of Object.entries(criteria)) {
        envContent += `QUESTION_${key}=${value}\n`;
      }
      envContent += "\n";
    }
    
    // Process guidelines file if it exists
    const guidelinesFiles = await readdir(GUIDELINES_DIR);
    if (guidelinesFiles.length > 0) {
      const guidelinesPath = path.join(GUIDELINES_DIR, guidelinesFiles[0]);
      const guidelinesContent = await readFile(guidelinesPath, 'utf8');
      
      // Parse guidelines and add to env content
      envContent += "# Marking Guidelines\n";
      const guidelines = parseGuidelines(guidelinesContent);
      for (const [key, value] of Object.entries(guidelines)) {
        envContent += `MARKING_GUIDELINE_${key}=${value}\n`;
      }
      envContent += "\n";
    }
    
    // Add default graph analysis prompt if not provided
    envContent += `# Graph Analysis Prompt
GRAPH_ANALYSIS="Analyze this economics graph/diagram carefully. Look closely at all visual elements, including:

1. GRAPH TYPE: Determine the specific type of graph (e.g., supply/demand curves, IS-LM model, production possibilities frontier, bar chart, scatter plot, etc.). Even if elements are hand-drawn or somewhat unclear, make your best determination based on the visual structure.

2. AXIS IDENTIFICATION: 
   - X-axis: Carefully identify any labels, scales, or units. If the label is visible but partially cut off or unclear, describe what you can see and make a reasonable inference.
   - Y-axis: Same approach as X-axis.
   - Even if an axis appears to be unlabeled, check carefully for any annotations, markings, or handwritten notes nearby that might indicate its meaning.

3. KEY ELEMENTS:
   - Trends: Describe the main patterns shown (rising, falling, intersecting, etc.)
   - Key points: Identify any notable points, intersections, or markers
   - Economic interpretation: What economic concept or relationship does this visualization represent?

Format your response as:
Graph Type: [specific type] (Avoid using 'Unknown' when you can identify structural elements)
X-axis: [label or description, include partial text if visible]
Y-axis: [label or description, include partial text if visible]
Trends: [comma-separated list]
Key Points: [comma-separated list]
Economic Interpretation: [brief explanation]
"`;
    
    // Write the env file
    await writeFile(ENV_FILE_PATH, envContent);
    return true;
  } catch (error) {
    console.error('Error generating env file:', error);
    return false;
  }
}

// Helper function to read directory contents
async function readdir(dir: string) {
  try {
    const { readdir } = await import('fs/promises');
    return await readdir(dir);
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error);
    return [];
  }
}

// Helper functions to parse different file types
function parseQuestions(content: string) {
  const questions: Record<string, string> = {};
  const lines = content.split('\n');
  let currentQuestion = '';
  let currentContent = '';
  
  for (const line of lines) {
    if (line.match(/^#+\s*Question\s+(\d+[a-z]?)/i)) {
      // Save previous question if exists
      if (currentQuestion && currentContent) {
        questions[currentQuestion] = currentContent.trim();
      }
      
      // Start new question
      const match = line.match(/^#+\s*Question\s+(\d+[a-z]?)/i);
      currentQuestion = match ? match[1] : '';
      currentContent = '';
    } else if (currentQuestion && !line.match(/^#+\s*Answer/i)) {
      // Add line to current question content
      currentContent += line + ' ';
    }
  }
  
  // Save last question
  if (currentQuestion && currentContent) {
    questions[currentQuestion] = currentContent.trim();
  }
  
  return questions;
}

function parseAnswers(content: string) {
  const answers: Record<string, string> = {};
  const lines = content.split('\n');
  let currentQuestion = '';
  let currentContent = '';
  
  for (const line of lines) {
    if (line.match(/^#+\s*Question\s+(\d+[a-z]?)/i)) {
      // Save previous answer if exists
      if (currentQuestion && currentContent) {
        answers[currentQuestion] = currentContent.trim();
      }
      
      // Start new question
      const match = line.match(/^#+\s*Question\s+(\d+[a-z]?)/i);
      currentQuestion = match ? match[1] : '';
      currentContent = '';
    } else if (line.match(/^#+\s*Answer/i)) {
      // Skip the Answer header
      continue;
    } else if (currentQuestion) {
      // Add line to current answer content
      currentContent += line + ' ';
    }
  }
  
  // Save last answer
  if (currentQuestion && currentContent) {
    answers[currentQuestion] = currentContent.trim();
  }
  
  return answers;
}

function parseCriteria(content: string) {
  const criteria: Record<string, string> = {};
  const lines = content.split('\n');
  
  for (const line of lines) {
    const match = line.match(/^Question\s+(\d+[a-z]?):\s*(.*)/i);
    if (match) {
      const questionId = match[1];
      const criteriaText = match[2];
      
      // Format criteria as score,criteria|score,criteria
      const formattedCriteria = criteriaText
        .split(',')
        .map(item => item.trim())
        .filter(item => item)
        .map(item => {
          const [score, ...description] = item.split(' ');
          return `${score},${description.join(' ')}`;
        })
        .join('|');
      
      criteria[questionId] = formattedCriteria;
    }
  }
  
  return criteria;
}

function parseGuidelines(content: string) {
  const guidelines: Record<string, string> = {};
  const lines = content.split('\n');
  let guidelineCount = 1;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      guidelines[guidelineCount.toString()] = trimmedLine;
      guidelineCount++;
    }
  }
  
  return guidelines;
}

export async function POST(request: NextRequest) {
  try {
    const success = await generateEnvFile();
    
    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Configuration file generated successfully',
        envPath: ENV_FILE_PATH
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to generate configuration file' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in config generation:', error);
    return NextResponse.json(
      { error: 'Failed to generate configuration file' },
      { status: 500 }
    );
  }
}
