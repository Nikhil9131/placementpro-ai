import type { Metadata } from 'next';
import './globals.css';
import Providers from '../components/Provider';
import LayoutWrapper from '../components/LayoutWrapper';

export const metadata: Metadata = {
  title: 'PlacementPro AI - Placement & Internship Prep',
  description: 'AI-powered placement preparation platform featuring Aptitude portal, DSA tracker, AI Resume analysis, and AI Mock Interviews.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>
          <LayoutWrapper>{children}</LayoutWrapper>
        </Providers>
      </body>
    </html>
  );
}

