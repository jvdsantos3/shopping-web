import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '../auth/AuthContext'
import { ApiError, login as mockedLogin } from '../lib/api'
import { LoginPage } from './LoginPage'

vi.mock('../lib/api', async () => {
  const actual = await vi.importActual<typeof import('../lib/api')>('../lib/api')
  return { ...actual, login: vi.fn() }
})

const STORAGE_KEY = 'shopping-web:auth'

function renderLoginPage() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<div>Home shell</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('LoginPage', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.mocked(mockedLogin).mockReset()
  })

  it('stores the token and navigates to the shell on successful login', async () => {
    const user = userEvent.setup()
    vi.mocked(mockedLogin).mockResolvedValue({
      accessToken: 'token-abc',
      user: { id: '1', nome: 'Ana Admin', email: 'admin@shopping.local', perfil: 'admin' },
    })

    renderLoginPage()

    await user.type(screen.getByLabelText('Email'), 'admin@shopping.local')
    await user.type(screen.getByLabelText('Senha'), 'Senha123!')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => expect(screen.getByText('Home shell')).toBeInTheDocument())

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
    expect(stored.accessToken).toBe('token-abc')
    expect(mockedLogin).toHaveBeenCalledWith('admin@shopping.local', 'Senha123!')
  })

  it('shows an error message and does not store a session when login fails', async () => {
    const user = userEvent.setup()
    vi.mocked(mockedLogin).mockRejectedValue(new ApiError('Credenciais inválidas', 401))

    renderLoginPage()

    await user.type(screen.getByLabelText('Email'), 'admin@shopping.local')
    await user.type(screen.getByLabelText('Senha'), 'wrong-password')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Credenciais inválidas')
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
    expect(screen.queryByText('Home shell')).not.toBeInTheDocument()
  })
})
