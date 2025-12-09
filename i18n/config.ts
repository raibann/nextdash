export type Locale = (typeof locales)[number]

export const locales = ['en', 'km'] as const
export const defaultLocale: Locale = 'km'
