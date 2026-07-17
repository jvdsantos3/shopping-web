import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MyPurchaseRequestsPage } from './MyPurchaseRequestsPage'

const listMyPurchaseRequests = vi.fn()

vi.mock('../lib/api', async () => {
  const actual = await vi.importActual<typeof import('../lib/api')>('../lib/api')
  return {
    ...actual,
    listMyPurchaseRequests: (...args: unknown[]) => listMyPurchaseRequests(...args),
  }
})

vi.mock('../auth/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'u1', name: 'Requester', email: 'requester@shopping.local', role: 'requester' },
    accessToken: 'token',
    isAuthenticated: true,
    login: vi.fn(),
    logout: vi.fn(),
  }),
}))

describe('MyPurchaseRequestsPage', () => {
  beforeEach(() => {
    listMyPurchaseRequests.mockReset()
  })

  it('lists own requests with protocol, status and last movement', async () => {
    listMyPurchaseRequests.mockResolvedValue([
      {
        id: 'pr-1',
        protocol: 'PR-2026-00001',
        status: 'triage',
        createdAt: '2026-07-16T12:00:00.000Z',
        lastMovement: {
          type: 'status_change',
          description: 'Purchase request opened',
          createdAt: '2026-07-16T12:00:00.000Z',
        },
      },
    ])

    render(
      <MemoryRouter>
        <MyPurchaseRequestsPage />
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('PR-2026-00001')).toBeInTheDocument()
    })
    expect(screen.getByText('Triagem')).toBeInTheDocument()
    expect(screen.getByText(/Purchase request opened/)).toBeInTheDocument()
    expect(listMyPurchaseRequests).toHaveBeenCalledWith('token')
  })
})
