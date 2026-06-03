import { create } from 'zustand'

const useAuthStore = create((set) => ({
  adminToken: localStorage.getItem('adminToken') || null,
  isAuthenticated: !!localStorage.getItem('adminToken'),

  login: (token) => {
    localStorage.setItem('adminToken', token)
    set({ adminToken: token, isAuthenticated: true })
  },

  logout: () => {
    localStorage.removeItem('adminToken')
    set({ adminToken: null, isAuthenticated: false })
  },
}))

export default useAuthStore
