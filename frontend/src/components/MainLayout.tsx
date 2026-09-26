import { Outlet } from 'react-router'
import Header from './Header'
import Footer from './Footer'

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-surface-page flex flex-col">
      <Header />
      <main className="flex-1 w-full pb-4 sm:pb-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
