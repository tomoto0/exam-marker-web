# Economics Exam Auto-Grader

## Overview

The Economics Exam Auto-Grader is a web application that automates the grading of economics exams using Google's Gemini AI. It analyzes student submissions, evaluates their answers against model solutions, and provides detailed feedback based on predefined marking criteria.

## Features

- **Automated Grading**: Save time by automating the grading process for economics exams
- **Detailed Feedback**: Provide students with comprehensive feedback on their answers
- **Graph Analysis**: Evaluate economic graphs and diagrams with advanced image recognition
- **Batch Processing**: Process multiple exam submissions at once
- **Downloadable Results**: Export feedback as markdown files for easy distribution

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- Google Gemini API key (if deploying your own instance)
- Student exam submissions in PDF format

### Workflow

The application follows a simple four-step workflow:

1. **Upload Exam Materials**
   - Upload exam questions
   - Upload model answers
   - Upload marking criteria
   - Upload marking guidelines (optional)

2. **Upload Student Submissions**
   - Select PDF files containing student exam submissions

3. **Monitor Processing**
   - Track the progress of the grading process
   - View status updates in real-time

4. **Review Results**
   - View individual feedback for each student
   - View combined feedback for all students
   - Download feedback files for distribution

## Detailed Instructions

### Step 1: Upload Exam Materials

1. Click the "Get Started" button on the home page
2. Upload your exam questions file
   - Format: Plain text or markdown with each question preceded by "## Question X"
3. Upload your model answers file
   - Format: Plain text or markdown with each answer preceded by "## Question X"
4. Upload your marking criteria file
   - Format: Plain text with each line in the format "Question X: score,criteria|score,criteria"
5. Upload your marking guidelines file (optional)
   - Format: Plain text with general grading guidelines
6. Click "Upload and Configure" to process the files

### Step 2: Upload Student Submissions

1. After configuration is complete, you'll be redirected to the submissions page
2. Select PDF files containing student exam submissions
3. Click "Upload and Process" to start the grading process

### Step 3: Monitor Processing

1. The status page will show the progress of the grading process
2. You'll see updates on the number of files processed and any errors
3. When processing is complete, you'll be redirected to the results page

### Step 4: Review Results

1. The results page shows individual feedback for each student
2. You can switch between individual and combined feedback views
3. Download feedback files for distribution to students

## File Format Requirements

### Questions File

```
## Question 1a
Suppose demand and supply for a good are respectively described by the following equations, where P denotes the price in £: Qd = 130-5P, Qs = 10P-50. Find the equilibrium price and quantity for this good.

## Question 1b
Compute the price elasticity of demand for the case where the price falls from £10 to £6. Interpret your result.
```

### Answers File

```
## Question 1a
For equilibrium: 130-5P = 10P-50, solving gives P=12, Q=70. Steps: 1) Equate Qd and Qs, 2) Solve for P, 3) Substitute P to find Q.

## Question 1b
Initial Q=80 (P=10), Final Q=100 (P=6). %ΔQ=(100-80)/80=1/4, %ΔP=(6-10)/10=-2/5. Elasticity=-0.625. Demand is inelastic at P=10.
```

### Criteria File

```
Question 1a: 3,calculation steps for equilibrium|2,correct equilibrium values
Question 1b: 2,price elasticity calculation steps|1,correct elasticity value|2,result interpretation
```

### Guidelines File

```
Check mathematical accuracy and step-by-step calculations
Verify correct use of economic concepts and terminology
Assess quality of graphical representations and interpretations
```

## Deployment Instructions

To deploy the application to your own environment:

1. Clone the repository:
   ```
   git clone https://github.com/tomoto0/exam-marker-web.git
   cd exam-marker-web
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file with your Gemini API key:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

4. Build the application:
   ```
   npm run build
   ```

5. Deploy to Cloudflare Pages:
   ```
   npx wrangler pages deploy .next --project-name exam-marker-web
   ```

Alternatively, you can deploy to any hosting service that supports Next.js applications, such as Vercel or Netlify.

## Troubleshooting

### Common Issues

- **File Upload Errors**: Ensure your files are in the correct format and not too large
- **Processing Errors**: Check that your PDF files are properly formatted and readable
- **API Errors**: Verify that your Gemini API key is valid and has sufficient quota

### Getting Help

If you encounter any issues, please:
1. Check the console for error messages
2. Verify your file formats match the requirements
3. Ensure your Gemini API key is valid and has sufficient quota

## Technical Details

The application is built with:
- Next.js for the frontend and API routes
- Tailwind CSS for styling
- Python backend for PDF processing and Gemini API integration
