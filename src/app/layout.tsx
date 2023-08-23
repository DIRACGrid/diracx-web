import './globals.css';
import { Inter } from 'next/font/google';
import { OIDCProvider } from './components/OIDCUtils';

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'diracX',
  description: 'Distributed Infrastructure with Remote Agent Controller',
}

const configuration = {
  client_id: 'interactive.public.short',
  redirect_uri: 'http://localhost:3000/dashboard',
  scope: 'openid profile email api offline_access',
  authority: 'https://demo.duendesoftware.com',
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <OIDCProvider configuration={ configuration }>
          {children}
        </OIDCProvider>
      </body>
    </html>
  )
}
