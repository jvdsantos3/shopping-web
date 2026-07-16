export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export type Perfil = 'solicitante' | 'compras' | 'diretor' | 'admin'

export interface AuthenticatedUser {
  id: string
  nome: string
  email: string
  perfil: Perfil
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

  const body: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    const message =
      body && typeof body === 'object' && 'message' in body && typeof body.message === 'string'
        ? body.message
        : DEFAULT_ERROR_MESSAGE
    throw new ApiError(message, response.status)
  }

  return body as LoginResult
}
