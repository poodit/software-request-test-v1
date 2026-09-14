import type { RequestFormValues } from './types'

export type RequestFormErrors = Partial<Record<keyof RequestFormValues, string>>

export function validateRequestForm(values: RequestFormValues): RequestFormErrors {
  const errors: RequestFormErrors = {}

  if (!values.title.trim()) errors.title = 'Please enter a request title.'
  if (!values.category.trim()) errors.category = 'Please select a category.'
  if (!values.priority) errors.priority = 'Please select a priority.'

  return errors
}
