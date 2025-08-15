import { AuthGuard } from '@/components/auth-guard'

export default function RequestsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      {children}
    </AuthGuard>
  )
}
