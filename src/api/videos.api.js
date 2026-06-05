import { adminAxios } from './axios'

export const videosApi = {
  getAll: async (params) => {
    const res = await adminAxios.get('/videos', { params })
    return res.data
  },

  create: async (data) => {
    const res = await adminAxios.post('/videos', data)
    return res.data
  },

  update: async (id, data) => {
    const res = await adminAxios.patch(`/videos/${id}`, data)
    return res.data
  },

  delete: async (id) => {
    const res = await adminAxios.delete(`/videos/${id}`)
    return res.data
  },

  updateStatus: async (id, status) => {
    const res = await adminAxios.patch(`/videos/${id}/status`, { status })
    return res.data
  },

  // Upload a video file → returns { success, url }. Content-Type undefined so the
  // browser sets the multipart boundary itself.
  upload: async (file, onProgress) => {
    const fd = new FormData()
    fd.append('file', file)
    const res = await adminAxios.post('/videos/upload', fd, {
      headers: { 'Content-Type': undefined },
      onUploadProgress: (e) => {
        if (onProgress && e.total) onProgress(Math.round((e.loaded / e.total) * 100))
      },
    })
    return res.data
  },
}
