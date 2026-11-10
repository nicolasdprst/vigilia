import { Bot, Database, RotateCcw, ShieldCheck } from 'lucide-react'
import { useApp } from '../store/AppContext'
import { useLocalStatus } from '../hooks/useLocalStatus'

export function SettingsPage() {
  const { demoReset } = useApp()
  const { status } = useLocalStatus()
  const local = Boolean(status?.ollama && status.localOnly)

  return <div className="page-inner settings-page">
    <div className="page-header"><div><h1>Paramètres du cabinet</h1><p>État du moteur et du fonds documentaire VIGILIA.</p></div></div>
    <section className="settings-card"><div><span className="settings-icon"><Bot size={20} /></span><div><h2>Assistant documentaire</h2><p>Les réponses sont accompagnées de leurs extraits sources et refusées si aucune citation valide n’est produite.</p></div></div><span className={status?.ollama ? 'ready-status' : 'demo-pill'}><span /> {status?.ollama ? 'Opérationnel' : 'Indisponible'}</span></section>
    <section className="settings-card"><div><span className="settings-icon"><Database size={20} /></span><div><h2>Fonds documentaire</h2><p>{status ? `${status.documents} documents et ${status.chunks} extraits prêts à être recherchés${status.missingEmbeddings ? `, dont ${status.missingEmbeddings} en attente d’embedding` : ''}.` : 'Le serveur doit être démarré pour consulter le fonds.'}</p></div></div><span className="ready-status"><span /> Disque local</span></section>
    <section className="settings-card"><div><span className="settings-icon"><ShieldCheck size={20} /></span><div><h2>Confidentialité</h2><p>{local ? 'Le moteur IA configuré répond sur la boucle locale. Vérifiez également les droits système, les sauvegardes et l’accès physique au poste.' : 'Le moteur IA n’est pas confirmé comme local. Vérifiez sa configuration avant de traiter des données confidentielles.'}</p></div></div><span className={local ? 'ready-status' : 'demo-pill'}><span /> {local ? 'Adresse locale' : 'À vérifier'}</span></section>
    <section className="settings-card"><div><span className="settings-icon"><RotateCcw size={20} /></span><div><h2>Réinitialiser l’interface</h2><p>Restaure les données de démonstration sans supprimer le fonds documentaire du serveur.</p></div></div><button className="button secondary" onClick={demoReset}>Réinitialiser</button></section>
  </div>
}
