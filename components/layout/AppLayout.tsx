'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Building2, ClipboardList, BarChart3,
  Settings, CreditCard, HelpCircle, LogOut, Shield,
  ChevronLeft, ChevronRight, Bell, Search, Users,
  FileText, Mail, BookOpen, Menu, X
} from 'lucide-react'
import { clsx } from 'clsx'

const NAV_ITEMS = [
  { href: '/dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/suppliers',    label: 'Suppliers',    icon: Building2 },
  { href: '/assessments',  label: 'Assessments',  icon: ClipboardList },
  { href: '/reports',      label: 'Reports',      icon: BarChart3 },
  { href: '/questions',    label: 'Question Builder', icon: BookOpen },
  { href: '/team',         label: 'Team',         icon: Users },
]

const BOTTOM_ITEMS = [
  { href: '/settings',  label: 'Settings',  icon: Settings },
  { href: '/billing',   label: 'Billing',   icon: CreditCard },
  { href: '/help',      label: 'Help',      icon: HelpCircle },
]

interface AppLayoutProps {
  children: React.ReactNode
  orgName?: string
  userEmail?: string
  userName?: string
  plan?: string
}

export function AppLayout({ children, orgName = 'Your Organisation', userEmail = '', userName = 'User', plan = 'trial' }: AppLayoutProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const NavLink = ({ href, label, icon: Icon }: { href: string; label: string; icon: React.ElementType }) => {
    const active = pathname.startsWith(href)
    return (
      <Link href={href} onClick={() => setMobileOpen(false)}
        className={clsx(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
          active
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-slate-400 hover:text-white hover:bg-slate-700/60'
        )}>
        <Icon size={18} className="flex-shrink-0" />
        {!collapsed && <span>{label}</span>}
      </Link>
    )
  }

  const Sidebar = () => (
    <aside className={clsx(
      'flex flex-col h-full bg-slate-900 border-r border-slate-700/50 transition-all duration-200',
      collapsed ? 'w-16' : 'w-60'
    )}>
      {/* Logo */}
      <div className={clsx('flex items-center h-16 px-4 border-b border-slate-700/50', collapsed ? 'justify-center' : 'justify-between')}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
            <Shield size={16} className="text-white" />
          </div>
          {!collapsed && (
            <div>
              <div className="text-white font-semibold text-sm leading-tight">TPRM Pro</div>
              <div className="text-slate-400 text-xs">{orgName}</div>
            </div>
          )}
        </div>
        {!collapsed && (
          <button onClick={() => setCollapsed(true)} className="text-slate-500 hover:text-slate-300 hidden lg:block">
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      {/* Plan badge */}
      {!collapsed && (
        <div className="px-4 py-2">
          <span className={clsx('text-xs font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide',
            plan === 'enterprise' ? 'bg-amber-500/20 text-amber-400' :
            plan === 'professional' ? 'bg-blue-500/20 text-blue-400' :
            plan === 'trial' ? 'bg-purple-500/20 text-purple-400' :
            'bg-slate-700 text-slate-400'
          )}>
            {plan}
          </span>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(item => <NavLink key={item.href} {...item} />)}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 space-y-1 border-t border-slate-700/50 pt-4">
        {BOTTOM_ITEMS.map(item => <NavLink key={item.href} {...item} />)}
        <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-700/60 w-full transition-all">
          <LogOut size={18} className="flex-shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </button>
        {collapsed && (
          <button onClick={() => setCollapsed(false)} className="flex items-center justify-center w-full py-2 text-slate-500 hover:text-slate-300">
            <ChevronRight size={16} />
          </button>
        )}
      </div>
    </aside>
  )

  return (
    <div className="flex h-screen bg-slate-950 text-white overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-60">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-slate-700/50 bg-slate-900/50 backdrop-blur flex-shrink-0">
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-slate-400 hover:text-white" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="relative hidden sm:block">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search suppliers, assessments..."
                className="pl-9 pr-4 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 placeholder-slate-500 focus:outline-none focus:border-blue-500 w-72"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative text-slate-400 hover:text-white">
              <Bell size={18} />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center">3</span>
            </button>
            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-700">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-semibold">
                {userName?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-medium text-white leading-tight">{userName}</div>
                <div className="text-xs text-slate-400">{userEmail}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
