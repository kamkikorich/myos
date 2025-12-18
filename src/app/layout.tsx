import './globals.css'

export const metadata = {
  title: 'AI FlowChart Builder',
  description: 'Platform flowchart berkuasa AI untuk pembangunan software',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ms" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}