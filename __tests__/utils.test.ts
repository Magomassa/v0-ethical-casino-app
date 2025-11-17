jest.mock("@/lib/firebase/db", () => ({
  getAllUsers: jest.fn(),
  getUserFriendships: jest.fn(),
  getUserFriendRequests: jest.fn(),
  createFriendRequest: jest.fn(),
  updateFriendRequest: jest.fn(),
  createFriendship: jest.fn(),
  createDonation: jest.fn(),
  getUserDonations: jest.fn(),
  createTransaction: jest.fn(),
  updateUser: jest.fn(),
  getUser: jest.fn(),
}))

import { getWeekNumber } from "@/components/social/friends-panel"

describe("getWeekNumber", () => {
  it("retorna el número de semana correcto para una fecha conocida", () => {
    const date = new Date("2025-01-08T12:00:00Z") // miércoles de la segunda semana
    expect(getWeekNumber(date)).toBe(2)
  })
})
