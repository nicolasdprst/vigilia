import { AnimatePresence, motion } from 'framer-motion'
import { Archive, BookOpenCheck, Bot, ChevronLeft, CircleUserRound, Command, Database, Home, Menu, PanelLeftClose, Search, Server, Settings, ShieldCheck, Sparkles, X } from 'lucide-react'
import { useState, type MouseEvent } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useApp } from '../store/AppContext'
import { useLocalStatus } from '../hooks/useLocalStatus'

const navigation = [
  { to: '/', label: 'Accueil', icon: Home },
  { to: '/library', label: 'Bibliothèque', icon: Archive },
  { to: '/assistant', label: 'Assistant', icon: Bot },
  { to: '/infrastructure', label: 'Confidentialité', icon: ShieldCheck },
]

export function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [commandOpen, setCommandOpen] = useState(false)
  const { toasts } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const { status, loading } = useLocalStatus()

  const sidebar = (
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><BookOpenCheck size={18} /></div><div><strong>VIGILIA</strong><span>ASSISTANT DOCUMENTAIRE</span></div></div>
      <div className={`demo-pill ${status?.ollama && status.localOnly ? 'local-ready' : ''}`}><Sparkles size={13} /> {status?.ollama ? status.localOnly ? 'IA locale active' : 'IA configurée à distance' : 'IA indisponible'}</div>
      <nav className="main-nav">
        <p className="nav-label">Espace de travail</p>
        {navigation.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} end={to === '/'} onClick={() => setMobileOpen(false)} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}><Icon size={18} /><span>{label}</span></NavLink>)}
      </nav>
      <div className="sidebar-spacer" />
      <button className={`server-card ${status?.ollama ? '' : 'offline'}`} onClick={() => navigate('/infrastructure')}><span className="status-dot" /><div><strong>Serveur sécurisé du cabinet</strong><small>{loading ? 'Vérification du réseau…' : status?.ollama ? `Connecté · ${status.activeSessions?.length ?? 1} poste${(status.activeSessions?.length ?? 1) > 1 ? 's' : ''} actif${(status.activeSessions?.length ?? 1) > 1 ? 's' : ''}` : 'Serveur interne indisponible'}</small></div><ChevronLeft size={15} className="rotate-180" /></button>
      <NavLink to="/settings" className="nav-item"><Settings size={18} /><span>Paramètres</span></NavLink>
      <div className="profile"><div className="avatar">SM</div><div><strong>Sophie Martin</strong><small>Avocate associée</small></div><button aria-label="Compte"><CircleUserRound size={17} /></button></div>
    </aside>
  )

  return <div className="app-shell">
    <div className="desktop-sidebar">{sidebar}</div>
    <AnimatePresence>{mobileOpen && <><motion.div className="mobile-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileOpen(false)} /><motion.div className="mobile-sidebar" initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}>{sidebar}</motion.div></>}</AnimatePresence>
    <main className="main-area">
      <header className="topbar">
        <button className="mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Ouvrir le menu"><Menu size={20} /></button>
        <button className="command-trigger" onClick={() => setCommandOpen(true)}><Search size={17} /><span>Rechercher dans VIGILIA…</span><kbd><Command size={12} /> K</kbd></button>
        <div className="topbar-right"><span className="secure-label"><ShieldCheck size={15} /> {status?.ollama ? status.localOnly ? 'Modèle exécuté sur ce poste' : 'Modèle distant configuré' : 'Connexion au moteur interrompue'}</span></div>
      </header>
      <AnimatePresence mode="wait"><motion.div key={location.pathname} className="page" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: .18 }}><Outlet /></motion.div></AnimatePresence>
    </main>
    <AnimatePresence>{commandOpen && <CommandPalette close={() => setCommandOpen(false)} navigate={navigate} />}</AnimatePresence>
    <div className="toast-stack"><AnimatePresence>{toasts.map((toast) => <motion.div key={toast.id} className="toast" initial={{ opacity: 0, y: 12, scale: .96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, x: 20 }}><span className="toast-check">✓</span>{toast.message}</motion.div>)}</AnimatePresence></div>
  </div>
}

function CommandPalette({ close, navigate }: { close: () => void; navigate: ReturnType<typeof useNavigate> }) {
  const [query, setQuery] = useState('')
  const actions = [
    { label: 'Ouvrir la bibliothèque', detail: 'Documents et dossiers', icon: Database, path: '/library' },
    { label: 'Rechercher dans la législation', detail: 'Recherche confidentielle · sources citées', icon: Bot, path: '/assistant?folder=legislation' },
    { label: 'Interroger le dossier Delmas', detail: 'Assistant documentaire', icon: Bot, path: '/assistant?folder=delmas' },
    { label: 'Voir l’infrastructure locale', detail: 'Confidentialité', icon: Server, path: '/infrastructure' },
  ].filter((item) => item.label.toLowerCase().includes(query.toLowerCase()))
  return <div className="modal-layer" onMouseDown={close}><motion.div className="command-palette" initial={{ opacity: 0, scale: .98, y: -8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: .98 }} onMouseDown={(event: MouseEvent<HTMLDivElement>) => event.stopPropagation()}>
    <div className="command-input"><Search size={19} /><input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher une action, un dossier, un document…" /><button onClick={close}><X size={17} /></button></div>
    <div className="command-results"><p>Accès rapide</p>{actions.map(({ label, detail, icon: Icon, path }) => <button key={path} onClick={() => { navigate(path); close() }}><span className="command-icon"><Icon size={18} /></span><span><strong>{label}</strong><small>{detail}</small></span><span className="arrow">↗</span></button>)}</div>
  </motion.div></div>
}
