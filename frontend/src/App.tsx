import { BrowserRouter, Routes, Route } from 'react-router'
import MainLayout from './components/MainLayout'
import HomePage from './pages/HomePage'
import EventCreatedPage from './pages/EventCreatedPage'
import EventDetailPage from './pages/EventDetailPage'

function App() {
  return (
    <div className="app">
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />}></Route>
            <Route path="/events/:public_token/created" element={<EventCreatedPage />}></Route>
            <Route path="/events/:public_token" element={<EventDetailPage />}></Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
