import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { EditorProvider } from './context/EditorContext'
import SessionWarningBar from './components/SessionWarningBar'
import Landing from './pages/Landing'
import LandingFeature from './pages/LandingFeature'
import { FEATURE_LANDINGS, pathFor } from './config/featureLandings'

const Editor = lazy(() => import('./pages/Editor'))

export default function App() {
  return (
    <BrowserRouter>
      <EditorProvider>
        <SessionWarningBar />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/en" element={<Landing lang="en" />} />
          {FEATURE_LANDINGS.map((f) => (
            <Route
              key={`${f.key}-es`}
              path={pathFor(f.key, 'es')}
              element={<LandingFeature featureKey={f.key} lang="es" />}
            />
          ))}
          {FEATURE_LANDINGS.map((f) => (
            <Route
              key={`${f.key}-en`}
              path={pathFor(f.key, 'en')}
              element={<LandingFeature featureKey={f.key} lang="en" />}
            />
          ))}
          <Route
            path="/editor"
            element={
              <Suspense fallback={<EditorLoadingFallback />}>
                <Editor />
              </Suspense>
            }
          />
        </Routes>
      </EditorProvider>
    </BrowserRouter>
  )
}

function EditorLoadingFallback() {
  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#2a2a2a] border-t-[#e87040] rounded-full animate-spin" />
    </div>
  )
}
