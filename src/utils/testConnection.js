export async function testBackendConnection() {
  const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001'

  console.log('🔍 Testing connection to:', BASE_URL)

  try {
    const response = await fetch(`${BASE_URL}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@meetzy.com',
        password: 'meetzy@admin123',
      }),
    })

    const data = await response.json()
    const token = data?.token || data?.adminToken

    if (token) {
      console.log('✅ Backend connected!')
      console.log('✅ Admin login works!')
      console.log('✅ Token received:', !!token)
      return true
    }

    console.log('❌ Login failed:', data?.message || `HTTP ${response.status}`)
    return false
  } catch (error) {
    if (error.message?.includes('fetch') || error.message?.includes('Failed to fetch')) {
      console.log('❌ Backend not reachable on', BASE_URL)
      console.log('   Start backend: npm run start:dev (it listens on port 3001)')
    } else {
      console.log('❌ Error:', error.message)
    }
    return false
  }
}
