'use client';

import { useState, useCallback } from 'react';
import { api, GenerateResumeRequest, ResumeData } from '@/lib/api';

interface UseResumeReturn {
  resume: ResumeData | null;
  isGenerating: boolean;
  isImproving: boolean;
  error: string | null;
  processingTime: number | null;
  generateResume: (data: GenerateResumeRequest) => Promise<void>;
  improveSection: (section: string, content: string, jobDesc: string) => Promise<string>;
  reset: () => void;
}

export function useResume(): UseResumeReturn {
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isImproving, setIsImproving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingTime, setProcessingTime] = useState<number | null>(null);

  const generateResume = useCallback(async (data: GenerateResumeRequest) => {
    setIsGenerating(true);
    setError(null);
    setResume(null);

    try {
      const response = await api.generateResume(data);
      if (response.success) {
        setResume(response.resume);
        setProcessingTime(response.processing_time_ms);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Resume generation failed');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const improveSection = useCallback(
    async (section: string, content: string, jobDesc: string): Promise<string> => {
      setIsImproving(true);
      try {
        const response = await api.improveSection(section, content, jobDesc);
        return response.improved_content;
      } catch (err) {
        throw new Error(err instanceof Error ? err.message : 'Improvement failed');
      } finally {
        setIsImproving(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setResume(null);
    setError(null);
    setProcessingTime(null);
  }, []);

  return { resume, isGenerating, isImproving, error, processingTime, generateResume, improveSection, reset };
}
