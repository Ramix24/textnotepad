"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface WaitlistEntry {
  id: string
  email: string
  name?: string
  source: string
  created_at: string
}

interface WaitlistStats {
  total: number
  waitlist: number
  beta: number
}

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [entries, setEntries] = useState<WaitlistEntry[]>([])
  const [stats, setStats] = useState<WaitlistStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const authenticate = async () => {
    if (!password) {
      setError('Please enter password')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/admin/waitlist', {
        headers: {
          'Authorization': `Bearer ${password}`
        }
      })

      if (response.ok) {
        setIsAuthenticated(true)
        const data = await response.json()
        setEntries(data.data.entries)
        setStats(data.data.stats)
      } else {
        setError('Invalid password')
      }
    } catch {
      setError('Failed to authenticate')
    } finally {
      setLoading(false)
    }
  }

  const exportEmails = async (source?: string) => {
    try {
      const response = await fetch('/api/admin/waitlist', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${password}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ source })
      })

      if (response.ok) {
        const data = await response.json()
        
        // Copy to clipboard
        await navigator.clipboard.writeText(data.data.emails)
        alert(`${data.data.count} emails copied to clipboard!`)
      }
    } catch {
      alert('Failed to export emails')
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Admin Access</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && authenticate()}
            />
            {error && (
              <p className="text-red-600 text-sm">{error}</p>
            )}
            <Button 
              onClick={authenticate}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Authenticating...' : 'Access Admin'}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Waitlist Admin</h1>
          <Button onClick={() => setIsAuthenticated(false)} variant="outline">
            Logout
          </Button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Signups</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Waitlist</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.waitlist}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Beta Testers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.beta}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Export Buttons */}
        <div className="flex gap-4">
          <Button onClick={() => exportEmails()}>
            Export All Emails
          </Button>
          <Button onClick={() => exportEmails('waitlist')} variant="outline">
            Export Waitlist Only
          </Button>
          <Button onClick={() => exportEmails('beta')} variant="outline">
            Export Beta Only
          </Button>
        </div>

        {/* Entries Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Signups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Email</th>
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">Source</th>
                    <th className="text-left p-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr key={entry.id} className="border-b">
                      <td className="p-2 font-mono text-sm">{entry.email}</td>
                      <td className="p-2">{entry.name || '-'}</td>
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          entry.source === 'beta' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {entry.source}
                        </span>
                      </td>
                      <td className="p-2 text-sm text-gray-600">
                        {new Date(entry.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}