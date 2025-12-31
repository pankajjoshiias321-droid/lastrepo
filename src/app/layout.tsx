import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/utils/auth'
import Navigation from '@/components/navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Learning Roadmap Generator',
  description: 'Generate personalized learning roadmaps with YouTube resources',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <Navigation />
          <main>
            {children}
          </main>
          <Toaster position="top-right" />
        </AuthProvider>
      </body>
    </html>
  )
}