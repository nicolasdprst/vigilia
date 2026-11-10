import { ArrowLeft, CalendarClock, CheckCircle2, ClipboardList, FileSearch, Flag, History, Save, Scale, Sparkles, TriangleAlert } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getDocument, getFolder } from '../data/demo'
import { useApp } from '../store/AppContext'

export function SummaryPage() {
  const { documentId } = useParams()
  const navigate = useNavigate()
  const { importedDocuments, folders, summaries, saveSummary, notify } = useApp()
  const doc = importedDocuments.find((item) => item.id === documentId) ?? getDocument(documentId ?? '')
  const folder = doc ? folders.find((item) => item.id === doc.folderId) ?? getFolder(doc.folderId) : undefined

  const initialText = useMemo(() => doc ? `Brouillon à compléter à partir des ${doc.pages} pages de la version ${doc.version ?? 1}. Vérifiez chaque conclusion dans les extraits sources avant utilisation.` : '', [doc])
  const [content, setContent] = useState(initialText)
  const [historyOpen, setHistoryOpen] = useState(false)

  useEffect(() => {
    setContent(initialText)
  }, [initialText])

  if (!doc) {
    return (
      <div className="page-inner summary-page">
        <button className="back-button" onClick={() => navigate('/library')}><ArrowLeft size={17} /> Revenir à la bibliothèque</button>
        <div className="empty-state" style={{ marginTop: '2rem', textAlign: 'center' }}>
          <h2>Document introuvable</h2>
          <p>Le document demandé n'existe pas ou a été supprimé.</p>
        </div>
      </div>
    )
  }
  const versions = summaries.filter((item) => item.documentId === doc.id)
  const save = () => { saveSummary({ id: `summary-${Date.now()}`, documentId: doc.id, createdAt: new Date().toLocaleString('fr-FR'), sourceVersion: doc.version ?? 1, content }); notify('Nouvelle version de la synthèse sauvegardée') }
  return <div className="page-inner summary-page"><button className="back-button" onClick={() => navigate(-1)}><ArrowLeft size={17} /> Revenir au document</button><div className="summary-hero"><div><span className="eyebrow"><Sparkles size={14} /> Brouillon de synthèse · rédaction locale</span><h1>{doc.title}</h1><p>Gabarit fondé sur la version {doc.version ?? 1} · {folder?.client}</p></div><div className="summary-actions"><button className="button secondary" onClick={() => setHistoryOpen(!historyOpen)}><History size={16} /> Historique ({versions.length})</button><button className="button primary" onClick={save}><Save size={16} /> Sauvegarder cet instant</button></div></div>{historyOpen && <div className="summary-history"><h3>Versions de la synthèse</h3>{versions.length ? versions.map((version, index) => <button key={version.id} onClick={() => setContent(version.content)}><strong>Version {versions.length - index}</strong><span>{version.createdAt} · document source v{version.sourceVersion}</span><small>{version.content.slice(0, 130)}…</small></button>) : <p>Aucune version enregistrée. Sauvegardez la synthèse pour figer son contenu et la version des sources.</p>}</div>}<div className="summary-notice"><TriangleAlert size={18} /><span>Ce contenu est un brouillon manuel, pas une synthèse générée par l’IA. Il est rattaché à la version {doc.version ?? 1} du document et doit être vérifié avant utilisation.</span></div><section className="executive-summary editable"><span><Scale size={22} /></span><div><h2>Résumé exécutif modifiable</h2><textarea value={content} onChange={(event) => setContent(event.target.value)} aria-label="Contenu de la synthèse" /></div></section><div className="summary-grid"><SummaryCard icon={ClipboardList} title="Informations essentielles" items={['Version source traçable', 'Date de sauvegarde conservée', 'Contenu librement modifiable', 'Nouvelle version sans écraser la précédente']} /><SummaryCard icon={Flag} title="Utilisation dossier" items={['Regrouper les éléments d’un même dossier', 'Conserver chaque synthèse intermédiaire', 'Retoucher avant sauvegarde', 'Comparer l’historique des versions']} /><SummaryCard icon={CalendarClock} title="État de la source" items={[`Document version ${doc.version ?? 1}`, `Indexé le ${doc.indexedAt ?? doc.createdAt}`, `${doc.pages} pages disponibles`, 'Révision requise après modification']} /><SummaryCard icon={TriangleAlert} title="Points à vérifier" warning items={['Relire les extraits cités', 'Confirmer les dates et montants', 'Vérifier la version du document', 'Valider avant partage au client']} /></div><section className="summary-sources"><h2><FileSearch size={19} /> Sources principales</h2>{doc.passages.slice(-4).map((passage) => <button key={passage.id} onClick={() => navigate(`/documents/${doc.id}?page=${passage.page}&passage=${passage.id}`)}><span>p. {passage.page}</span><div><strong>{passage.title}</strong><small>{passage.text.slice(0, 110)}…</small></div><span>Vérifier →</span></button>)}</section></div>
}

function SummaryCard({ icon: Icon, title, items, warning }: { icon: typeof Flag; title: string; items: string[]; warning?: boolean }) { return <section className={`summary-card ${warning ? 'warning' : ''}`}><div className="summary-card-title"><span><Icon size={18} /></span><h2>{title}</h2></div><ul>{items.map((item) => <li key={item}><CheckCircle2 size={15} />{item}</li>)}</ul></section> }

function SummaryCard({ icon: Icon, title, items, warning }: { icon: typeof Flag; title: string; items: string[]; warning?: boolean }) { return <section className={`summary-card ${warning ? 'warning' : ''}`}><div className="summary-card-title"><span><Icon size={18} /></span><h2>{title}</h2></div><ul>{items.map((item) => <li key={item}><CheckCircle2 size={15} />{item}</li>)}</ul></section> }
