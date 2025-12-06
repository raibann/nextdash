export function throwError(error: unknown) {
  if (error instanceof Error) {
    return { data: null, error: error.message }
  }
  console.error(error)
  return { data: null, error: 'Something went wrong!' }
}

export function throwClientError(error: unknown) {
  if (error instanceof Error) {
    throw new Error(error.message)
  }
  console.error(error)
  throw new Error('Something went wrong!')
}
