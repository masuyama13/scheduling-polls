import { BrowserRouter, Routes, Route } from 'react-router'
import MainLayout from './components/MainLayout'
import HomePage from './pages/HomePage'
import EventCreatedPage from './pages/EventCreatedPage'
import EventDetailPage from './pages/EventDetailPage'
import NotFoundPage from './pages/NotFoundPage'
import TermsOfServicePage from './pages/TermsOfServicePage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'

function App() {
  return (
    <div className="app">
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />}></Route>
            <Route path="/events/:public_token/created" element={<EventCreatedPage />}></Route>
            <Route path="/events/:public_token" element={<EventDetailPage />}></Route>
            <Route path="/terms" element={<TermsOfServicePage />}></Route>
            <Route path="/privacy" element={<PrivacyPolicyPage />}></Route>
            <Route path="*" element={<NotFoundPage />}></Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
