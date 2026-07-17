import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { ROLE_LABELS } from '../lib/labels'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm transition-colors ${isActive ? 'font-semibold text-[var(--color-brand)]' : 'text-slate-600 hover:text-slate-900'}`

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const roleLabel = user ? ROLE_LABELS[user.role] ?? user.role : ''

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-sm font-semibold text-slate-900">
              Shopping
            </Link>
            <nav className="flex items-center gap-4">
              <NavLink to="/solicitacoes" className={navLinkClass} end>
                Minhas solicitações
              </NavLink>
              <NavLink to="/solicitacoes/nova" className={navLinkClass}>
                Nova solicitação
              </NavLink>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-medium text-slate-900">{user?.name}</p>
              <p className="text-xs text-slate-500">{roleLabel}</p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 transition-colors hover:bg-slate-100"
            >
              Sair
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-6 py-8">{children}</main>
    </div>
  )
}
