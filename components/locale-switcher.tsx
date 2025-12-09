import { useLocale, useTranslations } from 'next-intl'
import LocaleSwitcherSelect from './locale-switcher-select'
import IconEn from './assets/custom/icon-en'
import IconKh from './assets/custom/icon-kh'

export default function LocaleSwitcher() {
  const t = useTranslations('LocaleSwitcher')
  const locale = useLocale()

  return (
    <LocaleSwitcherSelect
      defaultValue={locale}
      items={[
        {
          value: 'km',
          label: t('km'),
          icon: <IconKh className='h-4 w-4' />,
        },
        {
          value: 'en',
          label: t('en'),
          icon: <IconEn className='h-4 w-4' />,
        },
      ]}
      label={t('label')}
    />
  )
}
