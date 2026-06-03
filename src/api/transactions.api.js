import { adminAxios } from './axios'

export const transactionsApi = {
  getTransactions: async (params) => {
    const res = await adminAxios.get('/transactions', { params })
    return res.data
  },
}
