import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ConfirmationPage } from '../pages/ConfirmationPage'
import { NewPurchaseRequestPage } from '../pages/NewPurchaseRequestPage'

const createPurchaseRequest = vi.fn()
const uploadAttachments = vi.fn()
const listMyPurchaseRequests = vi.fn()

vi.mock('../lib/api', async () => {
  const actual = await vi.importActual<typeof import('../lib/api')>('../lib/api')
  return {
    ...actual,
    createPurchaseRequest: (...args: unknown[]) => createPurchaseRequest(...args),
    uploadAttachments: (...args: unknown[]) => uploadAttachments(...args),
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

describe('NewPurchaseRequestPage', () => {
  beforeEach(() => {
    createPurchaseRequest.mockReset()
    uploadAttachments.mockReset()
  })

  it('submits a valid form, creates the request, and shows the confirmation protocol without an extra fetch', async () => {
    const user = userEvent.setup()
    createPurchaseRequest.mockResolvedValue({
      id: 'pr-1',
      protocol: 'PR-2026-00042',
      item: 'Notebook',
      quantity: 2,
      justification: 'Equipe nova',
      urgency: 'high',
      status: 'triage',
      createdAt: '2026-07-16T12:00:00.000Z',
    })

    render(
      <MemoryRouter initialEntries={['/solicitacoes/nova']}>
        <Routes>
          <Route path="/solicitacoes/nova" element={<NewPurchaseRequestPage />} />
          <Route path="/solicitacoes/:id/confirmacao" element={<ConfirmationPage />} />
        </Routes>
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText(/^Item/), 'Notebook')
    await user.clear(screen.getByLabelText(/^Quantidade/))
    await user.type(screen.getByLabelText(/^Quantidade/), '2')
    await user.type(screen.getByLabelText(/^Justificativa/), 'Equipe nova')
    await user.selectOptions(screen.getByLabelText(/^Urgência/), 'high')
    await user.click(screen.getByRole('button', { name: /Abrir solicitação/i }))

    expect(createPurchaseRequest).toHaveBeenCalledTimes(1)
    expect(await screen.findByText('PR-2026-00042')).toBeInTheDocument()
    expect(screen.getByText(/Triagem/i)).toBeInTheDocument()
    expect(listMyPurchaseRequests).not.toHaveBeenCalled()
  })
})
