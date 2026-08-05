import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI Resume Builder — Powered by Gemini 2.5',
  description:
    'Generate tailored, ATS-optimized resumes in seconds using Google Gemini AI. Stand out from the crowd.',
  keywords: ['AI resume', 'resume builder', 'ATS optimization', 'Gemini AI', 'job application'],
  openGraph: {
    title: 'AI Resume Builder',
    description: 'Generate ATS-optimized resumes in seconds with Gemini AI',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-gray-950 text-gray-100 antialiased`}>
        {children}
      </body>
    </html>
  );
}
