import type { Metadata } from 'next'
import { AuthProvider } from './features/auth/useAuth'
import { ThemeProvider } from './core/theme'
import Navigation from './shared/Navigation'
import './index.css'

export const metadata: Metadata = {
  title: 'MindGarden',
  description: 'AI-powered emotional wellness platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ThemeProvider>
            <Navigation />
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
