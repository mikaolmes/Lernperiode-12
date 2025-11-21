import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Mein Blog',
  description: 'Mini-Blog-Plattform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de">
      <body>
        {children}
      </body>
    </html>
  )
}