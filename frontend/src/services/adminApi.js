import api from "./api"

export const getAllStakeholdersAPI = (params) =>
    api.get("/admin/stakeholders", { params });

export const createStakeholderAPI = (data) =>
    api.post("/admin/stakeholders", data);

export const updateStakeholderAPI = (id, data) =>
    api.put(`/admin/stakeholders/${id}`, data);

export const toggleStatusAPI = (id) =>
    api.patch(`/admin/stakeholders/${id}/status`);

export const deleteStakeholderAPI = (id) =>
    api.delete(`/admin/stakeholders/${id}`);

export const resetPasswordAPI = (id, newPassword) =>
    api.patch(`/admin/stakeholders/${id}/reset-password`, { newPassword });