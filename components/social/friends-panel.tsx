"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  getAllUsers,
  getUserFriendships,
  getUserFriendRequests,
  createFriendRequest,
  updateFriendRequest,
  createFriendship,
  createDonation,
  getUserDonations,
  createTransaction,
  updateUser,
  getUser,
} from "@/lib/firebase/db"
import type { User, Friendship, FriendRequest, Donation } from "@/lib/storage"
import { UserPlus, Users, Gift, Check, X, Coins } from 'lucide-react'
import { toast } from "@/hooks/use-toast"

const getWeekNumber = (date: Date): number => {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
}

interface FriendsPanelProps {
  currentUserId: string
}

export function FriendsPanel({ currentUserId }: FriendsPanelProps) {
  const [users, setUsers] = useState<User[]>([])
  const [friendships, setFriendships] = useState<Friendship[]>([])
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([])
  const [donations, setDonations] = useState<Donation[]>([])
  const [searchEmail, setSearchEmail] = useState("")
  const [donateDialog, setDonateDialog] = useState(false)
  const [selectedFriend, setSelectedFriend] = useState<User | null>(null)
  const [donateAmount, setDonateAmount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  useEffect(() => {
    if (!currentUserId) {
      console.error("[v0] FriendsPanel: currentUserId is undefined")
      return
    }
    loadData()
  }, [currentUserId])

  const loadData = async () => {
    if (!currentUserId) return
    
    setLoading(true)
    try {
      const [allUsers, allFriendships, allRequests, allDonations, userData] = await Promise.all([
        getAllUsers(),
        getUserFriendships(currentUserId),
        getUserFriendRequests(currentUserId),
        getUserDonations(currentUserId),
        getUser(currentUserId),
      ])
      
      setUsers(allUsers)
      setFriendships(allFriendships)
      setFriendRequests(allRequests)
      setDonations(allDonations)
      setCurrentUser(userData)
    } catch (error) {
      console.error("[v0] Error loading friends data:", error)
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

  const pendingRequests = friendRequests.filter((r) => r.toUserId === currentUserId && r.status === "pending")

  const sentRequests = friendRequests.filter((r) => r.fromUserId === currentUserId && r.status === "pending")

  const handleSendRequest = async () => {
    const targetUser = users.find((u) => u.email === searchEmail && u.role === "employee" && u.id !== currentUserId)
    
    if (!targetUser) {
      toast({ title: "Error", description: "Usuario no encontrado o no es empleado", variant: "destructive" })
      return
    }

    const alreadyFriends = friendships.some(
      (f) =>
        (f.user1Id === currentUserId && f.user2Id === targetUser.id) ||
        (f.user1Id === targetUser.id && f.user2Id === currentUserId),
    )
    if (alreadyFriends) {
      toast({ title: "Error", description: "Ya son amigos", variant: "destructive" })
      return
    }

    const existingRequest = friendRequests.find(
      (r) =>
        ((r.fromUserId === currentUserId && r.toUserId === targetUser.id) ||
          (r.fromUserId === targetUser.id && r.toUserId === currentUserId)) &&
        r.status === "pending",
    )
    if (existingRequest) {
      toast({ title: "Error", description: "Solicitud pendiente", variant: "destructive" })
      return
    }

    try {
      await createFriendRequest({
        fromUserId: currentUserId,
        toUserId: targetUser.id,
        status: "pending",
        createdAt: new Date().toISOString(),
      })

      await loadData()
      setSearchEmail("")
      toast({ title: "Éxito", description: "Solicitud enviada" })
    } catch (error) {
      console.error("[v0] Error sending request:", error)
      toast({ title: "Error", description: "No se pudo enviar la solicitud", variant: "destructive" })
    }
  }

  const handleAcceptRequest = async (requestId: string) => {
    const request = friendRequests.find((r) => r.id === requestId)
    if (!request) return

    try {
      await updateFriendRequest(requestId, { status: "accepted" })
      await createFriendship({
        user1Id: request.fromUserId,
        user2Id: request.toUserId,
        createdAt: new Date().toISOString(),
      })

      await loadData()
      toast({ title: "Éxito", description: "Solicitud aceptada" })
    } catch (error) {
      console.error("[v0] Error accepting request:", error)
      toast({ title: "Error", description: "No se pudo aceptar la solicitud", variant: "destructive" })
    }
  }

  const handleRejectRequest = async (requestId: string) => {
    try {
      await updateFriendRequest(requestId, { status: "rejected" })
      await loadData()
      toast({ title: "Solicitud rechazada", description: "La solicitud ha sido rechazada" })
    } catch (error) {
      console.error("[v0] Error rejecting request:", error)
    }
  }

  const handleDonate = async () => {
    if (!selectedFriend || donateAmount <= 0 || !currentUser) return

    if (currentUser.tokens < donateAmount) {
      toast({ title: "Error", description: "Fichas insuficientes", variant: "destructive" })
      return
    }

    const currentWeek = getWeekNumber(new Date())
    const weekDonations = donations.filter((d) => d.fromUserId === currentUserId && d.weekNumber === currentWeek)
    const weekTotal = weekDonations.reduce((sum, d) => sum + d.amount, 0)

    if (weekTotal + donateAmount > 200) {
      toast({
        title: "Límite excedido",
        description: `Solo puedes donar ${200 - weekTotal} fichas más esta semana`,
        variant: "destructive",
      })
      return
    }

    try {
      await createDonation({
        fromUserId: currentUserId,
        toUserId: selectedFriend.id,
        amount: donateAmount,
        date: new Date().toISOString(),
        weekNumber: currentWeek,
      })

      await createTransaction({
        userId: currentUserId,
        type: "debit",
        amount: donateAmount,
        source: "donation",
        description: `Donación a ${selectedFriend.name}`,
        date: new Date().toISOString(),
      })

      await createTransaction({
        userId: selectedFriend.id,
        type: "credit",
        amount: donateAmount,
        source: "donation",
        description: `Donación de ${currentUser.name}`,
        date: new Date().toISOString(),
      })

      await updateUser(currentUserId, { tokens: currentUser.tokens - donateAmount })
      await updateUser(selectedFriend.id, { tokens: selectedFriend.tokens + donateAmount })

      toast({ title: "Éxito", description: `Has donado ${donateAmount} fichas a ${selectedFriend.name}` })
      setDonateDialog(false)
      setDonateAmount(0)
      await loadData()
    } catch (error) {
      console.error("[v0] Error donating:", error)
      toast({ title: "Error", description: "No se pudo completar la donación", variant: "destructive" })
    }
  }

  const currentWeek = getWeekNumber(new Date())
  const weekDonations = donations.filter((d) => d.fromUserId === currentUserId && d.weekNumber === currentWeek)
  const weekTotal = weekDonations.reduce((sum, d) => sum + d.amount, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-sm text-muted-foreground">Cargando amigos...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="friends">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="friends">
            <Users className="h-4 w-4 mr-2" />
            Mis Amigos
          </TabsTrigger>
          <TabsTrigger value="requests">
            <UserPlus className="h-4 w-4 mr-2" />
            Solicitudes {pendingRequests.length > 0 && `(${pendingRequests.length})`}
          </TabsTrigger>
          <TabsTrigger value="add">
            <UserPlus className="h-4 w-4 mr-2" />
            Agregar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="friends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Gift className="h-4 w-4" />
                Donaciones esta semana
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{weekTotal} / 200 fichas donadas</span>
                <Badge variant={weekTotal >= 200 ? "destructive" : "secondary"}>{200 - weekTotal} disponibles</Badge>
              </div>
            </CardContent>
          </Card>

          {myFriends.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Aún no tienes amigos agregados</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {myFriends.map((friend) => (
                <Card key={friend.id}>
                  <CardHeader>
                    <CardTitle className="text-base">{friend.name}</CardTitle>
                    <CardDescription>{friend.department}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Fichas</span>
                      <Badge variant="secondary" className="gap-1">
                        <Coins className="h-3 w-3" />
                        {friend.tokens}
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        setSelectedFriend(friend)
                        setDonateDialog(true)
                      }}
                      disabled={weekTotal >= 200}
                    >
                      <Gift className="h-4 w-4 mr-2" />
                      Donar fichas
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          {pendingRequests.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No tienes solicitudes pendientes</p>
          ) : (
            pendingRequests.map((request) => {
              const fromUser = users.find((u) => u.id === request.fromUserId)
              if (!fromUser) return null
              return (
                <Card key={request.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <h3 className="font-semibold">{fromUser.name}</h3>
                      <p className="text-sm text-muted-foreground">{fromUser.email}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleAcceptRequest(request.id)}>
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleRejectRequest(request.id)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </TabsContent>

        <TabsContent value="add" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Buscar empleado</CardTitle>
              <CardDescription>Ingresa el email del empleado que quieres agregar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="email@motivaplay.com"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
              />
              <Button onClick={handleSendRequest} className="w-full">
                <UserPlus className="h-4 w-4 mr-2" />
                Enviar solicitud
              </Button>
            </CardContent>
          </Card>

          {sentRequests.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Solicitudes enviadas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {sentRequests.map((request) => {
                  const toUser = users.find((u) => u.id === request.toUserId)
                  if (!toUser) return null
                  return (
                    <div key={request.id} className="flex items-center justify-between p-2 bg-accent rounded">
                      <span className="text-sm">{toUser.email}</span>
                      <Badge variant="secondary">Pendiente</Badge>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={donateDialog} onOpenChange={setDonateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Donar fichas a {selectedFriend?.name}</DialogTitle>
            <DialogDescription>
              Puedes donar hasta {Math.min(200 - weekTotal, currentUser?.tokens || 0)}{" "}
              fichas esta semana
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Cantidad de fichas</label>
              <Input
                type="number"
                min="1"
                max={Math.min(200 - weekTotal, currentUser?.tokens || 0)}
                value={donateAmount}
                onChange={(e) => setDonateAmount(Number.parseInt(e.target.value))}
                placeholder="Ingresa cantidad"
              />
            </div>
            <Button onClick={handleDonate} className="w-full">
              <Gift className="h-4 w-4 mr-2" />
              Donar {donateAmount} fichas
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
