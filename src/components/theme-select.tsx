'use client'

import * as React from 'react'
import { Moon, Sun, Flower, Monitor } from 'lucide-react'
import { useTheme } from 'next-themes'

import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

export function ThemeSelect() {
  const { setTheme, resolvedTheme, theme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const currentTheme = theme === 'purple' ? resolvedTheme : theme

  // Prevent hydration mismatch by waiting until after mount
  React.useEffect(() => {
    setMounted(true)
  }, [])

  // While not mounted, render a placeholder button (no icon)
  if (!mounted) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" />
        </DropdownMenuTrigger>
      </DropdownMenu>
    )
  }

  // Pick an icon based on the theme
  let icon = <Sun className="h-[1.2rem] w-[1.2rem]" />
  if (currentTheme === 'dark') icon = <Moon className="h-[1.2rem] w-[1.2rem]" />
  else if (currentTheme === 'purple') icon = <Flower className="h-[1.2rem] w-[1.2rem] text-purple-600" />
  else if (theme === 'system') icon = <Monitor className="h-[1.2rem] w-[1.2rem]" />

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          {icon}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('purple')}>Purple / Violet</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('light')}>Light</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>Dark</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>System</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
