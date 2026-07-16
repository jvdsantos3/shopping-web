import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import App from './App'
import { AuthProvider } from './auth/AuthContext'

const STORAGE_KEY = 'shopping-web:auth'

function renderApp(initialPath = '/') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('App', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('redirects an unauthenticated visitor from the protected shell to /login', () => {
    renderApp('/')

    expect(screen.getByRole('heading', { name: 'Shopping' })).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
  })

  it('shows the authenticated shell with the profile name when a session exists', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        accessToken: 'token-xyz',
        user: { id: '1', nome: 'Ana Admin', email: 'admin@shopping.local', perfil: 'admin' },
      }),
    )

    renderApp('/')

    expect(screen.getByText(/Bem-vindo\(a\), Ana Admin/)).toBeInTheDocument()
    expect(screen.getAllByText('Admin').length).toBeGreaterThan(0)
  })
})
