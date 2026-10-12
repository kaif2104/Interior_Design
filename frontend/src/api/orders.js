import axios from 'axios';
import { API_BASE_URL } from './config';

const API_URL = `${API_BASE_URL}/orders`;

export const createOrder = (orderData) => {
  return axios.post(API_URL, orderData, { withCredentials: true });
};

export const getOrders = (params = {}) => {
  return axios.get(API_URL, { params, withCredentials: true });
};

export const getOrderById = (id) => {
  return axios.get(`${API_URL}/${id}`, { withCredentials: true });
};

export const updateOrderStatus = (id, data) => {
  return axios.patch(`${API_URL}/${id}/status`, data, { withCredentials: true });
};

export const deleteOrder = (id) => {
  return axios.delete(`${API_URL}/${id}`, { withCredentials: true });
};
