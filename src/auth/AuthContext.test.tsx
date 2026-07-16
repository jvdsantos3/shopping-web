import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError, login as mockedLogin } from '../lib/api'
import { AuthProvider, useAuth } from './AuthContext'

vi.mock('../lib/api', async () => {
  const actual = await vi.importActual<typeof import('../lib/api')>('../lib/api')
  return { ...actual, login: vi.fn() }
})

const STORAGE_KEY = 'shopping-web:auth'

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.mocked(mockedLogin).mockReset()
  })

  it('stores the access token and user after a successful login', async () => {
    vi.mocked(mockedLogin).mockResolvedValue({
      accessToken: 'token-123',
      user: { id: '1', nome: 'Ana Admin', email: 'admin@shopping.local', perfil: 'admin' },
    })

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider })

    await act(async () => {
      await result.current.login('admin@shopping.local', 'Senha123!')
    })

    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.accessToken).toBe('token-123')
    expect(result.current.user?.nome).toBe('Ana Admin')

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
    expect(stored.accessToken).toBe('token-123')
  })

  it('keeps the session empty when login fails with invalid credentials', async () => {
    vi.mocked(mockedLogin).mockRejectedValue(new ApiError('Credenciais inválidas', 401))

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider })

    await act(async () => {
      await expect(result.current.login('admin@shopping.local', 'wrong')).rejects.toThrow(
        'Credenciais inválidas',
      )
    })

    expect(result.current.isAuthenticated).toBe(false)
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })
})
