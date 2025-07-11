'use client'

import { ThemeProvider } from '@/components/theme-provider'
import { ReactQueryProvider } from './react-query-provider'
import { SolanaProvider } from '@/components/solana/solana-provider'
import React from 'react'

export function AppProviders({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ReactQueryProvider>
      <ThemeProvider
        attribute="class"
        enableSystem
        defaultTheme="purple"
        disableTransitionOnChange
        value={{
          light: 'light',
          dark: 'dark',
          purple: 'purple',
        }}
      >
        <SolanaProvider>{children}</SolanaProvider>
      </ThemeProvider>
    </ReactQueryProvider>
  )
}
