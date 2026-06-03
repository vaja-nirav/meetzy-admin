import { adminAxios } from './axios'

export const reportsApi = {
  getReports: async (params) => {
    const res = await adminAxios.get('/reports', { params })
    return res.data
  },

  updateReport: async (reportId, status, adminNote) => {
    const res = await adminAxios.patch(`/reports/${reportId}`, { status, adminNote })
    return res.data
  },
}
