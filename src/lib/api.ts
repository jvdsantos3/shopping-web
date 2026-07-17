export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export type Role = 'requester' | 'purchasing' | 'director' | 'admin'

export type Urgency = 'low' | 'medium' | 'high'

export type RequestStatus =
  | 'triage'
  | 'in_review'
  | 'awaiting_approval'
  | 'approved'
  | 'rejected'
  | 'completed'

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

export interface PurchaseRequest {
  id: string
  protocol: string
  item: string
  quantity: number
  justification: string
  urgency: Urgency
  suggestedSupplier?: string | null
  status: RequestStatus
  createdAt: string
}

export interface MyPurchaseRequestSummary {
  id: string
  protocol: string
  status: RequestStatus
  createdAt: string
  lastMovement: {
    type: string
    description: string
    createdAt: string
  } | null
}

export interface UploadAttachmentsResult {
  stored: Array<{ id: string; fileName: string; mimeType: string; sizeBytes: number }>
  rejected: Array<{ fileName: string; reason: string }>
}

export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

function authHeaders(token: string, extra?: HeadersInit): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    ...extra,
  }
}

async function readErrorMessage(response: Response, fallback: string): Promise<string> {
  if (response.status === 401) {
    return 'Sessão expirada. Faça login novamente.'
  }
  if (response.status === 403) {
    return 'Você não tem permissão para esta ação.'
  }
  if (response.status === 400 || response.status === 422) {
    return 'Dados inválidos. Verifique os campos e tente novamente.'
  }
  return fallback
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
    throw new ApiError(await readErrorMessage(response, 'Não foi possível autenticar. Tente novamente.'), response.status)
  }

  return (await response.json()) as LoginResult
}

export async function createPurchaseRequest(
  token: string,
  body: {
    item: string
    quantity: number
    justification: string
    urgency: Urgency
    suggestedSupplier?: string
  },
  idempotencyKey: string,
): Promise<PurchaseRequest> {
  let response: Response
  try {
    response = await fetch(`${API_URL}/purchase-requests`, {
      method: 'POST',
      headers: authHeaders(token, {
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
      }),
      body: JSON.stringify(body),
    })
  } catch {
    throw new ApiError('Não foi possível conectar ao servidor.', 0)
  }

  if (!response.ok) {
    throw new ApiError(
      await readErrorMessage(response, 'Não foi possível abrir a solicitação.'),
      response.status,
    )
  }

  return (await response.json()) as PurchaseRequest
}

export async function uploadAttachments(
  token: string,
  purchaseRequestId: string,
  files: File[],
): Promise<UploadAttachmentsResult> {
  const form = new FormData()
  for (const file of files) {
    form.append('files', file)
  }

  let response: Response
  try {
    response = await fetch(`${API_URL}/purchase-requests/${purchaseRequestId}/attachments`, {
      method: 'POST',
      headers: authHeaders(token),
      body: form,
    })
  } catch {
    throw new ApiError('Não foi possível enviar os anexos.', 0)
  }

  if (!response.ok) {
    throw new ApiError(
      await readErrorMessage(response, 'Não foi possível enviar os anexos.'),
      response.status,
    )
  }

  return (await response.json()) as UploadAttachmentsResult
}

export async function listMyPurchaseRequests(token: string): Promise<MyPurchaseRequestSummary[]> {
  let response: Response
  try {
    response = await fetch(`${API_URL}/purchase-requests/mine`, {
      headers: authHeaders(token),
    })
  } catch {
    throw new ApiError('Não foi possível carregar suas solicitações.', 0)
  }

  if (!response.ok) {
    throw new ApiError(
      await readErrorMessage(response, 'Não foi possível carregar suas solicitações.'),
      response.status,
    )
  }

  return (await response.json()) as MyPurchaseRequestSummary[]
}
