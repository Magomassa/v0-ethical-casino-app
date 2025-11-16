"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getAllUsers, getUserFriendships } from "@/lib/firebase/db"
import type { User, Friendship } from "@/lib/storage"
import { Trophy, TrendingUp, Building2, Crown, Coins } from 'lucide-react'

interface RankingsPanelProps {
  currentUserId: string
}

export function RankingsPanel({ currentUserId }: RankingsPanelProps) {
  const [users, setUsers] = useState<User[]>([])
  const [friendships, setFriendships] = useState<Friendship[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!currentUserId) {
      console.error("[v0] RankingsPanel: currentUserId is undefined")
      return
    }
    loadData()
  }, [currentUserId])

  const loadData = async () => {
    if (!currentUserId) return
    
    setLoading(true)
    try {
      const [allUsers, allFriendships] = await Promise.all([
        getAllUsers(),
        getUserFriendships(currentUserId),
      ])
      setUsers(allUsers)
      setFriendships(allFriendships)
    } catch (error) {
      console.error("[v0] Error loading rankings data:", error)
    } finally {
      setLoading(false)
    }
  }

  const myFriends = friendships
    .filter((f) => f.user1Id === currentUserId || f.user2Id === currentUserId)
    .map((f) => {
      const friendId = f.user1Id === currentUserId ? f.user2Id : f.user1Id
      return users.find((u) => u.id === friendId)
    })
    .filter(Boolean) as User[]

  const currentUser = users.find((u) => u.id === currentUserId)
  const friendsWithMe = currentUser ? [...myFriends, currentUser] : myFriends
  const sortedFriends = [...friendsWithMe].sort((a, b) => b.tokens - a.tokens)

  const departments = [...new Set(users.filter((u) => u.role === "employee").map((u) => u.department))]
  const departmentStats = departments.map((dept) => {
    const deptUsers = users.filter((u) => u.department === dept && u.role === "employee")
    const totalTokens = deptUsers.reduce((sum, u) => sum + u.tokens, 0)
    const avgTokens = totalTokens / deptUsers.length
    const mvp = deptUsers.sort((a, b) => b.tokens - a.tokens)[0]
    return {
      name: dept,
      totalTokens,
      avgTokens,
      userCount: deptUsers.length,
      mvp,
    }
  })
  const sortedDepartments = [...departmentStats].sort((a, b) => b.totalTokens - a.totalTokens)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-sm text-muted-foreground">Cargando rankings...</div>
      </div>
    )
  }

  return (
    <Tabs defaultValue="friends">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="friends">
          <Trophy className="h-4 w-4 mr-2" />
          Ranking Amigos
        </TabsTrigger>
        <TabsTrigger value="departments">
          <Building2 className="h-4 w-4 mr-2" />
          Por Departamento
        </TabsTrigger>
      </TabsList>

      <TabsContent value="friends" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Top 10 Amigos
            </CardTitle>
            <CardDescription>Ranking por fichas entre tus amigos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sortedFriends.slice(0, 10).map((friend, index) => (
                <div
                  key={friend.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    friend.id === currentUserId ? "bg-primary/10 border-2 border-primary" : "bg-accent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-background">
                      {index === 0 && <Crown className="h-4 w-4 text-yellow-500" />}
                      {index === 1 && <Crown className="h-4 w-4 text-gray-400" />}
                      {index === 2 && <Crown className="h-4 w-4 text-orange-600" />}
                      {index > 2 && <span className="text-sm font-semibold">{index + 1}</span>}
                    </div>
                    <div>
                      <h3 className="font-semibold">{friend.name}</h3>
                      <p className="text-xs text-muted-foreground">{friend.department}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="gap-1">
                    <Coins className="h-3 w-3" />
                    {friend.tokens}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="departments" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Ranking Departamentos
            </CardTitle>
            <CardDescription>Rendimiento por área de la empresa</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sortedDepartments.map((dept, index) => (
                <Card key={dept.name}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                          {index === 0 && <Trophy className="h-4 w-4 text-primary" />}
                          {index > 0 && <span className="text-sm font-semibold">{index + 1}</span>}
                        </div>
                        <div>
                          <h3 className="font-semibold">{dept.name}</h3>
                          <p className="text-xs text-muted-foreground">{dept.userCount} empleados</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {dept.totalTokens}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Promedio: {Math.round(dept.avgTokens)} fichas</span>
                      {dept.mvp && (
                        <span className="text-xs">
                          <Crown className="h-3 w-3 inline mr-1 text-yellow-500" />
                          MVP: {dept.mvp.name}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
