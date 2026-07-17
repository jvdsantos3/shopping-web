export const STATUS_LABELS: Record<string, string> = {
  triage: 'Triagem',
  in_review: 'Em análise',
  awaiting_approval: 'Aguardando aprovação',
  approved: 'Aprovado',
  rejected: 'Reprovado',
  completed: 'Concluído',
}

export const URGENCY_LABELS: Record<string, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
}

export const ROLE_LABELS: Record<string, string> = {
  requester: 'Solicitante',
  purchasing: 'Compras',
  director: 'Diretor',
  admin: 'Administrador',
}

export function formatDatePt(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return date.toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}
