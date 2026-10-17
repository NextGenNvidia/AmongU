import type { Metadata } from 'next';
import '../styles/globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://amongu.vercel.app'),
  title: 'AmongU | A Hackathon of Code, Creativity & Sabotage',
  description:
    'Join AmongU — an immersive social deduction hackathon at KIET Deemed to be University. Team up, ship software, and deduce the covert Impostor before the final reveal. ₹10,000 Prize Pool.',
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
    title: 'AmongU — A Hackathon of Code, Creativity & Sabotage',
    description:
      'Code with your crew, ship real projects, and uncover the secret Impostor among you. Organized by NextGen Supercomputing Club at KIET Deemed to be University. ₹10,000 in Prizes.',
    url: 'https://amongu.vercel.app',
    siteName: 'AmongU Hackathon',
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
    title: 'AmongU — A Hackathon of Code, Creativity & Sabotage',
    description:
      'Code with your crew, ship real projects, and uncover the secret Impostor among you. Organized by NextGen Supercomputing Club at KIET Deemed to be University.',
    images: ['/images/wp7932884.webp'],
  },
  icons: {
    icon: '/favicon.ico',
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
