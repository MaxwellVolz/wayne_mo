import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Crazy Taxi Management',
  description: 'An AI taxi fleet management automation game',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
