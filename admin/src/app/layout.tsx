import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AmongU • Admin Command Center',
  description: 'Organizer and Administrator Command Center for AmongU Hackathon',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#070b14] text-gray-100 antialiased selection:bg-crew-cyan selection:text-black">
        {children}
      </body>
    </html>
  );
}
