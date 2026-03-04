import api from './axiosInstance.js';

export const authAPI = {
    login: (data) => api.post('/auth/login', data),
    register: (data) => api.post('/auth/register', data),
    logout: () => api.post('/auth/logout'),
    refresh: () => api.post('/auth/refresh'),
    getMe: () => api.get('/auth/me'),
};

export const sevekariAPI = {
    getAll: (params) => api.get('/sevekaris', { params }),
    getById: (id) => api.get(`/sevekaris/${id}`),
    create: (data) => api.post('/sevekaris', data),
    update: (id, data) => api.put(`/sevekaris/${id}`, data),
    remove: (id) => api.delete(`/sevekaris/${id}`),
    hardDelete: (id) => api.delete(`/sevekaris/hard/${id}`),
};

export const inventoryAPI = {
    getAll: (params) => api.get('/inventory', { params }),
    getById: (id) => api.get(`/inventory/${id}`),
    create: (data) => api.post('/inventory', data),
    update: (id, data) => api.put(`/inventory/${id}`, data),
    remove: (id) => api.delete(`/inventory/${id}`),
    adjustStock: (id, data) => api.post(`/inventory/${id}/adjust`, data),
    getTransactions: (id, params) => api.get(`/inventory/${id}/transactions`, { params }),
    getLowStock: () => api.get('/inventory/low-stock'),
};

export const vendorAPI = {
    getAll: (params) => api.get('/vendors', { params }),
    getById: (id) => api.get(`/vendors/${id}`),
    create: (data) => api.post('/vendors', data),
    update: (id, data) => api.put(`/vendors/${id}`, data),
    remove: (id) => api.delete(`/vendors/${id}`),
};

export const eventAPI = {
    getAll: (params) => api.get('/events', { params }),
    getById: (id) => api.get(`/events/${id}`),
    create: (data) => api.post('/events', data),
    update: (id, data) => api.put(`/events/${id}`, data),
    remove: (id) => api.delete(`/events/${id}`),
    updateDay: (dayId, data) => api.put(`/events/days/${dayId}`, data),
};

export const dishAPI = {
    getByEvent: (eventId) => api.get(`/dishes/event/${eventId}`),
    getByEventDay: (eventDayId) => api.get(`/dishes/event-day/${eventDayId}`),
    create: (data) => api.post('/dishes', data),
    update: (id, data) => api.put(`/dishes/${id}`, data),
    remove: (id) => api.delete(`/dishes/${id}`),
    reorder: (data) => api.post('/dishes/reorder', data),
};

export const procurementAPI = {
    getByEventDay: (eventDayId) => api.get(`/procurements/event-day/${eventDayId}`),
    getByEvent: (eventId) => api.get(`/procurements/event/${eventId}`),
    create: (data) => api.post('/procurements', data),
    update: (id, data) => api.put(`/procurements/${id}`, data),
    remove: (id) => api.delete(`/procurements/${id}`),
    uploadReceipt: (id, file) => {
        const formData = new FormData();
        formData.append('receipt', file);
        return api.post(`/procurements/${id}/receipt`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
};

export const attendanceAPI = {
    getByEvent: (eventId) => api.get(`/attendance/event/${eventId}`),
    getByEventDay: (eventDayId) => api.get(`/attendance/event-day/${eventDayId}`),
    create: (data) => api.post('/attendance', data),
    bulkCreate: (data) => api.post('/attendance/bulk', data),
    update: (id, data) => api.put(`/attendance/${id}`, data),
    remove: (id) => api.delete(`/attendance/${id}`),
};

export const inventoryUsedAPI = {
    getByEvent: (eventId) => api.get(`/inventory-used/event/${eventId}`),
    getByEventDay: (eventDayId) => api.get(`/inventory-used/event-day/${eventDayId}`),
    create: (data) => api.post('/inventory-used', data),
    update: (id, data) => api.put(`/inventory-used/${id}`, data),
    remove: (id) => api.delete(`/inventory-used/${id}`),
};

export const meetingAPI = {
    getByEvent: (eventId) => api.get(`/meetings/event/${eventId}`),
    create: (data) => api.post('/meetings', data),
    update: (id, data) => api.put(`/meetings/${id}`, data),
    remove: (id) => api.delete(`/meetings/${id}`),
};

export const taskAPI = {
    getByEvent: (eventId) => api.get(`/tasks/event/${eventId}`),
    getPending: () => api.get('/tasks/pending'),
    create: (data) => api.post('/tasks', data),
    update: (id, data) => api.put(`/tasks/${id}`, data),
    updateStatus: (id, status) => api.patch(`/tasks/${id}/status`, { status }),
    remove: (id) => api.delete(`/tasks/${id}`),
};

export const dashboardAPI = {
    get: () => api.get('/dashboard'),
};

export const usersAPI = {
    getAll: () => api.get('/users'),
    updateRole: (id, role) => api.put(`/users/${id}/role`, { role }),
    remove: (id) => api.delete(`/users/${id}`),
};
