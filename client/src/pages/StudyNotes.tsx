import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, BookOpen, Clock, Brain, Lightbulb } from "lucide-react";
import { MainLayout } from "@/components/MainLayout";
import ReactMarkdown from "react-markdown";

interface StudyNotesData {
  id: string;
  title: string;
  description?: string;
  content: string;
  subject: string;
  level: string;
  term?: string;
}

export default function StudyNotes() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/study-notes/:topicId");
  const [startTime] = useState(Date.now());
  
  // Get URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const subjectName = urlParams.get('subject') || 'Subject';
  const topicId = params?.topicId;

  // Fetch study notes data
  const { data: studyNotes, isLoading, error } = useQuery<StudyNotesData>({
    queryKey: ['/api/study-notes', topicId],
    enabled: !!topicId,
  });

  // Handle back navigation
  const handleBack = () => {
    setLocation('/');
  };

  if (!topicId) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto text-center py-16">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Topic Not Found</h1>
          <p className="text-gray-600 mb-6">The study notes topic you're looking for doesn't exist.</p>
          <Button onClick={handleBack} className="bg-gradient-to-r from-orange-500 to-yellow-400">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </MainLayout>
    );
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto py-8">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Study Notes</h2>
            <p className="text-gray-600">
              {studyNotes ? 'Loading content...' : 'Generating AI-powered study notes for you...'}
            </p>
            <div className="mt-4 max-w-md mx-auto">
              <div className="bg-blue-50 rounded-lg p-4">
                <Brain className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-blue-700">
                  Our AI is creating comprehensive study materials tailored to your level and curriculum.
                </p>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !studyNotes) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto text-center py-16">
          <FileText className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Failed to Load Study Notes</h1>
          <p className="text-gray-600 mb-6">
            We couldn't load the study notes for this topic. Please try again later.
          </p>
          <Button onClick={handleBack} className="bg-gradient-to-r from-orange-500 to-yellow-400">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={handleBack}
            className="mb-4 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    <BookOpen className="h-3 w-3 mr-1" />
                    {subjectName}
                  </Badge>
                  {studyNotes.level && (
                    <Badge variant="outline" className="border-blue-300 text-blue-700">
                      {studyNotes.level}
                    </Badge>
                  )}
                  {studyNotes.term && (
                    <Badge variant="outline" className="border-blue-300 text-blue-700">
                      {studyNotes.term}
                    </Badge>
                  )}
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {studyNotes.title}
                </h1>
                {studyNotes.description && (
                  <p className="text-gray-700 text-lg">
                    {studyNotes.description}
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-4 text-sm text-blue-600">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>Study Time</span>
                </div>
                <div className="flex items-center">
                  <Lightbulb className="h-4 w-4 mr-1" />
                  <span>AI Generated</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Study Notes Content */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50">
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <span>Study Notes</span>
            </CardTitle>
            <CardDescription>
              Comprehensive notes tailored to your curriculum and level
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-ul:text-gray-700 prose-ol:text-gray-700">
              <ReactMarkdown
                components={{
                  h1: ({ children, ...props }) => (
                    <h1 className="text-2xl font-bold text-gray-900 mt-8 mb-4 first:mt-0" {...props}>
                      {children}
                    </h1>
                  ),
                  h2: ({ children, ...props }) => (
                    <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3" {...props}>
                      {children}
                    </h2>
                  ),
                  h3: ({ children, ...props }) => (
                    <h3 className="text-lg font-medium text-gray-900 mt-4 mb-2" {...props}>
                      {children}
                    </h3>
                  ),
                  p: ({ children, ...props }) => (
                    <p className="text-gray-700 leading-relaxed mb-4" {...props}>
                      {children}
                    </p>
                  ),
                  ul: ({ children, ...props }) => (
                    <ul className="list-disc pl-6 mb-4 space-y-1 text-gray-700" {...props}>
                      {children}
                    </ul>
                  ),
                  ol: ({ children, ...props }) => (
                    <ol className="list-decimal pl-6 mb-4 space-y-1 text-gray-700" {...props}>
                      {children}
                    </ol>
                  ),
                  li: ({ children, ...props }) => (
                    <li className="leading-relaxed" {...props}>
                      {children}
                    </li>
                  ),
                  strong: ({ children, ...props }) => (
                    <strong className="font-semibold text-gray-900" {...props}>
                      {children}
                    </strong>
                  ),
                  em: ({ children, ...props }) => (
                    <em className="italic text-gray-800" {...props}>
                      {children}
                    </em>
                  ),
                  blockquote: ({ children, ...props }) => (
                    <blockquote className="border-l-4 border-blue-300 pl-4 py-2 my-4 bg-blue-50 text-gray-700 italic" {...props}>
                      {children}
                    </blockquote>
                  ),
                  code: ({ children, ...props }) => (
                    <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono text-gray-800" {...props}>
                      {children}
                    </code>
                  ),
                  pre: ({ children, ...props }) => (
                    <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto mb-4" {...props}>
                      {children}
                    </pre>
                  ),
                }}
              >
                {studyNotes.content}
              </ReactMarkdown>
            </div>
          </CardContent>
        </Card>

        {/* Footer Actions */}
        <div className="mt-8 flex justify-center space-x-4">
          <Button 
            onClick={handleBack}
            variant="outline"
            className="border-blue-300 text-blue-700 hover:bg-blue-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <Button 
            onClick={() => window.print()}
            className="bg-gradient-to-r from-blue-500 to-indigo-600"
          >
            <FileText className="h-4 w-4 mr-2" />
            Print Notes
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}