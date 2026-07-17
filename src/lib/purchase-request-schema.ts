import { z } from 'zod'

export const createPurchaseRequestSchema = z.object({
  item: z.string().min(1, 'Informe o item.'),
  quantity: z.coerce
    .number()
    .int('A quantidade deve ser um número inteiro.')
    .positive('A quantidade deve ser maior que zero.'),
  justification: z.string().min(1, 'Informe a justificativa.'),
  urgency: z.enum(['low', 'medium', 'high'], {
    message: 'Selecione a urgência.',
  }),
  suggestedSupplier: z.string().optional(),
})

export type CreatePurchaseRequestFormValues = z.infer<typeof createPurchaseRequestSchema>

export type CreatePurchaseRequestFormErrors = Partial<
  Record<keyof CreatePurchaseRequestFormValues, string>
>

export function validateCreatePurchaseRequestForm(
  values: CreatePurchaseRequestFormValues,
): CreatePurchaseRequestFormErrors {
  const result = createPurchaseRequestSchema.safeParse(values)
  if (result.success) {
    return {}
  }

  const errors: CreatePurchaseRequestFormErrors = {}
  for (const issue of result.error.issues) {
    const field = issue.path[0]
    if (
      (field === 'item' ||
        field === 'quantity' ||
        field === 'justification' ||
        field === 'urgency' ||
        field === 'suggestedSupplier') &&
      !errors[field]
    ) {
      errors[field] = issue.message
    }
  }
  return errors
}
