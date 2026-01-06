import type { Metadata } from 'next'
import { Racing_Sans_One } from 'next/font/google'
import './globals.css'

const racingSansOne = Racing_Sans_One({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-racing-sans-one',
  display: 'block',
  preload: true,
})

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
    <html lang="en" className={`${racingSansOne.variable} fonts-loaded`}>
      <body>{children}</body>
    </html>
  )
}
