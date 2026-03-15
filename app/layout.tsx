import { Inter } from 'next/font/google'
import './globals.css'
import Header from '../components/common/Header'
import Footer from '../components/common/Footer'
import NextAuthProvider from './providers/NextAuthProvider'
import { AuthProvider } from '../contexts/AuthContext'

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
          <AuthProvider>  {/* ✅ AuthProvider داخل NextAuthProvider */}
            <Header />
            <main className="min-h-screen mt-7">
              {children}
            </main>
            <Footer />
          </AuthProvider>
        </NextAuthProvider>
      </body>
    </html>
  )
}