"use client"

import { useEffect, useState } from "react"
import { X, Check } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Notification {
  id: string
  title: string
  content: string
  created_at: string
  isRead?: boolean
}

interface NotificationsOverlayProps {
  isOpen: boolean
  onClose: () => void
  onUnreadCountChange?: (count: number) => void
}

export function NotificationsOverlay({ isOpen, onClose, onUnreadCountChange }: NotificationsOverlayProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })
  }, [])

  useEffect(() => {
    if (isOpen) {
      fetchNotifications()
    }
  }, [isOpen, user])

  const fetchNotifications = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/notifications")
      if (response.ok) {
        const data = await response.json()

        // Check which notifications are read
        if (user) {
          const supabase = createClient()
          const { data: readData } = await supabase
            .from("notification_reads")
            .select("notification_id")
            .eq("user_id", user.id)

          const readIds = new Set(readData?.map((r) => r.notification_id) || [])
          const notificationsWithReadStatus = data.map((n: Notification) => ({
            ...n,
            isRead: readIds.has(n.id),
          }))
          setNotifications(notificationsWithReadStatus)
        } else {
          // For guests, use localStorage
          const readIds = JSON.parse(localStorage.getItem("readNotifications") || "[]")
          const notificationsWithReadStatus = data.map((n: Notification) => ({
            ...n,
            isRead: readIds.includes(n.id),
          }))
          setNotifications(notificationsWithReadStatus)
        }

        updateUnreadCount()
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateUnreadCount = async () => {
    if (user) {
      const response = await fetch("/api/notifications/unread-count")
      if (response.ok) {
        const { count } = await response.json()
        onUnreadCountChange?.(count)
      }
    } else {
      // For guests, count unread from localStorage
      const readIds = JSON.parse(localStorage.getItem("readNotifications") || "[]")
      const unreadCount = notifications.filter((n) => !readIds.includes(n.id)).length
      onUnreadCountChange?.(unreadCount)
    }
  }

  const markAsRead = async (notificationId: string) => {
    if (user) {
      await fetch("/api/notifications/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
      })
    } else {
      // For guests, use localStorage
      const readIds = JSON.parse(localStorage.getItem("readNotifications") || "[]")
      if (!readIds.includes(notificationId)) {
        readIds.push(notificationId)
        localStorage.setItem("readNotifications", JSON.stringify(readIds))
      }
    }

    setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n)))
    updateUnreadCount()
  }

  const markAllAsRead = async () => {
    if (user) {
      await fetch("/api/notifications/read-all", {
        method: "POST",
      })
    } else {
      // For guests, mark all as read in localStorage
      const allIds = notifications.map((n) => n.id)
      localStorage.setItem("readNotifications", JSON.stringify(allIds))
    }

    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    updateUnreadCount()
  }

  if (!isOpen) return null

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-black/90 backdrop-blur-xl border border-[#fbc9ff]/20 rounded-2xl shadow-2xl max-h-[80vh] overflow-hidden">
        <div className="sticky top-0 bg-black/95 border-b border-[#fbc9ff]/20 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-[#fbc9ff]">Notifications</h2>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">{unreadCount}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-white/70 hover:text-[#fbc9ff] transition-all px-3 py-1 rounded-lg hover:bg-white/5"
              >
                Mark all as read
              </button>
            )}
            <button
              onClick={onClose}
              className="text-white/70 hover:text-[#fbc9ff] transition-all p-2 rounded-lg hover:bg-white/5"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(80vh-80px)] p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#fbc9ff]" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-white/60">No notifications at this time</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`bg-white/5 border rounded-lg p-4 hover:bg-white/10 transition-colors relative ${
                    notification.isRead ? "border-white/10" : "border-[#fbc9ff]/30"
                  }`}
                >
                  {!notification.isRead && (
                    <div className="absolute top-2 right-2">
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="text-white/50 hover:text-[#fbc9ff] transition-all p-1 rounded hover:bg-white/5"
                        title="Mark as read"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <h3 className="text-white font-semibold text-lg mb-2 pr-8">{notification.title}</h3>
                  <p className="text-white/70 mb-3">{notification.content}</p>
                  <p className="text-white/40 text-sm">{new Date(notification.created_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
