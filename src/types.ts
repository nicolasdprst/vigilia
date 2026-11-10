export type IndexStatus = 'ready' | 'indexing' | 'error'

export interface MatterFolder {
  id: string
  name: string
  client: string
  reference: string
  color: string
  documentIds: string[]
  updatedAt: string
}

export interface Passage {
  id: string
  page: number
  title?: string
  text: string
}

export interface LegalDocument {
  id: string
  folderId: string
  title: string
  type: 'Contrat' | 'Avenant' | 'Courrier' | 'Procès-verbal' | 'Annexe'
  fileType: 'PDF' | 'DOCX' | 'TXT' | 'MD'
  pages: number
  size: string
  author: string
  createdAt: string
  viewedAt: string
  status: IndexStatus
  passages: Passage[]
  indexedAt?: string
  version?: number
  filename?: string
  sha256?: string
  mimeType?: string
  sizeBytes?: number
  hasOriginal?: boolean
}

export interface SummaryVersion {
  id: string
  documentId: string
  createdAt: string
  sourceVersion: number
  content: string
}

export interface Citation {
  id: string
  documentId: string
  page: number
  passageId: string
  label: string
  documentTitle?: string
  excerpt?: string
  sourceUrl?: string
  effectiveDate?: string
}

export interface AssistantAnswer {
  title: string
  intro: string
  sections: { heading: string; body: string; citations: string[] }[]
  caution?: string
  sources?: Citation[]
  meta?: {
    mode: 'local'
    model?: string
    elapsedMs?: number
    retrievedChunks?: number
  }
}

export interface Conversation {
  id: string
  title: string
  folderId: string
  updatedAt: string
  messages: { id: string; role: 'user' | 'assistant'; content: string; answer?: AssistantAnswer }[]
}
