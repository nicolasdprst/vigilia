import type { AssistantService } from './demoAssistant'
import type { AssistantAnswer, LegalDocument } from '../types'

const API_URL = import.meta.env.VITE_API_URL ?? '/api'

export interface LocalStatus {
  online: boolean
  ollama: boolean
  model: string
  embeddingModel: string
  documents: number
  chunks: number
  missingEmbeddings: number
  network: 'local' | 'configured'
  localOnly: boolean
  activeSessions: { id: string; label: string; seenAt: number }[]
  activeRequests: number
}

export async function getLocalStatus(): Promise<LocalStatus> {
  let sessionId = window.sessionStorage.getItem('vigilia.session')
  if (!sessionId) { sessionId = crypto.randomUUID(); window.sessionStorage.setItem('vigilia.session', sessionId) }
  await fetch(`${API_URL}/presence`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ session_id: sessionId, label: 'Poste avocat' }), signal: AbortSignal.timeout(1500) }).catch(() => undefined)
  const response = await fetch(`${API_URL}/health`, { signal: AbortSignal.timeout(2500) })
  if (!response.ok) throw new Error('Backend local indisponible')
  return response.json()
}

export async function importLocalDocument(file: File, folderId: string) {
  const body = new FormData()
  body.append('file', file)
  body.append('folder_id', folderId)
  const response = await fetch(`${API_URL}/documents`, { method: 'POST', body })
  if (!response.ok) {
    const detail = await response.json().catch(() => null)
    throw new Error(detail?.detail ?? "Échec de l'indexation locale")
  }
  return response.json() as Promise<ServerDocument & { chunks: number }>
}

export interface ServerDocument {
  id: string; folderId: string; title: string; filename: string; pages: number; createdAt: string
  sha256?: string; mimeType?: string; sizeBytes?: number; version?: number; hasOriginal?: boolean
  passages: { id: string; page: number; title?: string; text: string }[]
}

export function toLegalDocument(document: ServerDocument): LegalDocument {
  const extension = document.filename.split('.').pop()?.toUpperCase()
  const fileType: LegalDocument['fileType'] = extension === 'DOCX' || extension === 'TXT' || extension === 'MD' ? extension : 'PDF'
  return { id: document.id, folderId: document.folderId, title: document.title, type: 'Annexe', fileType, pages: document.pages, size: document.sizeBytes ? `${Math.max(.1, document.sizeBytes / 1_000_000).toFixed(1)} Mo` : 'Taille inconnue', author: 'Import cabinet', createdAt: document.createdAt, viewedAt: 'Non consulté', status: 'ready', passages: document.passages, indexedAt: document.createdAt, version: document.version ?? 1, filename: document.filename, sha256: document.sha256, mimeType: document.mimeType, sizeBytes: document.sizeBytes, hasOriginal: document.hasOriginal }
}

export async function listLocalDocuments(): Promise<LegalDocument[]> {
  const response = await fetch(`${API_URL}/documents`, { signal: AbortSignal.timeout(5000) })
  if (!response.ok) throw new Error('Impossible de charger les documents du serveur')
  return (await response.json() as ServerDocument[]).map(toLegalDocument)
}

export function originalDocumentUrl(documentId: string) { return `${API_URL}/documents/${encodeURIComponent(documentId)}/original` }

export const localAssistantService: AssistantService = {
  async ask(question, folderId) {
    let response: Response
    try {
      response = await fetch(`${API_URL}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, folder_id: folderId }),
      })
    } catch {
      throw new Error('Le serveur interne du cabinet ne répond pas. Vérifiez que VIGILIA est démarré sur le serveur.')
    }
    if (!response.ok) {
      const detail = await response.json().catch(() => null)
      throw new Error(detail?.detail ?? 'Le moteur IA local ne répond pas')
    }
    const answer = await response.json() as AssistantAnswer
    const prefix = `src-${Date.now()}-`
    const remap = new Map((answer.sources ?? []).map((source) => [source.id, `${prefix}${source.id}`]))
    return {
      ...answer,
      sources: answer.sources?.map((source) => ({ ...source, id: remap.get(source.id) ?? source.id })),
      sections: answer.sections.map((section) => ({ ...section, citations: section.citations.map((id) => remap.get(id) ?? id) })),
    }
  },
}

export const resilientAssistantService: AssistantService = {
  ask: (question, folderId) => localAssistantService.ask(question, folderId),
}
