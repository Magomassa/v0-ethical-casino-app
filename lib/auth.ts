import { type User, getUsers, saveUsers } from "./storage"

export const getCurrentUser = (): User | null => {
  if (typeof window === "undefined") return null
  const data = localStorage.getItem("motivaplay_currentUser")
  return data ? JSON.parse(data) : null
}

export const setCurrentUser = (user: User | null) => {
  if (typeof window === "undefined") return
  if (user) {
    localStorage.setItem("motivaplay_currentUser", JSON.stringify(user))
  } else {
    localStorage.removeItem("motivaplay_currentUser")
  }
}

export const login = (email: string, password: string): User | null => {
  const users = getUsers()
  const user = users.find((u) => u.email === email && u.password === password)
  if (user) {
    setCurrentUser(user)
    return user
  }
  return null
}

export const register = (email: string, password: string): User | null => {
  const users = getUsers()

  // Check if user already exists
  if (users.find((u) => u.email === email)) {
    return null
  }

  const newUser: User = {
    id: Date.now().toString(),
    email,
    password,
    role: "employee",
    tokens: 100, // Starting tokens
    createdAt: new Date().toISOString(),
  }

  users.push(newUser)
  saveUsers(users)
  setCurrentUser(newUser)
  return newUser
}

export const logout = () => {
  setCurrentUser(null)
}

export const updateUserTokens = (userId: string, tokens: number) => {
  const users = getUsers()
  const userIndex = users.findIndex((u) => u.id === userId)
  if (userIndex !== -1) {
    users[userIndex].tokens = tokens
    saveUsers(users)

    // Update current user if it's the same
    const currentUser = getCurrentUser()
    if (currentUser && currentUser.id === userId) {
      setCurrentUser(users[userIndex])
    }
  }
}
