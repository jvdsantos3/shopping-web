export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export type Role = 'requester' | 'purchasing' | 'director' | 'admin'

export interface AuthenticatedUser {
  id: string
  name: string
  email: string
  role: Role
}

export interface LoginResult {
  accessToken: string
  user: AuthenticatedUser
}

export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

const DEFAULT_ERROR_MESSAGE = 'Não foi possível autenticar. Tente novamente.'

// The API answers in English (AD-010) — the web layer maps status codes to
// the PT-BR messages shown in the UI instead of passing raw API text through.
function messageForStatus(status: number): string {
  if (status === 401) {
    return 'Credenciais inválidas.'
  }
  if (status === 400 || status === 422) {
    return 'Dados inválidos. Verifique email e senha.'
  }
  return DEFAULT_ERROR_MESSAGE
}

export async function login(email: string, password: string): Promise<LoginResult> {
  let response: Response
  try {
    response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
  } catch {
    throw new ApiError('Não foi possível conectar ao servidor.', 0)
  }

  if (!response.ok) {
    throw new ApiError(messageForStatus(response.status), response.status)
  }

  const body: unknown = await response.json().catch(() => null)
  return body as LoginResult
}
