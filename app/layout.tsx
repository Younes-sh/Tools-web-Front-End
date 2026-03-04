import { Inter } from 'next/font/google'
import './globals.css'
import Header from '../components/common/Header'
import Footer from '../components/common/Footer'
import NextAuthProvider from './providers/NextAuthProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'UltraPixel - AI Image Upscaler',
  description: 'Transform your low-quality images into stunning HD photos with AI technology',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NextAuthProvider>
          <Header />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
        </NextAuthProvider>
      </body>
    </html>
  )
}