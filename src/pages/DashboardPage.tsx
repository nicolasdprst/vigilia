import { ArrowRight, Bot, FileText, Folder, Search, ShieldCheck, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { documents, folders, initialConversations } from '../data/demo'

export function DashboardPage() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const launch = () => { if (query.trim()) navigate(`/assistant?folder=legislation&q=${encodeURIComponent(query)}`) }
  return <div className="dashboard page-inner">
    <section className="hero">
      <div className="hero-kicker"><span className="status-dot" /> Votre espace est sécurisé et prêt</div>
      <h1>Bonjour Maître Martin,<br /><span>que souhaitez-vous rechercher aujourd’hui&nbsp;?</span></h1>
      <div className="hero-search"><Search size={22} /><textarea value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); launch() } }} placeholder="Posez une question sur vos dossiers…" rows={1} /><button disabled={!query.trim()} onClick={launch}><ArrowRight size={19} /></button></div>
      <div className="suggestions"><span>Suggestions</span>{['Que prévoit le Code civil sur la force majeure ?', 'Quels sont les délais de prescription de droit commun ?'].map((question) => <button key={question} onClick={() => navigate(`/assistant?folder=legislation&q=${encodeURIComponent(question)}`)}>{question}</button>)}</div>
    </section>

    <section className="dashboard-section"><div className="section-heading"><div><h2>Dossiers récents</h2><p>Reprenez votre travail là où vous l’avez laissé.</p></div><button onClick={() => navigate('/library')}>Tout afficher <ArrowRight size={15} /></button></div>
      <div className="folder-grid">{folders.map((folder) => <button className="folder-card" key={folder.id} onClick={() => navigate(`/library/${folder.id}`)}><div className="folder-top"><span className="folder-icon" style={{ '--folder-color': folder.color } as React.CSSProperties}><Folder size={21} /></span><span className="more">•••</span></div><strong>{folder.client}</strong><span>{folder.name}</span><div className="folder-meta"><span>{folder.documentIds.length} documents</span><span>{folder.updatedAt}</span></div></button>)}</div>
    </section>

    <div className="dashboard-columns">
      <section className="dashboard-section"><div className="section-heading compact"><div><h2>Documents consultés</h2></div><button onClick={() => navigate('/library')}>Bibliothèque <ArrowRight size={15} /></button></div><div className="activity-list">{documents.slice(0, 4).map((doc) => <button key={doc.id} onClick={() => navigate(`/documents/${doc.id}`)}><span className="doc-icon"><FileText size={18} /></span><span className="activity-main"><strong>{doc.title}</strong><small>{folders.find((f) => f.id === doc.folderId)?.client}</small></span><span className="activity-time">{doc.viewedAt}</span></button>)}</div></section>
      <section className="dashboard-section"><div className="section-heading compact"><div><h2>Conversations récentes</h2></div><button onClick={() => navigate('/assistant')}>Assistant <ArrowRight size={15} /></button></div><div className="activity-list">{initialConversations.map((conversation, index) => <button key={conversation.id} onClick={() => navigate(`/assistant/${conversation.id}`)}><span className="bot-icon"><Bot size={18} /></span><span className="activity-main"><strong>{conversation.title}</strong><small>{folders.find((f) => f.id === conversation.folderId)?.client}</small></span><span className="activity-time">{index === 0 ? '09:46' : conversation.updatedAt.split(',')[0]}</span></button>)}</div><button className="new-conversation" onClick={() => navigate('/assistant')}><Sparkles size={17} /> Nouvelle conversation</button></section>
    </div>
    <div className="privacy-strip"><ShieldCheck size={20} /><div><strong>Vérifiez la configuration avant de traiter un dossier confidentiel</strong><span>VIGILIA affiche l’adresse locale ou distante du moteur et rattache les réponses à leurs extraits sources.</span></div><button onClick={() => navigate('/infrastructure')}>Vérifier la confidentialité <ArrowRight size={15} /></button></div>
  </div>
}
