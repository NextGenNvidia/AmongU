import type { Metadata } from 'next';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'AmongU | A Hackathon of Code, Creativity & Sabotage',
  description: 'AmongU — A Hackathon of Code, Creativity & Sabotage at KIET Deemed to be University',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body text-gray-100 antialiased selection:bg-crew-cyan selection:text-black">
        {children}
      </body>
    </html>
  );
}
