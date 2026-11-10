import { AnimatePresence, motion } from 'framer-motion'
import { Check, CheckCircle2, ChevronLeft, ChevronRight, ExternalLink, FileText, X } from 'lucide-react'
import { getCitation, getDocument } from '../data/demo'
import type { Citation } from '../types'

export function SourcePanel({ citationId, citations = [], onClose, onNavigate, verified = false, onVerify, onOpenDocument }: { citationId: string | null; citations?: Citation[]; onClose: () => void; onNavigate?: (direction: -1 | 1) => void; verified?: boolean; onVerify?: (id: string) => void; onOpenDocument?: (citation: Citation) => void }) {
  const citation = citationId ? citations.find((item) => item.id === citationId) ?? getCitation(citationId) : undefined
  const document = citation ? getDocument(citation.documentId) : undefined
  const demoPassage = document?.passages.find((item) => item.id === citation?.passageId)
  const passage = demoPassage ?? (citation?.excerpt ? { title: citation.label, text: citation.excerpt } : undefined)
  const title = citation?.documentTitle ?? document?.title
  return <AnimatePresence>{citation && title && passage && <>
    <motion.div className="source-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
    <motion.aside className="source-panel" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 320 }}>
      <header><div><span className="eyebrow">Source locale vérifiable</span><h2>{title}</h2></div><button className="icon-button" onClick={onClose}><X size={19} /></button></header>
      <div className="source-toolbar"><div><FileText size={16} /><span>{document?.fileType ?? 'CORPUS'}</span><span>·</span><span>Page {citation.page}</span>{citation.effectiveDate && <><span>·</span><span>Version {citation.effectiveDate}</span></>}</div>{citation.sourceUrl && <a href={citation.sourceUrl} target="_blank" rel="noreferrer">Voir l’original ↗</a>}</div>
      <div className="page-canvas">
        <div className="paper">
          <div className="paper-brand">VIGILIA · SOURCE INDEXÉE</div><div className="paper-rule" />
          <p className="paper-meta">{title.toUpperCase()}</p>
          <h3>{passage.title}</h3>
          <motion.div className="highlighted-passage" initial={{ backgroundColor: '#fff' }} animate={{ backgroundColor: ['#fff', '#f8edc8', '#fff7da'] }} transition={{ duration: 1.2 }}><span>{passage.text}</span></motion.div>
          <div className="page-number">— {citation.page} —</div>
        </div>
      </div>
      <div className="source-proof-actions"><button className={verified ? 'source-checked' : ''} onClick={() => onVerify?.(citation.id)}>{verified ? <Check size={16} /> : <CheckCircle2 size={16} />}{verified ? 'Vérifié par vous' : 'Marquer comme vérifié'}</button>{document && <button onClick={() => onOpenDocument?.(citation)}>Ouvrir le document, page {citation.page} <ExternalLink size={14} /></button>}</div>
      <footer><div className="verified"><CheckCircle2 size={16} /> Extrait exact utilisé dans la réponse</div><div className="source-nav"><button onClick={() => onNavigate?.(-1)}><ChevronLeft size={17} /></button><span>Page {citation.page}{document ? ` sur ${document.pages}` : ''}</span><button onClick={() => onNavigate?.(1)}><ChevronRight size={17} /></button></div></footer>
    </motion.aside>
  </>}</AnimatePresence>
}
