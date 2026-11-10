import { useCallback, useEffect, useState } from 'react'
import { getLocalStatus, type LocalStatus } from '../services/localAssistant'

export function useLocalStatus() {
  const [status, setStatus] = useState<LocalStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const refresh = useCallback(async () => {
    try { setStatus(await getLocalStatus()) } catch { setStatus(null) } finally { setLoading(false) }
  }, [])
  useEffect(() => { refresh(); const timer = window.setInterval(refresh, 30_000); return () => window.clearInterval(timer) }, [refresh])
  return { status, loading, refresh }
}
