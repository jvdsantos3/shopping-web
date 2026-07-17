import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { AppShell } from '../components/AppShell'
import { ROLE_LABELS } from '../lib/labels'

export function HomePage() {
  const { user } = useAuth()
  const roleLabel = user ? ROLE_LABELS[user.role] ?? user.role : ''

  return (
    <AppShell>
      <h1 className="text-lg font-semibold text-slate-900">Bem-vindo(a), {user?.name}</h1>
      <p className="mt-2 text-sm text-slate-600">
        Perfil: <span className="font-medium">{roleLabel}</span>
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          to="/solicitacoes/nova"
          className="rounded-md bg-[var(--color-brand)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-brand-hover)]"
        >
          Nova solicitação
        </Link>
        <Link
          to="/solicitacoes"
          className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-white"
        >
          Minhas solicitações
        </Link>
      </div>
    </AppShell>
  )
}
