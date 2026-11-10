import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, ArrowUp, Bot, CheckCircle2, ChevronDown, Cpu, FileSearch, History, MessageSquarePlus, PanelLeft, Search, ShieldCheck } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { getCitation, getDocument, suggestedQuestions } from '../data/demo'
import { resilientAssistantService } from '../services/localAssistant'
import { useLocalStatus } from '../hooks/useLocalStatus'
import { useApp } from '../store/AppContext'
import type { AssistantAnswer, Citation, Conversation } from '../types'
import { SourcePanel } from '../components/SourcePanel'

export function AssistantPage() {
  const { threadId } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { conversations, addConversation, updateConversation, folders, verifiedCitations, verifyCitation } = useApp()
  const [folderId, setFolderId] = useState(params.get('folder') ?? conversations.find((c) => c.id === threadId)?.folderId ?? 'legislation')
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState<Conversation['messages']>(conversations.find((c) => c.id === threadId)?.messages ?? [])
  const [processing, setProcessing] = useState(false)
  const [processingStep, setProcessingStep] = useState(0)
  const [citationId, setCitationId] = useState<string | null>(null)
  const [historyOpen, setHistoryOpen] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { status } = useLocalStatus()           
  const hasAutoRun = useRef(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const steps = ['Compréhension de votre question', 'Recherche dans le dossier et le corpus', 'Classement des extraits pertinents', 'Rédaction avec citations vérifiables']

  const submit = async (value = question) => {
    const trimmed = value.trim(); if (!trimmed || processing) return
    const userMessage = { id: `u-${Date.now()}`, role: 'user' as const, content: trimmed }
    const next = [...messages, userMessage]
    setMessages(next); setQuestion(''); setProcessing(true); setProcessingStep(0); setError(null)
    const timers = [window.setTimeout(() => setProcessingStep(1), 450), window.setTimeout(() => setProcessingStep(2), 900), window.setTimeout(() => setProcessingStep(3), 1400)]
    let answer: AssistantAnswer
    try { answer = await resilientAssistantService.ask(trimmed, folderId) }
    catch (cause) {
      timers.forEach(clearTimeout); setProcessing(false)
      setError(cause instanceof Error ? cause.message : 'Une erreur locale est survenue')
      return
    }
    timers.forEach(clearTimeout)
    const completed = [...next, { id: `a-${Date.now()}`, role: 'assistant' as const, content: answer.intro, answer }]
    setMessages(completed); setProcessing(false)
    const id = threadId ?? `conv-${Date.now()}`
    const conversation: Conversation = { id, folderId, title: trimmed.length > 44 ? `${trimmed.slice(0, 44)}…` : trimmed, updatedAt: 'À l’instant', messages: completed }
    if (threadId) updateConversation(conversation); else { addConversation(conversation); navigate(`/assistant/${id}`, { replace: true }) }
  }

  useEffect(() => {
    const q = params.get('q')
    if (!q || hasAutoRun.current) return undefined
    hasAutoRun.current = true
    setQuestion(q)
    const timer = window.setTimeout(() => { void submit(q) }, 180)
    return () => window.clearTimeout(timer)
  }, [])
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, processing])
  const allCitationIds = useMemo(() => messages.flatMap((m) => m.answer?.sections.flatMap((s) => s.citations) ?? []), [messages])
  const navigateCitation = (direction: -1 | 1) => { if (!citationId) return; const current = allCitationIds.indexOf(citationId); const next = allCitationIds[(current + direction + allCitationIds.length) % allCitationIds.length]; if (next) setCitationId(next) }

  return <div className="assistant-layout">
    <AnimatePresence initial={false}>{historyOpen && <motion.aside className="chat-history" initial={{ width: 0, opacity: 0 }} animate={{ width: 264, opacity: 1 }} exit={{ width: 0, opacity: 0 }}><div className="history-head"><strong>Conversations</strong><button onClick={() => navigate('/assistant')}><MessageSquarePlus size={17} /></button></div><div className="history-search"><Search size={15} /><input placeholder="Rechercher…" /></div><div className="history-list"><span>Aujourd’hui</span>{conversations.map((conversation) => <button key={conversation.id} className={conversation.id === threadId ? 'active' : ''} onClick={() => navigate(`/assistant/${conversation.id}`)}><strong>{conversation.title}</strong><small>{folders.find((f) => f.id === conversation.folderId)?.client}</small></button>)}</div><div className="history-footer"><History size={15} /> Conversations conservées localement</div></motion.aside>}</AnimatePresence>
    <section className="chat-main">
      <div className="chat-top"><button className="icon-button" onClick={() => setHistoryOpen(!historyOpen)}><PanelLeft size={18} /></button><div className="scope-picker"><span className="scope-icon">§</span><div><small>Périmètre documentaire</small><select value={folderId} onChange={(e) => setFolderId(e.target.value)}><option value="legislation">Législation française</option>{folders.map((folder) => <option value={folder.id} key={folder.id}>{folder.client} — {folder.name}</option>)}</select></div><ChevronDown size={15} /></div><span className={`engine-label ${status?.ollama ? 'online' : ''}`}><span className="status-dot" /> {status?.ollama ? 'Serveur du cabinet connecté' : 'Serveur interne indisponible'}</span></div>
      <div className="local-ai-banner"><span><Cpu size={20} /></span><div><strong>{status?.localOnly ? 'Recherche traitée sur ce poste' : 'Configuration du traitement à vérifier'}</strong><small>{status?.localOnly ? 'Le moteur configuré répond sur l’interface locale. Les accès au poste et aux fichiers restent sous la responsabilité du cabinet.' : 'Le moteur configuré n’est pas identifié comme local. Vérifiez son adresse avant de transmettre un dossier confidentiel.'}</small></div><ShieldCheck size={20} /></div>
      <div className="messages">
        {messages.length === 0 && !processing ? <EmptyAssistant folderId={folderId} submit={submit} /> : messages.map((message) => message.role === 'user' ? <div className="user-message" key={message.id}><div className="avatar user-avatar">SM</div><div><span>Vous</span><p>{message.content}</p></div></div> : <AnswerMessage key={message.id} answer={message.answer!} openCitation={setCitationId} />)}
        {processing && <Processing steps={steps} current={processingStep} />}
        {error && <div className="assistant-error"><AlertTriangle size={18} /><div><strong>Recherche interrompue</strong><p>{error}</p></div></div>}
        <div ref={bottomRef} />
      </div>
      <div className="composer-wrap"><div className="composer"><textarea value={question} onChange={(e) => setQuestion(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit() } }} placeholder="Ex. Quelles sont les conditions de validité d’une clause de non-concurrence ?" rows={1} /><button disabled={!question.trim() || processing} onClick={() => submit()} aria-label="Envoyer la question"><ArrowUp size={18} /></button><div className="composer-meta"><span><ShieldCheck size={14} /> {status?.ollama ? status.localOnly ? 'Moteur local disponible' : 'Moteur distant configuré — confidentialité à vérifier' : 'Moteur indisponible — aucune réponse simulée'}</span><span>Entrée pour envoyer · Maj + Entrée pour une nouvelle ligne</span></div></div><p>Information juridique, non consultation. Vérifiez toujours le texte en vigueur et les sources citées.</p></div>
    </section>
    <SourcePanel citationId={citationId} citations={messages.flatMap((message) => message.answer?.sources ?? [])} onClose={() => setCitationId(null)} onNavigate={navigateCitation} verified={citationId ? verifiedCitations.includes(citationId) : false} onVerify={verifyCitation} onOpenDocument={(citation) => navigate(`/documents/${citation.documentId}?page=${citation.page}&passage=${citation.passageId}`)} />
  </div>
}

