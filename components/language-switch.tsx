'client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { Button } from './ui/button'

const LanguageSwitch = () => {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon' className='scale-95 rounded-full'>
          KH
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem>
          Khmer
          {/* <Check
            size={14}
            className={cn('ms-auto', theme !== 'light' && 'hidden')}
          /> */}
        </DropdownMenuItem>
        <DropdownMenuItem>
          English
          {/* <Check
            size={14}
            className={cn('ms-auto', theme !== 'dark' && 'hidden')}
          /> */}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default LanguageSwitch
