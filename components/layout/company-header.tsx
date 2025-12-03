import React from 'react'
import { SidebarMenu, SidebarMenuItem } from '../ui/sidebar'
import { Anchor } from 'lucide-react'

const CompanyHeader = () => {
  return (
    <SidebarMenu>
      <SidebarMenuItem className='flex gap-3 items-center'>
        <div className='bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg'>
          <Anchor className='size-4' />
        </div>
        <div className='grid flex-1 text-start text-sm leading-tight'>
          <span className='truncate font-semibold'>My Company</span>
          {/* <span className='truncate text-xs'>{activeTeam.plan}</span> */}
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

export default CompanyHeader