function EmptyAssistant({ folderId, submit }: { folderId: string; submit: (value: string) => void }) {
  const { folders } = useApp()
  const folder = folders.find((f) => f.id === folderId)
  const legalQuestions = ['Que prévoit le Code civil sur la force majeure ?', 'Quelles sont les règles applicables à la période d’essai ?', 'Quels délais encadrent la garantie légale de conformité ?']
  const questions = folderId === 'legislation' ? legalQuestions : suggestedQuestions
  return <div className="assistant-empty"><span className="assistant-logo"><Bot size={27} /></span><h1>{folder ? 'Interrogez votre dossier' : 'Recherchez dans le droit français'}</h1><p>{folder ? <>Je recherche dans le dossier <strong>{folder.client}</strong> et dans le corpus législatif conservé au cabinet.</> : <>VIGILIA analyse uniquement les textes disponibles sur le serveur interne et cite chaque extrait utilisé.</>}</p><div className="question-cards">{questions.map((question) => <button key={question} onClick={() => submit(question)}><FileSearch size={18} /><span>{question}</span><span>→</span></button>)}</div></div>
}

function Processing({ steps, current }: { steps: string[]; current: number }) { return <div className="assistant-message processing"><div className="assistant-avatar"><Bot size={18} /></div><div className="processing-card"><div className="processing-title"><div className="radar"><span /></div><div><strong>Recherche locale en cours</strong><small>Chaque affirmation sera reliée à un extrait.</small></div></div>{steps.map((step, index) => <div key={step} className={index <= current ? 'process-line active' : 'process-line'}>{index < current ? <CheckCircle2 size={15} /> : <span className="process-dot" />}<span>{step}</span>{index === current && <small>en temps réel…</small>}</div>)}</div></div> }

