import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { EditorProvider } from './context/EditorContext'
import SessionWarningBar from './components/SessionWarningBar'
import Landing from './pages/Landing'
import Editor from './pages/Editor'

export default function App() {
  return (
    <BrowserRouter>
      <EditorProvider>
        <SessionWarningBar />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/en" element={<Landing lang="en" />} />
          <Route path="/editor" element={<Editor />} />
        </Routes>
      </EditorProvider>
    </BrowserRouter>
  )
}
