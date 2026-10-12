import axios from 'axios';
import { API_BASE_URL } from './config';

const API_URL = `${API_BASE_URL}/items`;

export const getItems = (params = {}) => {
  return axios.get(API_URL, { params });
};

export const getItemById = (id) => {
  return axios.get(`${API_URL}/${id}`);
};

export const createItem = (itemData) => {
  return axios.post(API_URL, itemData, { withCredentials: true });
};

export const updateItem = (id, itemData) => {
  return axios.put(`${API_URL}/${id}`, itemData, { withCredentials: true });
};

export const deleteItem = (id) => {
  return axios.delete(`${API_URL}/${id}`, { withCredentials: true });
};
