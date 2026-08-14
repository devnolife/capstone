import { Inter, IBM_Plex_Mono } from 'next/font/google';
import localFont from 'next/font/local';

import { AdminLoginView } from './admin-login-view';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-plex-mono',
  display: 'swap',
});

const berkeleyMono = localFont({
  src: '../../../../../public/fonts/daytona/YVcQbJFyhl2tYYkDhFd2nL1KlxY.woff2',
  weight: '400',
  style: 'normal',
  variable: '--font-berkeley',
  display: 'swap',
});

export const metadata = {
  title: 'Login Admin · Capstone Informatika',
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className={`${inter.variable} ${ibmPlexMono.variable} ${berkeleyMono.variable}`}>
      <AdminLoginView />
    </div>
  );
}
