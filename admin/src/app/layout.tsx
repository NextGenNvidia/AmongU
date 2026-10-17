import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AmongU',
  description: 'Organizer and Administrator Command Center for AmongU Hackathon',
  icons: {
    icon: [
      { url: '/images/61d183393a856e0004c6334b.webp', type: 'image/webp' },
      { url: '/favicon.ico' },
    ],
    shortcut: '/images/61d183393a856e0004c6334b.webp',
    apple: '/images/61d183393a856e0004c6334b.webp',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/images/61d183393a856e0004c6334b.webp" type="image/webp" />
        <link rel="apple-touch-icon" href="/images/61d183393a856e0004c6334b.webp" />
      </head>
      <body className="min-h-screen bg-[#070b14] text-gray-100 antialiased selection:bg-crew-cyan selection:text-black">
        {children}
      </body>
    </html>
  );
}
