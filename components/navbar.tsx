"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Film, Search, Settings, Bell, User, LogOut } from "lucide-react"
import { SearchOverlay } from "./search-overlay"
import { SettingsOverlay } from "./settings-overlay"
import { NotificationsOverlay } from "./notifications-overlay"
import { createClient } from "@/lib/supabase/client"
import type { User as SupabaseUser } from "@supabase/supabase-js"

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.077.077 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  )
}

export function Navbar() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const supabase = createClient()

    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    fetchUnreadCount()
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [user])

  const fetchUnreadCount = async () => {
    if (user) {
      const response = await fetch("/api/notifications/unread-count")
      if (response.ok) {
        const { count } = await response.json()
        setUnreadCount(count)
      }
    } else {
      // For guests, count unread from localStorage
      try {
        const response = await fetch("/api/admin/notifications")
        if (response.ok) {
          const notifications = await response.json()
          const readIds = JSON.parse(localStorage.getItem("readNotifications") || "[]")
          const unread = notifications.filter((n: any) => !readIds.includes(n.id)).length
          setUnreadCount(unread)
        }
      } catch (error) {
        console.error("Failed to fetch unread count:", error)
      }
    }
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 bg-transparent backdrop-blur-md">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-all hover:scale-105">
            <Film className="w-8 h-8 text-[#fbc9ff] transition-all hover:drop-shadow-[0_0_8px_rgba(251,201,255,0.6)]" />
            <span className="text-2xl font-bold text-[#fbc9ff]">LunaStream</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-white/90 hover:text-[#fbc9ff] transition-all font-medium text-sm hover:scale-110 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#fbc9ff] after:transition-all hover:after:w-full"
            >
              Home
            </Link>
            <Link
              href="/movies"
              className="text-white/90 hover:text-[#fbc9ff] transition-all font-medium text-sm hover:scale-110 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#fbc9ff] after:transition-all hover:after:w-full"
            >
              Movies
            </Link>
            <Link
              href="/tv-shows"
              className="text-white/90 hover:text-[#fbc9ff] transition-all font-medium text-sm hover:scale-110 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#fbc9ff] after:transition-all hover:after:w-full"
            >
              TV Shows
            </Link>
            <Link
              href="/anime"
              className="text-white/90 hover:text-[#fbc9ff] transition-all font-medium text-sm hover:scale-110 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#fbc9ff] after:transition-all hover:after:w-full"
            >
              Anime
            </Link>
            <Link
              href="/sports"
              className="text-white/90 hover:text-[#fbc9ff] transition-all font-medium text-sm hover:scale-110 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#fbc9ff] after:transition-all hover:after:w-full"
            >
              Sports
            </Link>
            <Link
              href="/continue"
              className="text-white/90 hover:text-[#fbc9ff] transition-all font-medium text-sm hover:scale-110 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#fbc9ff] after:transition-all hover:after:w-full"
            >
              Continue
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSearchOpen(true)}
              className="text-white/70 hover:text-[#fbc9ff] transition-all p-2 rounded-lg hover:bg-white/5 hover:scale-110 hover:shadow-[0_0_15px_rgba(251,201,255,0.3)]"
            >
              <Search className="w-5 h-5" />
            </button>

            <button
              onClick={() => setNotificationsOpen(true)}
              className="text-white/70 hover:text-[#fbc9ff] transition-all p-2 rounded-lg hover:bg-white/5 hover:scale-110 hover:shadow-[0_0_15px_rgba(251,201,255,0.3)] relative"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setSettingsOpen(true)}
              className="text-white/70 hover:text-[#fbc9ff] transition-all p-2 rounded-lg hover:bg-white/5 hover:scale-110 hover:shadow-[0_0_15px_rgba(251,201,255,0.3)]"
            >
              <Settings className="w-5 h-5" />
            </button>

            <a
              href="https://discord.gg/3kpj8SuMy5"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/50 hover:text-[#fbc9ff] transition-all p-2 rounded-lg hover:bg-white/5 hover:scale-110 hover:shadow-[0_0_15px_rgba(251,201,255,0.3)]"
            >
              <DiscordIcon className="w-6 h-6" />
            </a>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="text-white/70 hover:text-[#fbc9ff] transition-all p-2 rounded-lg hover:bg-white/5 hover:scale-110 hover:shadow-[0_0_15px_rgba(251,201,255,0.3)]"
                >
                  <User className="w-5 h-5" />
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-black/90 backdrop-blur-xl border border-[#fbc9ff]/20 rounded-lg shadow-lg overflow-hidden">
                    <div className="px-4 py-3 border-b border-white/10">
                      <p className="text-sm text-white/60 truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-sm text-white/80 hover:bg-white/5 hover:text-[#fbc9ff] transition-colors flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="text-white/70 hover:text-[#fbc9ff] transition-all p-2 rounded-lg hover:bg-white/5 hover:scale-110 hover:shadow-[0_0_15px_rgba(251,201,255,0.3)]"
              >
                <User className="w-5 h-5" />
              </Link>
            )}
          </div>
        </div>
      </nav>

      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <SettingsOverlay isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <NotificationsOverlay
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        onUnreadCountChange={setUnreadCount}
      />
    </>
  )
}
