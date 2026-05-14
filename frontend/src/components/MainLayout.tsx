import { Outlet } from 'react-router'
import Header from './Header'
import Footer from './Footer'

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-linear-to-t from-surface-gradient-from to-surface-gradient-to flex flex-col">
      <Header />
      <main className="flex-1 w-full max-w-3xl mx-auto">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
