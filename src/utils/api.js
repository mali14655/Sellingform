import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Seller API
export const submitSellerForm = (formData) => {
  return axios.post(`${API_URL}/sellers/submit`, formData);
};

export const getSellerSubmission = (id) => {
  return axios.get(`${API_URL}/sellers/${id}`);
};

// Admin API
export const adminLogin = (credentials) => {
  return axios.post(`${API_URL}/admin/login`, credentials);
};

export const adminRegister = (data) => {
  return axios.post(`${API_URL}/admin/register`, data);
};

export const getSubmissions = (token) => {
  return axios.get(`${API_URL}/admin/submissions`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const getSubmission = (id, token) => {
  return axios.get(`${API_URL}/admin/submissions/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const updateItemPrice = (submissionId, itemIndex, data, token) => {
  return axios.put(`${API_URL}/admin/submissions/${submissionId}/items/${itemIndex}`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const updateSubmissionNotes = (submissionId, data, token) => {
  return axios.put(`${API_URL}/admin/submissions/${submissionId}/notes`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
};
