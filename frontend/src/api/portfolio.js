import axios from 'axios';
import { API_BASE_URL } from './config';

const API_URL = `${API_BASE_URL}/portfolio`;

export const getPortfolioItems = (filters = {}) => {
  return axios.get(API_URL, { params: filters });
};

export const getPortfolioItemById = (id) => {
  return axios.get(`${API_URL}/${id}`);
};