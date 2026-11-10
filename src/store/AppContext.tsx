import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { folders as initialFolders, initialConversations } from '../data/demo'
import type { Conversation, LegalDocument, MatterFolder, SummaryVersion } from '../types'
import { listLocalDocuments } from '../services/localAssistant'

interface Toast { id: number; message: string; tone?: 'success' | 'neutral' }
interface AppState {
  conversations: Conversation[]
  addConversation: (conversation: Conversation) => void
  updateConversation: (conversation: Conversation) => void
  importedDocuments: LegalDocument[]
  addImported: (document: LegalDocument) => void
  folders: MatterFolder[]
  addFolder: (folder: MatterFolder) => void
  verifiedCitations: string[]
  verifyCitation: (id: string) => void
  summaries: SummaryVersion[]
  saveSummary: (summary: SummaryVersion) => void
  toasts: Toast[]
  notify: (message: string, tone?: Toast['tone']) => void
  demoReset: () => void
}

const AppContext = createContext<AppState | null>(null)

function restore<T>(key: string, fallback: T): T {
  try { const value = window.localStorage.getItem(key); return value ? JSON.parse(value) as T : fallback } catch { return fallback }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>(() => restore('vigilia.conversations', initialConversations))
  const [importedDocuments, setImportedDocuments] = useState<LegalDocument[]>(() => restore('vigilia.documents', []))
  const [folders, setFolders] = useState<MatterFolder[]>(() => restore('vigilia.folders', initialFolders))
  const [verifiedCitations, setVerifiedCitations] = useState<string[]>(() => restore('vigilia.verified', []))
  const [summaries, setSummaries] = useState<SummaryVersion[]>(() => restore('vigilia.summaries', []))
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    let cancelled = false
    listLocalDocuments().then((documents) => {
      if (!cancelled) setImportedDocuments(documents)
    }).catch(() => undefined)
    return () => { cancelled = true }
  }, [])

  const notify = (message: string, tone: Toast['tone'] = 'success') => {
    const id = Date.now()
    setToasts((items) => [...items, { id, message, tone }])
    window.setTimeout(() => setToasts((items) => items.filter((item) => item.id !== id)), 3200)
  }

  useEffect(() => window.localStorage.setItem('vigilia.conversations', JSON.stringify(conversations)), [conversations])
  useEffect(() => window.localStorage.setItem('vigilia.documents', JSON.stringify(importedDocuments)), [importedDocuments])
  useEffect(() => window.localStorage.setItem('vigilia.folders', JSON.stringify(folders)), [folders])
  useEffect(() => window.localStorage.setItem('vigilia.verified', JSON.stringify(verifiedCitations)), [verifiedCitations])
  useEffect(() => window.localStorage.setItem('vigilia.summaries', JSON.stringify(summaries)), [summaries])

  const value = useMemo<AppState>(() => ({
    conversations,
    addConversation: (conversation) => setConversations((items) => [conversation, ...items]),
    updateConversation: (conversation) => setConversations((items) => items.map((item) => item.id === conversation.id ? conversation : item)),
    importedDocuments,
    addImported: (document) => setImportedDocuments((items) => [document, ...items]),
    folders,
    addFolder: (folder) => setFolders((items) => [folder, ...items]),
    verifiedCitations,
    verifyCitation: (id) => setVerifiedCitations((items) => items.includes(id) ? items : [...items, id]),
    summaries,
    saveSummary: (summary) => setSummaries((items) => [summary, ...items]),
    toasts,
    notify,
    demoReset: () => { setConversations(initialConversations); setImportedDocuments([]); setFolders(initialFolders); setVerifiedCitations([]); setSummaries([]); notify('Démonstration réinitialisée') },
  }), [conversations, importedDocuments, folders, verifiedCitations, summaries, toasts])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp doit être utilisé dans AppProvider')
  return context
}
