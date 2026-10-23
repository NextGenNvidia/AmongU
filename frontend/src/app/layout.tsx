import type { Metadata } from 'next';
import '../styles/globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://amongu.vercel.app'),
  title: 'AmongU',
  description:
    'Join AmongU — an immersive social deduction hackathon at KIET Deemed to be University. Team up, ship software, and deduce the covert Impostor before the final reveal. ₹25,000 Prize Pool.',
  keywords: [
    'AmongU',
    'Hackathon',
    'KIET',
    'KIET Deemed to be University',
    'NextGen Supercomputing Club',
    'Coding Competition',
    'Social Deduction',
    'Impostor',
    'Web Development',
  ],
  authors: [{ name: 'NextGen Supercomputing Club' }],
  openGraph: {
    title: 'AmongU',
    description:
      'Code with your crew, ship real projects, and uncover the secret Impostor among you. Organized by NextGen Supercomputing Club at KIET Deemed to be University. ₹25,000 in Prizes.',
    url: 'https://amongu.vercel.app',
    siteName: 'AmongU',
    images: [
      {
        url: '/images/wp7932884.webp',
        width: 1200,
        height: 675,
        alt: 'AmongU Hackathon — There is an Impostor Among Us',
        type: 'image/webp',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AmongU',
    description:
      'Code with your crew, ship real projects, and uncover the secret Impostor among you. Organized by NextGen Supercomputing Club at KIET Deemed to be University.',
    images: ['/images/wp7932884.webp'],
  },
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
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/images/61d183393a856e0004c6334b.webp" type="image/webp" />
        <link rel="apple-touch-icon" href="/images/61d183393a856e0004c6334b.webp" />
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
