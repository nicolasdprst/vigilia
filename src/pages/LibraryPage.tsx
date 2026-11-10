import { AnimatePresence, motion } from 'framer-motion'
import { ArrowDownUp, Check, CheckCircle2, ChevronDown, File, FilePlus2, FileText, Filter, Folder, FolderPlus, Grid2X2, HardDrive, List, LockKeyhole, Search, ShieldCheck, Upload, X } from 'lucide-react'
import { useMemo, useRef, useState, type MouseEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { documents, folders } from '../data/demo'
import { useApp } from '../store/AppContext'
import type { LegalDocument, MatterFolder } from '../types'
import { importLocalDocument, toLegalDocument } from '../services/localAssistant'
import { useLocalStatus } from '../hooks/useLocalStatus'

export function LibraryPage() {
  const { folderId } = useParams()
  const navigate = useNavigate()
  const { importedDocuments, notify, folders: allFolders, addFolder } = useApp()
  const [search, setSearch] = useState('')
  const [type, setType] = useState('Tous les types')
  const [sort, setSort] = useState('Récemment consultés')
  const [view, setView] = useState<'list' | 'grid'>('list')
  const [selected, setSelected] = useState<string[]>([])
  const [importOpen, setImportOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const allDocs = [...importedDocuments, ...documents]
  const currentFolder = allFolders.find((folder) => folder.id === folderId)
  const visible = useMemo(() => allDocs.filter((doc) => (!folderId || doc.folderId === folderId) && (type === 'Tous les types' || doc.type === type) && doc.title.toLowerCase().includes(search.toLowerCase())).sort((a, b) => sort === 'Nom A–Z' ? a.title.localeCompare(b.title) : b.createdAt.localeCompare(a.createdAt)), [allDocs, folderId, search, type, sort])
  const toggle = (id: string) => setSelected((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id])

  return <div className="page-inner library-page">
    <div className="page-header"><div><div className="breadcrumbs"><button onClick={() => navigate('/library')}>Bibliothèque</button>{currentFolder && <><span>/</span><span>{currentFolder.client}</span></>}</div><h1>{currentFolder ? currentFolder.client : 'Bibliothèque documentaire'}</h1><p>{currentFolder ? `${currentFolder.name} · ${currentFolder.reference}` : 'Centralisez, classez et interrogez vos documents en toute confidentialité.'}</p></div><div className="header-actions"><button className="button secondary" onClick={() => setCreateOpen(true)}><FolderPlus size={17} /> Nouveau dossier</button><button className="button primary" onClick={() => setImportOpen(true)}><Upload size={17} /> Importer</button></div></div>
    {!folderId && <><div className="folder-section-title"><div><h2>Dossiers clients</h2><p>Chaque document est classé dans le dossier choisi lors de l’import.</p></div><span>{allFolders.length} dossiers</span></div><div className="mini-folders">{allFolders.map((folder) => { const count = allDocs.filter((doc) => doc.folderId === folder.id).length; return <button key={folder.id} onClick={() => navigate(`/library/${folder.id}`)}><span style={{ background: `${folder.color}18`, color: folder.color }}><Folder size={19} /></span><div><strong>{folder.client}</strong><small>{folder.name} · {count} document{count > 1 ? 's' : ''}</small><em>{folder.reference}</em></div><span>›</span></button> })}</div></>}
    <div className="library-toolbar"><div className="library-search"><Search size={17} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un document…" />{search && <button onClick={() => setSearch('')}><X size={15} /></button>}</div><div className="filter-group"><label><Filter size={16} /><select value={type} onChange={(e) => setType(e.target.value)}><option>Tous les types</option><option>Contrat</option><option>Avenant</option><option>Courrier</option><option>Procès-verbal</option><option>Annexe</option></select><ChevronDown size={14} /></label><label><ArrowDownUp size={16} /><select value={sort} onChange={(e) => setSort(e.target.value)}><option>Récemment consultés</option><option>Nom A–Z</option></select><ChevronDown size={14} /></label><div className="view-toggle"><button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')}><List size={17} /></button><button className={view === 'grid' ? 'active' : ''} onClick={() => setView('grid')}><Grid2X2 size={17} /></button></div></div></div>
    <AnimatePresence>{selected.length > 0 && <motion.div className="selection-bar" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}><strong>{selected.length} document{selected.length > 1 ? 's' : ''} sélectionné{selected.length > 1 ? 's' : ''}</strong><button onClick={() => { notify('Déplacement simulé dans le dossier sélectionné'); setSelected([]) }}>Déplacer</button><button onClick={() => notify('Export préparé en mode démonstration')}>Exporter</button><button onClick={() => setSelected([])}>Annuler</button></motion.div>}</AnimatePresence>
    {visible.length ? view === 'list' ? <DocumentTable docs={visible} selected={selected} toggle={toggle} open={(id) => navigate(`/documents/${id}`)} /> : <div className="document-grid">{visible.map((doc) => <DocumentCard key={doc.id} doc={doc} open={() => navigate(`/documents/${doc.id}`)} />)}</div> : <div className="empty-state"><span><FilePlus2 size={25} /></span><h3>Aucun document trouvé</h3><p>Modifiez vos filtres ou importez un nouveau document.</p><button className="button primary" onClick={() => setImportOpen(true)}>Importer un document</button></div>}
    <AnimatePresence>{importOpen && <ImportModal close={() => setImportOpen(false)} initialFolderId={folderId ?? ''} />}</AnimatePresence>
    <AnimatePresence>{createOpen && <CreateFolderModal close={() => setCreateOpen(false)} create={(client, name) => { const folder: MatterFolder = { id: `folder-${Date.now()}`, name, client, reference: `DOS-2026-${String(allFolders.length + 30).padStart(4, '0')}`, color: '#287B70', documentIds: [], updatedAt: 'À l’instant' }; addFolder(folder); notify(`Dossier « ${client} » créé et classé en tête`); setCreateOpen(false); navigate(`/library/${folder.id}`) }} />}</AnimatePresence>
  </div>
}

function DocumentTable({ docs, selected, toggle, open }: { docs: LegalDocument[]; selected: string[]; toggle: (id: string) => void; open: (id: string) => void }) {
  const { folders } = useApp()
  return <div className="document-table"><div className="table-head"><span /><span>Document</span><span>Type</span><span>Dossier</span><span>Modifié</span><span>État</span><span /></div>{docs.map((doc) => <div className="table-row" key={doc.id}><button className={selected.includes(doc.id) ? 'checkbox checked' : 'checkbox'} onClick={() => toggle(doc.id)}>{selected.includes(doc.id) && <Check size={13} />}</button><button className="doc-name" onClick={() => open(doc.id)}><span className="doc-icon"><FileText size={18} /></span><span><strong>{doc.title}</strong><small>{doc.fileType} · {doc.pages} pages · {doc.size}</small></span></button><span>{doc.type}</span><span>{folders.find((f) => f.id === doc.folderId)?.client ?? 'Législation'}</span><span>{doc.createdAt}</span><span className="ready-status"><span /> Prêt à interroger</span><span /></div>)}</div>
}

function DocumentCard({ doc, open }: { doc: LegalDocument; open: () => void }) { return <button className="document-card" onClick={open}><div className="document-preview"><FileText size={30} /><span>{doc.fileType}</span></div><strong>{doc.title}</strong><small>{doc.pages} pages · {doc.size}</small><span className="ready-status"><span /> Disponible pour l’IA</span></button> }

function CreateFolderModal({ close, create }: { close: () => void; create: (client: string, name: string) => void }) {
  const [client, setClient] = useState(''); const [name, setName] = useState('')
  return <div className="modal-layer" onMouseDown={close}><motion.div className="import-modal create-folder-modal" initial={{ opacity: 0, scale: .97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: .97 }} onMouseDown={(event: MouseEvent<HTMLDivElement>) => event.stopPropagation()}><header><div><h2>Créer un dossier</h2><p>Il apparaîtra immédiatement dans « Dossiers clients ».</p></div><button className="icon-button" onClick={close}><X size={18} /></button></header><div className="folder-form"><label className="field-label">Client<input autoFocus value={client} onChange={(event) => setClient(event.target.value)} placeholder="Ex. Atelier Rivoli" /></label><label className="field-label">Nom de l’affaire<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex. Contentieux fournisseur" /></label></div><div className="modal-actions"><button className="button secondary" onClick={close}>Annuler</button><button className="button primary" disabled={!client.trim() || !name.trim()} onClick={() => create(client.trim(), name.trim())}>Créer et ouvrir</button></div></motion.div></div>
}

function ImportModal({ close, initialFolderId }: { close: () => void; initialFolderId: string }) {
  const [file, setFile] = useState<File | null>(null)
  const [step, setStep] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const { addImported, notify, folders } = useApp()
  const [folderId, setFolderId] = useState(initialFolderId || folders[0]?.id || 'legislation')
  const [dragging, setDragging] = useState(false)
  const [result, setResult] = useState<{ pages: number; chunks: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { status } = useLocalStatus()
  const local = Boolean(status?.localOnly)
  const steps = ['Téléversement', 'Extraction du texte', 'Indexation', 'Disponible pour l’IA']
  const start = async () => {
    if (!file) return
    setError(null); setStep(0)
    try {
      setStep(1)
      const result = await importLocalDocument(file, folderId)
      setStep(2); await new Promise((resolve) => window.setTimeout(resolve, 350)); setStep(3); setResult({ pages: result.pages, chunks: result.chunks })
      addImported(toLegalDocument(result))
      notify(`${result.chunks} extraits prêts à être interrogés — stockage local`)
    } catch (cause) { setStep(-1); setError(cause instanceof Error ? cause.message : "Échec de l'import") }
  }
  const pickFile = (files: FileList | null) => { const next = files?.[0]; if (next) { setFile(next); setError(null) } }
  return <div className="modal-layer" onMouseDown={step === 3 ? close : undefined}>
    <motion.div className="import-modal" initial={{ opacity: 0, scale: .97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: .97 }} onMouseDown={(e: MouseEvent<HTMLDivElement>) => e.stopPropagation()}>
      <header><div><h2>Ajouter un document au dossier</h2><p>Vous saurez précisément quand il pourra être interrogé par l’IA.</p></div><button className="icon-button" onClick={close} aria-label="Fermer"><X size={18} /></button></header>
      {step < 0 ? <>
        {error && <div className="import-error">{error}</div>}
        <div className="local-assurance"><ShieldCheck size={19} /><div><strong>{local ? 'Moteur IA local vérifié' : 'Configuration du moteur à vérifier'}</strong><span>{local ? 'L’indexation et le modèle configuré utilisent l’adresse locale.' : 'Le moteur IA n’est pas confirmé comme local. Vérifiez sa destination avant l’import.'}</span></div><LockKeyhole size={16} /></div>
        <label className="field-label import-folder">Dossier de destination<select value={folderId} onChange={(e) => setFolderId(e.target.value)}><option value="legislation">Législation française</option>{folders.map((folder) => <option key={folder.id} value={folder.id}>{folder.client} — {folder.name}</option>)}</select></label>
        <button className={`drop-zone ${dragging ? 'dragging' : ''}`} onClick={() => inputRef.current?.click()} onDragEnter={(e) => { e.preventDefault(); setDragging(true) }} onDragOver={(e) => e.preventDefault()} onDragLeave={() => setDragging(false)} onDrop={(e) => { e.preventDefault(); setDragging(false); pickFile(e.dataTransfer.files) }}><span>{file ? <FileText size={24} /> : <Upload size={24} />}</span><strong>{file ? file.name : 'Glissez un document dans cette zone'}</strong><small>{file ? `${(file.size / 1_000_000).toFixed(2)} Mo · prêt à importer` : 'ou cliquez pour le sélectionner · PDF, DOCX, TXT, MD · 50 Mo max.'}</small></button>
        <input ref={inputRef} hidden type="file" accept=".pdf,.docx,.txt,.md" onChange={(e) => pickFile(e.target.files)} />
        <div className="privacy-proof"><span><HardDrive size={14} /> Fichier stocké sur le disque VIGILIA</span><span><LockKeyhole size={14} /> Permissions locales restrictives</span></div>
        <div className="modal-actions"><button className="button secondary" onClick={close}>Annuler</button><button className="button primary" disabled={!file} onClick={start}>Analyser le document</button></div>
      </> : step === 3 ? <div className="import-success"><CheckCircle2 size={42} /><h3>Document prêt à être interrogé</h3><p>{result?.pages} page{result?.pages !== 1 ? 's' : ''} analysée{result?.pages !== 1 ? 's' : ''} · {result?.chunks} extrait{result?.chunks !== 1 ? 's' : ''} disponible{result?.chunks !== 1 ? 's' : ''}.</p><div><ShieldCheck size={16} /> Indexation terminée avec la configuration affichée.</div><button className="button primary" onClick={close}>Voir dans le dossier</button></div> : <div className="import-progress"><div className="file-being-imported"><span><File size={20} /></span><div><strong>{file?.name}</strong><small>Traitement en cours · vous pouvez suivre chaque étape</small></div></div>{steps.map((label, index) => <div className={`progress-step ${index <= step ? 'done' : ''}`} key={label}><span>{index < step ? <Check size={14} /> : index + 1}</span><div><strong>{label === 'Indexation' ? 'Préparation pour la recherche IA' : label}</strong>{index === step && <small>{index === 0 ? 'Copie sur le disque…' : index === 1 ? 'Lecture des pages et extraction du texte…' : 'Création des extraits recherchables…'}</small>}</div></div>)}</div>}
    </motion.div>
  </div>
}
