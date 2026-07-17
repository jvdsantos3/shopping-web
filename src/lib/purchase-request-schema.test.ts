import { describe, expect, it } from 'vitest'
import { validateCreatePurchaseRequestForm } from './purchase-request-schema'

describe('validateCreatePurchaseRequestForm', () => {
  it('accepts a valid payload', () => {
    expect(
      validateCreatePurchaseRequestForm({
        item: 'Notebook',
        quantity: 2,
        justification: 'Equipe nova',
        urgency: 'high',
      }),
    ).toEqual({})
  })

  it('returns PT-BR field errors for missing/invalid values', () => {
    const errors = validateCreatePurchaseRequestForm({
      item: '',
      quantity: 0,
      justification: '',
      urgency: 'high',
    })

    expect(errors.item).toMatch(/item/i)
    expect(errors.quantity).toBeTruthy()
    expect(errors.justification).toMatch(/justificativa/i)
  })
})
