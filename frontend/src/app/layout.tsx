import type { Metadata } from 'next';
import { Fredoka, Nunito } from 'next/font/google';
import '../styles/globals.css';
import { StarryBackground } from '../components/animations/StarryBackground';

const fredoka = Fredoka({
  subsets: ['latin'],
  variable: '--font-fredoka',
  weight: ['400', '600', '700'],
});

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
  weight: ['400', '600', '700', '900'],
});

export const metadata: Metadata = {
  title: 'AmongU | The Ultimate College Club Hackathon',
  description: 'College club hackathon platform inspired by Among Us. Build, sabotage, survive!',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fredoka.variable} ${nunito.variable} scroll-smooth`}>
      <body className="font-body bg-space text-white selection:bg-crew-cyan selection:text-black">
        <StarryBackground />
        {children}
      </body>
    </html>
  );
}
