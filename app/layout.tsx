import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'KEScholarsHub — International Scholarships for Developing Countries',
  description: 'Discover fully-funded scholarships, fellowships, and grants for students from developing countries. Updated weekly with the latest opportunities worldwide.',
  icons: {
    icon: '/favicon.svg',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6685247548040858" crossOrigin="anonymous"></script>
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
