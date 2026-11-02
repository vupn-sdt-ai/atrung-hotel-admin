import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sidebar } from './sidebar'
import { Topbar } from './topbar'
import { MobileNav } from './mobile-nav'
import { GlobalSearch } from './global-search'
import { InstallDialog } from './install-dialog'

export function AppShell() {
  const location = useLocation()
  const [searchOpen, setSearchOpen] = useState(false)
  const [installOpen, setInstallOpen] = useState(false)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <div className="min-h-svh">
      <Sidebar onInstall={() => setInstallOpen(true)} />
      <div className="md:pl-[264px]">
        <Topbar onSearch={() => setSearchOpen(true)} onInstall={() => setInstallOpen(true)} />
        <main className="mx-auto max-w-[1500px] px-4 pb-28 pt-5 sm:px-6 sm:pt-7 lg:px-8 md:pb-10">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
      <MobileNav onInstall={() => setInstallOpen(true)} />
      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
      <InstallDialog open={installOpen} onOpenChange={setInstallOpen} />
    </div>
  )
}
