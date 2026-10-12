import { useEffect } from 'react'
import useSWR from 'swr'
import { mihomoEasyTierGateways } from '@renderer/utils/ipc'

export function useEasyTier() {
  const { data, error, isLoading, isValidating, mutate } = useSWR<EasyTierGateway[]>(
    'mihomoEasyTierGateways',
    mihomoEasyTierGateways,
    { refreshInterval: 5000, errorRetryInterval: 5000 }
  )

  useEffect(() => {
    const refresh = (): void => {
      void mutate()
    }
    const unsubscribeStarted = window.electron.ipcRenderer.on('core-started', refresh)
    const unsubscribeUpdated = window.electron.ipcRenderer.on('groupsUpdated', refresh)
    return () => {
      unsubscribeStarted()
      unsubscribeUpdated()
    }
  }, [mutate])

  return { gateways: error ? [] : (data ?? []), error, isLoading, isValidating, mutate }
}
