import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'KEScholarsHub — International Scholarships for Developing Countries',
  description: 'Discover fully-funded scholarships, fellowships, and grants for students from developing countries. Updated weekly with the latest opportunities worldwide.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}
