import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { AppProvider } from './store/AppContext'
import { AssistantPage } from './pages/AssistantPage'
import { DashboardPage } from './pages/DashboardPage'
import { DocumentPage } from './pages/DocumentPage'
import { InfrastructurePage } from './pages/InfrastructurePage'
import { LibraryPage } from './pages/LibraryPage'
import { SettingsPage } from './pages/SettingsPage'
import { SummaryPage } from './pages/SummaryPage'

function NotFound() {
  return (
    <div className="page-inner" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Page introuvable</h1>
      <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>La page que vous recherchez n'existe pas ou a été déplacée.</p>
      <Link to="/" className="button primary">Retour à l'accueil</Link>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<DashboardPage />} />
            <Route path="library" element={<LibraryPage />} />
            <Route path="library/:folderId" element={<LibraryPage />} />
            <Route path="documents/:documentId" element={<DocumentPage />} />
            <Route path="assistant" element={<AssistantPage />} />
            <Route path="assistant/:threadId" element={<AssistantPage />} />
            <Route path="summary/:documentId" element={<SummaryPage />} />
            <Route path="infrastructure" element={<InfrastructurePage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </AppProvider>
    </BrowserRouter>
  )
}