function AnswerMessage({ answer, openCitation }: { answer: AssistantAnswer; openCitation: (id: string) => void }) {
  const [feedback, setFeedback] = useState<'useful' | 'improve' | null>(null)
  const copy = async () => { const text = [answer.title, answer.intro, ...answer.sections.flatMap((section) => [section.heading, section.body])].join('\n\n'); await navigator.clipboard?.writeText(text); setFeedback('useful') }
  const source = (id: string): Citation | undefined => answer.sources?.find((item) => item.id === id) ?? getCitation(id)
  return <motion.div className="assistant-message" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}><div className="assistant-avatar"><Bot size={18} /></div><div className="answer"><span className="answer-author">VIGILIA {answer.meta?.mode === 'local' ? '· TRAITEMENT INTERNE AU CABINET' : '· DÉMONSTRATION'}</span><h2>{answer.title}</h2><p>{answer.intro}</p>{answer.sections.map((section) => <section key={section.heading}><h3>{section.heading}</h3><p>{section.body}</p>{section.citations.length > 0 && <div className="citation-list">{section.citations.map((id) => { const citation = source(id); const doc = citation ? getDocument(citation.documentId) : undefined; return citation && <button key={id} onClick={() => openCitation(id)}><FileSearch size={14} /><span>{citation.label}</span><small>{citation.documentTitle ?? doc?.title}</small></button> })}</div>}</section>)}{answer.caution && <div className="caution"><strong>Point d’attention</strong><p>{answer.caution}</p></div>}{answer.meta?.elapsedMs && <div className="answer-performance">{answer.meta.retrievedChunks} extrait{answer.meta.retrievedChunks !== 1 ? 's' : ''} de vos documents vérifié{answer.meta.retrievedChunks !== 1 ? 's' : ''} · réponse en {(answer.meta.elapsedMs / 1000).toFixed(1)} s · traitement dans le cabinet</div>}<div className="answer-actions"><button className={feedback === 'useful' ? 'active' : ''} onClick={() => setFeedback('useful')}>{feedback === 'useful' ? 'Merci pour votre retour' : 'Utile'}</button><button className={feedback === 'improve' ? 'active' : ''} onClick={() => setFeedback('improve')}>{feedback === 'improve' ? 'Retour enregistré' : 'À améliorer'}</button><button onClick={copy}>Copier la réponse</button></div></div></motion.div>
}
