import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'

export function useAuth() {
  const { adminToken, isAuthenticated, login, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return { adminToken, isAuthenticated, login, logout: handleLogout }
}
