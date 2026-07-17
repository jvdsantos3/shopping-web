import { Field } from '@base-ui/react/field'
import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { AppShell } from '../components/AppShell'
import {
  ApiError,
  createPurchaseRequest,
  uploadAttachments,
  type PurchaseRequest,
  type Urgency,
} from '../lib/api'
import { validateCreatePurchaseRequestForm } from '../lib/purchase-request-schema'

const inputClassName =
  'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/20'

const labelClassName = 'text-sm font-medium text-slate-700'

const ACCEPTED_TYPES = 'application/pdf,image/jpeg,image/png'

export function NewPurchaseRequestPage() {
  const { accessToken } = useAuth()
  const navigate = useNavigate()
  const idempotencyKey = useMemo(() => crypto.randomUUID(), [])

  const [item, setItem] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [justification, setJustification] = useState('')
  const [urgency, setUrgency] = useState<Urgency | ''>('')
  const [suggestedSupplier, setSuggestedSupplier] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [uploadWarnings, setUploadWarnings] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setUploadWarnings([])

    const values = {
      item,
      quantity: Number(quantity),
      justification,
      urgency: urgency as Urgency,
      suggestedSupplier: suggestedSupplier.trim() || undefined,
    }
    const validationErrors = validateCreatePurchaseRequestForm(values)
    setFieldErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0 || !accessToken) {
      return
    }

    if (files.length > 5) {
      setError('Selecione no máximo 5 arquivos.')
      return
    }

    setIsSubmitting(true)
    try {
      const created = await createPurchaseRequest(
        accessToken,
        {
          item: values.item,
          quantity: values.quantity,
          justification: values.justification,
          urgency: values.urgency,
          suggestedSupplier: values.suggestedSupplier,
        },
        idempotencyKey,
      )

      let rejectedMessages: string[] = []
      if (files.length > 0) {
        try {
          const upload = await uploadAttachments(accessToken, created.id, files)
          rejectedMessages = upload.rejected.map((r) => `${r.fileName}: ${r.reason}`)
        } catch (uploadError) {
          rejectedMessages = [
            uploadError instanceof Error
              ? uploadError.message
              : 'Falha ao enviar anexos. A solicitação foi criada; você pode anexar depois.',
          ]
        }
      }

      navigate(`/solicitacoes/${created.id}/confirmacao`, {
        replace: true,
        state: { request: created, rejectedAttachments: rejectedMessages } satisfies ConfirmationLocationState,
      })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível abrir a solicitação.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900">Nova solicitação de compra</h1>
        <p className="mt-1 text-sm text-slate-600">
          Preencha os dados. Após o envio você receberá um protocolo e poderá acompanhar o andamento.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-lg border border-slate-200 bg-white p-6" noValidate>
        <Field.Root className="space-y-1">
          <Field.Label className={labelClassName}>Item</Field.Label>
          <Field.Control
            required
            value={item}
            onValueChange={(value) => setItem(value)}
            className={inputClassName}
          />
          {fieldErrors.item ? <p className="text-xs text-red-600">{fieldErrors.item}</p> : null}
        </Field.Root>

        <Field.Root className="space-y-1">
          <Field.Label className={labelClassName}>Quantidade</Field.Label>
          <Field.Control
            type="number"
            required
            min={1}
            step={1}
            value={quantity}
            onValueChange={(value) => setQuantity(value)}
            className={inputClassName}
          />
          {fieldErrors.quantity ? <p className="text-xs text-red-600">{fieldErrors.quantity}</p> : null}
        </Field.Root>

        <Field.Root className="space-y-1">
          <Field.Label className={labelClassName}>Justificativa</Field.Label>
          <textarea
            id="justification"
            aria-label="Justificativa"
            required
            value={justification}
            onChange={(event) => setJustification(event.target.value)}
            rows={4}
            className={inputClassName}
          />
          {fieldErrors.justification ? (
            <p className="text-xs text-red-600">{fieldErrors.justification}</p>
          ) : null}
        </Field.Root>

        <Field.Root className="space-y-1">
          <Field.Label className={labelClassName}>Urgência</Field.Label>
          <select
            id="urgency"
            aria-label="Urgência"
            required
            value={urgency}
            onChange={(event) => setUrgency(event.target.value as Urgency | '')}
            className={inputClassName}
          >
            <option value="">Selecione</option>
            <option value="low">Baixa</option>
            <option value="medium">Média</option>
            <option value="high">Alta</option>
          </select>
          {fieldErrors.urgency ? <p className="text-xs text-red-600">{fieldErrors.urgency}</p> : null}
        </Field.Root>

        <Field.Root className="space-y-1">
          <Field.Label className={labelClassName}>Fornecedor sugerido (opcional)</Field.Label>
          <Field.Control
            value={suggestedSupplier}
            onValueChange={(value) => setSuggestedSupplier(value)}
            className={inputClassName}
          />
        </Field.Root>

        <Field.Root className="space-y-1">
          <Field.Label className={labelClassName}>Anexos (até 5 · PDF, JPEG ou PNG · máx. 10 MB cada)</Field.Label>
          <input
            type="file"
            accept={ACCEPTED_TYPES}
            multiple
            onChange={(event) => setFiles(Array.from(event.target.files ?? []).slice(0, 5))}
            className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-700"
          />
          {files.length > 0 ? (
            <ul className="text-xs text-slate-500">
              {files.map((file) => (
                <li key={`${file.name}-${file.size}`}>{file.name}</li>
              ))}
            </ul>
          ) : null}
        </Field.Root>

        {error ? (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        ) : null}
        {uploadWarnings.length > 0 ? (
          <ul className="text-sm text-amber-700">
            {uploadWarnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        ) : null}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-[var(--color-brand)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-brand-hover)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Enviando…' : 'Abrir solicitação'}
          </button>
          <Link to="/solicitacoes" className="text-sm text-slate-600 hover:text-slate-900">
            Cancelar
          </Link>
        </div>
      </form>
    </AppShell>
  )
}

export interface ConfirmationLocationState {
  request: PurchaseRequest
  rejectedAttachments?: string[]
}
