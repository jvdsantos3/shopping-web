import { z } from 'zod'

// Mirrors the shape validated server-side (shopping-api `loginSchema`); only
// the error messages differ, since those are shown directly in the PT-BR UI.
export const loginSchema = z.object({
  email: z.string().email('Informe um email válido.'),
  password: z.string().min(1, 'Informe a senha.'),
})

export type LoginFormValues = z.infer<typeof loginSchema>

export type LoginFormErrors = Partial<Record<keyof LoginFormValues, string>>

export function validateLoginForm(values: LoginFormValues): LoginFormErrors {
  const result = loginSchema.safeParse(values)
  if (result.success) {
    return {}
  }

  const errors: LoginFormErrors = {}
  for (const issue of result.error.issues) {
    const field = issue.path[0]
    if ((field === 'email' || field === 'password') && !errors[field]) {
      errors[field] = issue.message
    }
  }
  return errors
}
