import { adminAxios } from './axios'

export const vipApi = {
  getVipUsers: async (params) => {
    const res = await adminAxios.get('/vip/users', { params })
    return res.data
  },
}
