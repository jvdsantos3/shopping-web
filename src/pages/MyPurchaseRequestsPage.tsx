import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { AppShell } from '../components/AppShell'
import { ApiError, listMyPurchaseRequests, type MyPurchaseRequestSummary } from '../lib/api'
import { formatDatePt, STATUS_LABELS } from '../lib/labels'

const POLL_INTERVAL_MS = 20_000

export function MyPurchaseRequestsPage() {
  const { accessToken } = useAuth()
  const [items, setItems] = useState<MyPurchaseRequestSummary[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(async () => {
    if (!accessToken) {
      return
    }
    try {
      const data = await listMyPurchaseRequests(accessToken)
      setItems(data)
      setError(null)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível carregar as solicitações.')
    } finally {
      setIsLoading(false)
    }
  }, [accessToken])

  useEffect(() => {
    void load()
    const timer = window.setInterval(() => {
      void load()
    }, POLL_INTERVAL_MS)
    return () => window.clearInterval(timer)
  }, [load])

  return (
    <AppShell>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Minhas solicitações</h1>
          <p className="mt-1 text-sm text-slate-600">Atualiza automaticamente a cada 20 segundos.</p>
        </div>
        <Link
          to="/solicitacoes/nova"
          className="rounded-md bg-[var(--color-brand)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-brand-hover)]"
        >
          Nova solicitação
        </Link>
      </div>

      {error ? (
        <p role="alert" className="mb-4 text-sm text-red-600">
          {error}
        </p>
      ) : null}

      {isLoading ? <p className="text-sm text-slate-600">Carregando…</p> : null}

      {!isLoading && items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
          <p className="text-sm text-slate-600">Você ainda não abriu nenhuma solicitação.</p>
          <Link to="/solicitacoes/nova" className="mt-3 inline-block text-sm font-medium text-[var(--color-brand)]">
            Abrir a primeira
          </Link>
        </div>
      ) : null}

      {items.length > 0 ? (
        <ul className="divide-y divide-slate-200 overflow-hidden rounded-lg border border-slate-200 bg-white">
          {items.map((item) => (
            <li key={item.id} className="px-4 py-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-semibold text-slate-900">{item.protocol}</p>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                  {STATUS_LABELS[item.status] ?? item.status}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">Aberta em {formatDatePt(item.createdAt)}</p>
              <p className="mt-2 text-sm text-slate-700">
                Última movimentação:{' '}
                {item.lastMovement
                  ? `${item.lastMovement.description} · ${formatDatePt(item.lastMovement.createdAt)}`
                  : '—'}
              </p>
            </li>
          ))}
        </ul>
      ) : null}
    </AppShell>
  )
}
