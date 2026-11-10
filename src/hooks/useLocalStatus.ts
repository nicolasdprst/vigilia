import { useCallback, useEffect, useState } from 'react'
import { getLocalStatus, type LocalStatus } from '../services/localAssistant'

let sharedStatus: LocalStatus | null = null
let sharedLoading = true
const subscribers = new Set<() => void>()
let pollTimer: number | null = null

async function runPoll() {
  try {
    sharedStatus = await getLocalStatus()
  } catch {
    sharedStatus = null
  } finally {
    sharedLoading = false
    subscribers.forEach((notify) => notify())
  }
}

function startPolling() {
  if (pollTimer === null) {
    void runPoll()
    pollTimer = window.setInterval(() => void runPoll(), 30_000)
  }
}

function stopPolling() {
  if (subscribers.size === 0 && pollTimer !== null) {
    window.clearInterval(pollTimer)
    pollTimer = null
  }
}

export function useLocalStatus() {
  const [state, setState] = useState({ status: sharedStatus, loading: sharedLoading })

  useEffect(() => {
    const onUpdate = () => setState({ status: sharedStatus, loading: sharedLoading })
    subscribers.add(onUpdate)
    startPolling()
    // Initial sync in case status changed before subscription
    onUpdate()

    return () => {
      subscribers.delete(onUpdate)
      stopPolling()
    }
  }, [])

  const refresh = useCallback(async () => {
    await runPoll()
  }, [])

  return { status: state.status, loading: state.loading, refresh }
}
