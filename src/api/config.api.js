import { adminAxios } from './axios'

export const configApi = {
  getConfig: async () => {
    const res = await adminAxios.get('/config')
    return res.data
  },

  saveConfig: async (config) => {
    const res = await adminAxios.post('/config', config)
    return res.data
  },

  getStats: async () => {
    const res = await adminAxios.get('/stats')
    return res.data
  },
}
