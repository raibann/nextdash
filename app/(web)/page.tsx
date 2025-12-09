'use client'
import LocaleSwitcher from '@/components/locale-switcher'
import { useTranslations } from 'next-intl'

const HomePage = () => {
  const t = useTranslations('HomePage')
  return (
    <main>
      <h1>{t('title')}</h1>
      <LocaleSwitcher />
    </main>
  )
}

export default HomePage
