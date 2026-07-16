import { useAuth } from '../auth/AuthContext'

// AD-010: persisted role values stay in English; the UI maps them to PT-BR labels.
const ROLE_LABELS: Record<string, string> = {
  requester: 'Solicitante',
  purchasing: 'Compras',
  director: 'Diretor',
  admin: 'Administrador',
}

export function HomePage() {
  const { user, logout } = useAuth()
  const roleLabel = user ? ROLE_LABELS[user.role] ?? user.role : ''

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
        <div>
          <p className="text-sm font-semibold text-slate-900">Shopping</p>
          <p className="text-xs text-slate-500">{roleLabel}</p>
        </div>
        <button
          type="button"
          onClick={logout}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 transition-colors hover:bg-slate-100"
        >
          Sair
        </button>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-lg font-semibold text-slate-900">
          Bem-vindo(a), {user?.name}
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Perfil: <span className="font-medium">{roleLabel}</span>
        </p>
      </main>
    </div>
  )
}
