import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Economics Exam Auto-Grader",
  description: "Web application for automated grading of economics exams",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          <header className="bg-blue-700 text-white shadow-md">
            <div className="container mx-auto px-4 py-6">
              <h1 className="text-3xl font-bold">Economics Exam Auto-Grader</h1>
              <p className="mt-2 text-blue-100">Automated grading system for economics exams</p>
            </div>
          </header>
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
          <footer className="bg-gray-100 border-t border-gray-200 mt-12">
            <div className="container mx-auto px-4 py-6 text-center text-gray-600">
              <p>Economics Exam Auto-Grader &copy; {new Date().getFullYear()}</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
