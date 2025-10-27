"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Trash2, Users, Play, Database, UserPlus } from "lucide-react"

interface Notification {
  id: string
  title: string
  content: string
  created_at: string
}

interface Statistics {
  unique_visitors: number
  watch_count: number
  tmdb_requests: number
  user_signups: number
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [statistics, setStatistics] = useState<Statistics | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications()
      fetchStatistics()
      // Refresh statistics every 30 seconds
      const interval = setInterval(fetchStatistics, 30000)
      return () => clearInterval(interval)
    }
  }, [isAuthenticated])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      setError("")
    } else {
      setError("Invalid password")
    }
  }

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/admin/notifications")
      if (response.ok) {
        const data = await response.json()
        setNotifications(data)
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
    }
  }

  const fetchStatistics = async () => {
    try {
      const response = await fetch("/api/statistics")
      if (response.ok) {
        const data = await response.json()
        setStatistics(data)
      }
    } catch (error) {
      console.error("Failed to fetch statistics:", error)
    }
  }

  const handleCreateNotification = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      })

      if (response.ok) {
        setTitle("")
        setContent("")
        fetchNotifications()
      } else {
        setError("Failed to create notification")
      }
    } catch (error) {
      setError("Failed to create notification")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteNotification = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/notifications?id=${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchNotifications()
      }
    } catch (error) {
      console.error("Failed to delete notification:", error)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center p-6 bg-gradient-to-br from-black via-purple-950/20 to-black">
        <div className="w-full max-w-sm">
          <Card className="bg-black/40 border-[#fbc9ff]/20 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-2xl text-[#fbc9ff]">Admin Panel</CardTitle>
              <CardDescription className="text-white/60">Enter admin password to continue</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin}>
                <div className="flex flex-col gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="password" className="text-white/80">
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  {error && <p className="text-sm text-red-400">{error}</p>}
                  <Button type="submit" className="w-full bg-[#fbc9ff] text-black hover:bg-[#fbc9ff]/90">
                    Login
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950/20 to-black p-6 pt-24">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-4xl font-bold text-[#fbc9ff] mb-8">Admin Panel</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-black/40 border-[#fbc9ff]/20 backdrop-blur-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">Unique Visitors</CardTitle>
              <Users className="h-4 w-4 text-[#fbc9ff]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#fbc9ff]">
                {statistics?.unique_visitors?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-white/60 mt-1">Total unique IP addresses</p>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-[#fbc9ff]/20 backdrop-blur-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">Watch Count</CardTitle>
              <Play className="h-4 w-4 text-[#fbc9ff]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#fbc9ff]">{statistics?.watch_count?.toLocaleString() || 0}</div>
              <p className="text-xs text-white/60 mt-1">Total plays initiated</p>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-[#fbc9ff]/20 backdrop-blur-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">TMDB Requests</CardTitle>
              <Database className="h-4 w-4 text-[#fbc9ff]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#fbc9ff]">
                {statistics?.tmdb_requests?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-white/60 mt-1">API calls to TMDB</p>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-[#fbc9ff]/20 backdrop-blur-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">User Signups</CardTitle>
              <UserPlus className="h-4 w-4 text-[#fbc9ff]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#fbc9ff]">{statistics?.user_signups?.toLocaleString() || 0}</div>
              <p className="text-xs text-white/60 mt-1">Registered accounts</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-black/40 border-[#fbc9ff]/20 backdrop-blur-xl mb-8">
          <CardHeader>
            <CardTitle className="text-[#fbc9ff]">Create Notification</CardTitle>
            <CardDescription className="text-white/60">Send an alert to all users</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateNotification}>
              <div className="flex flex-col gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="title" className="text-white/80">
                    Title
                  </Label>
                  <Input
                    id="title"
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="Notification title"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="content" className="text-white/80">
                    Content
                  </Label>
                  <Textarea
                    id="content"
                    required
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="bg-white/5 border-white/10 text-white min-h-[100px]"
                    placeholder="Notification content"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-[#fbc9ff] text-black hover:bg-[#fbc9ff]/90"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating..." : "Create Notification"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-[#fbc9ff]/20 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-[#fbc9ff]">Active Notifications</CardTitle>
            <CardDescription className="text-white/60">Manage existing notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {notifications.length === 0 ? (
                <p className="text-white/60 text-center py-8">No notifications yet</p>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="bg-white/5 border border-white/10 rounded-lg p-4 flex justify-between items-start"
                  >
                    <div className="flex-1">
                      <h3 className="text-white font-semibold mb-1">{notification.title}</h3>
                      <p className="text-white/60 text-sm mb-2">{notification.content}</p>
                      <p className="text-white/40 text-xs">{new Date(notification.created_at).toLocaleString()}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteNotification(notification.id)}
                      className="text-red-400 hover:text-red-300 transition-colors p-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
