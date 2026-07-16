import { Field } from '@base-ui/react/field'
import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

const inputClassName =
  'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/20'

const labelClassName = 'text-sm font-medium text-slate-700'

export function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (isAuthenticated) {
    const redirectTo = (location.state as { from?: string } | null)?.from ?? '/'
    return <Navigate to={redirectTo} replace />
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      await login(email, password)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível autenticar.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-5 rounded-lg border border-slate-200 bg-white p-8 shadow-sm"
        noValidate
      >
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Shopping</h1>
          <p className="text-sm text-slate-500">Entre com seu email e senha</p>
        </div>

        <Field.Root className="space-y-1">
          <Field.Label className={labelClassName}>Email</Field.Label>
          <Field.Control
            type="email"
            required
            autoComplete="email"
            value={email}
            onValueChange={(value) => setEmail(value)}
            className={inputClassName}
          />
        </Field.Root>

        <Field.Root className="space-y-1">
          <Field.Label className={labelClassName}>Senha</Field.Label>
          <Field.Control
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onValueChange={(value) => setPassword(value)}
            className={inputClassName}
          />
        </Field.Root>

        {error ? (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-[var(--color-brand)] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-brand-hover)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </main>
  )
}
