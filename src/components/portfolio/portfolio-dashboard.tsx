'use client'

import { useState, useEffect } from 'react'
import { useWalletUi } from '@wallet-ui/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// add-on

import { Connection, PublicKey } from '@solana/web3.js'

//  For tokens and symbols
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'

const TOKENLIST_URL = 'https://raw.githubusercontent.com/solana-labs/token-list/main/src/tokens/solana.tokenlist.json'
let cachedTokenMap: Record<string, TokenInfo> = {}

async function getTokenMap(): Promise<Record<string, TokenInfo>> {
  if (Object.keys(cachedTokenMap).length > 0) return cachedTokenMap

  const cached = typeof window !== 'undefined' && window.localStorage.getItem('solanaTokenMap')
  if (cached) {
    cachedTokenMap = JSON.parse(cached)
    return cachedTokenMap
  }

  const resp = await fetch(TOKENLIST_URL)
  const json = await resp.json()
  const map: Record<string, TokenInfo> = {}
  for (const token of json.tokens) {
    map[token.address] = token
  }
  cachedTokenMap = map
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('solanaTokenMap', JSON.stringify(map))
  }
  return map
}

interface PortfolioData {
  balance: number
  tokens: TokenInfo[]
  totalValue: number
}

interface TokenInfo {
  mint: string
  amount: string
  decimals: number
  symbol?: string
  chainId?: number // 101=mainnet, 102=testnet, 103=devnet
}

export function PortfolioDashboard() {
  const { account, cluster } = useWalletUi()
  const [portfolio, setPortfolio] = useState<PortfolioData>({
    balance: 0,
    tokens: [],
    totalValue: 0,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')

  // Fetch when the wallet or network changes, not every render.
  useEffect(() => {
    if (account) {
      fetchPortfolioData()
    }
  }, [account, cluster])
  const fetchPortfolioData = async () => {
    if (!account) return

    setIsLoading(true)
    try {
      // PRODUCTION READY: Fetch live balance for the connected wallet
      const connection = new Connection('https://api.devnet.solana.com')
      const publicKey = new PublicKey(account.address)
      // When using Solana web3.js, the balance is returned in lamports.
      // 1 SOL = 1,000,000,000 lamports (1e9).

      const balanceLamports = await connection.getBalance(publicKey) // returns e.g. 2500000000 lamports

      const solBalance = balanceLamports / 1e9 // Converts 2,500,000,000 lamports to 2.5 SOL

      // This conversion is MANDATORY for real Solana wallet balances, because the blockchain only deals in lamports.

      // Fetch SPL token balances
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, { programId: TOKEN_PROGRAM_ID })

      const tokenMap = await getTokenMap()

      const tokens: TokenInfo[] = tokenAccounts.value
        .map(({ account }) => {
          const { mint, tokenAmount } = account.data.parsed.info
          const tokenMeta = tokenMap[mint]
          return {
            mint,
            amount: tokenAmount.uiAmountString,
            decimals: tokenAmount.decimals,
            symbol: tokenMeta?.symbol ?? 'Unknown Token',
            chainId: tokenMeta?.chainId, // Note: now matches the token list field
          }
        })
        .filter((token) => parseFloat(token.amount) > 0)

      setPortfolio({
        balance: solBalance,
        tokens, // Fetch tokens here
        totalValue: solBalance,
      })
    } catch (err) {
      setError('Error')
    }
    setIsLoading(false)
  }

  const calculateTotalValue = () => {
    const now = new Date()
    return portfolio.tokens.reduce((total, token) => {
      return total + parseFloat(token.amount)
    }, 0)
  }

  const formatBalance = (balance: number) => {
    return balance.toFixed(2)
  }

  if (!account) {
    return (
      <div className="p-2">
        <h1 className="text-5xl md:text-6xl font-bold mb-2 text-center max-w-xs mx-auto sm:max-w-2xl break-normal">
          Portfolio Dashboard - Please Connect Wallet
        </h1>
        <div className="bg-yellow-200 p-4 sm:p-8 rounded border-4 border-yellow-500 max-w-xs mx-auto sm:max-w-xl">
          <p className="text-lg sm:text-2xl font-bold text-center break-normal">
            ⚠️ WALLET CONNECTION REQUIRED - Please connect your Solana wallet to view your cryptocurrency portfolio
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-2 max-w-none overflow-x-hidden ">
      <h1 className="text-4xl sm:text-5xl font-bold mb-2 text-center max-w-xs mx-auto sm:max-w-2xl break-normal">
        My Portfolio Dashboard for Cryptocurrency Assets
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-xs">{error}</div>
      )}

      <div className="flex flex-col lg:flex-row gap-4 w-full justify-center  items-stretch mt-5">
        <Card className="flex-1 min-w-0  mb-4 md:mb-0">
          <CardHeader>
            <CardTitle className="text-xl break-words md:break-normal">SOL Balance Information</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-lg">Loading your balance...</div>
            ) : (
              <div>
                <p className="text-4xl font-bold break-words md:break-normal">{formatBalance(portfolio.balance)} SOL</p>
                <p className="text-base text-gray-500 break-words md:break-normal">Current Network: {cluster.label}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="flex-[1.5] min-w-0  mb-4 md:mb-0">
          <CardHeader>
            <CardTitle className="text-xl break-words md:break-normal">Token Holdings & Assets</CardTitle>
          </CardHeader>
          <CardContent>
            {portfolio.tokens.length === 0 ? (
              <p className="text-lg">No tokens found in wallet</p>
            ) : (
              <div className="space-y-3">
                {portfolio.tokens.map((token, index) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b pb-2 gap-1 sm:gap-4"
                  >
                    {/* Symbol + Mint */}
                    <div className="flex-1 min-w-0 flex flex-col">
                      <span className="text-lg font-medium truncate">{token.symbol || 'Unknown Token'}</span>
                      <p className="text-sm text-gray-600 font-mono break-all sm:break-normal lg:break-all xl:break-normal mt-5">
                        {token.mint}
                      </p>
                    </div>
                    {/* Amount */}
                    <div className="flex-shrink-0 flex justify-end items-center min-w-[90px]">
                      <span className="text-lg font-mono truncate">{token.amount} tokens</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="flex-1 min-w-0 ">
          <CardHeader>
            <CardTitle className="text-xl break-words md:break-normal">Total Portfolio Value</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold break-words md:break-normal">${calculateTotalValue().toFixed(2)} USD</p>
            <Button
              onClick={fetchPortfolioData}
              disabled={isLoading}
              className="mt-6 w-full text-lg py-4 px-8 break-words md:break-normal"
            >
              Refresh Portfolio Data
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
