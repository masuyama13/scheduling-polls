import { BrowserRouter, Routes, Route } from 'react-router'
import MainLayout from './components/MainLayout'
import HomePage from './pages/HomePage'
import EventDetailPage from './pages/EventDetailPage'

function App() {
  return (
    <div className="app">
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />}></Route>
            <Route path="/events/:slug" element={<EventDetailPage/>}></Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
