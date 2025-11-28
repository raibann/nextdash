import { NavItem } from '@/components/layout/types'

export function checkIsActive(href: string, item: NavItem, mainNav = false) {
  return (
    href === item.url || // /endpint?search=param
    href.split('?')[0] === item.url || // endpoint
    !!item?.items?.filter((i) => i.url === href).length || // if child nav is active
    (mainNav &&
      href.split('/')[1] !== '' &&
      href.split('/')[1] === item?.url?.split('/')[1])
  )
}

export function checkIsActiveByPath(
  href: string,
  url: string,
  mainNav = false
) {
  return (
    href === url || // /endpint?search=param
    href.split('?')[0] === url || // if child nav is active
    (mainNav &&
      href.split('/')[1] !== '' &&
      href.split('/')[1] === url?.split('/')[1])
  )
}
