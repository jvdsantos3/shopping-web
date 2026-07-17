import { Link, Navigate, useLocation } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { STATUS_LABELS, URGENCY_LABELS } from '../lib/labels'
import type { ConfirmationLocationState } from './NewPurchaseRequestPage'

export function ConfirmationPage() {
  const location = useLocation()
  const state = location.state as ConfirmationLocationState | null

  if (!state?.request) {
    return <Navigate to="/solicitacoes/nova" replace />
  }

  const { request, rejectedAttachments = [] } = state

  return (
    <AppShell>
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <p className="text-sm font-medium text-emerald-700">Solicitação aberta com sucesso</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">{request.protocol}</h1>
        <p className="mt-1 text-sm text-slate-600">
          Status inicial: <span className="font-medium">{STATUS_LABELS[request.status] ?? request.status}</span>
        </p>

        <dl className="mt-6 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
          <div>
            <dt className="text-slate-500">Item</dt>
            <dd className="font-medium">{request.item}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Quantidade</dt>
            <dd className="font-medium">{request.quantity}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-slate-500">Justificativa</dt>
            <dd className="font-medium">{request.justification}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Urgência</dt>
            <dd className="font-medium">{URGENCY_LABELS[request.urgency] ?? request.urgency}</dd>
          </div>
          {request.suggestedSupplier ? (
            <div>
              <dt className="text-slate-500">Fornecedor sugerido</dt>
              <dd className="font-medium">{request.suggestedSupplier}</dd>
            </div>
          ) : null}
        </dl>

        {rejectedAttachments.length > 0 ? (
          <div className="mt-6 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            <p className="font-medium">Alguns anexos não foram aceitos:</p>
            <ul className="mt-1 list-disc pl-5">
              {rejectedAttachments.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/solicitacoes"
            className="rounded-md bg-[var(--color-brand)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-brand-hover)]"
          >
            Ver minhas solicitações
          </Link>
          <Link
            to="/solicitacoes/nova"
            className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            Abrir outra
          </Link>
        </div>
      </div>
    </AppShell>
  )
}
