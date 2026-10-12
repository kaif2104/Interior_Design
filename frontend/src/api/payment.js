import axios from 'axios';
import { API_BASE_URL } from './config';

const API_URL = `${API_BASE_URL}/payments`;

export const createPayment = (paymentData) => {
  return axios.post(API_URL, paymentData);
};

export const getPayments = (filters = {}) => {
  return axios.get(API_URL, { params: filters });
};

export const getPaymentById = (id) => {
  return axios.get(`${API_URL}/${id}`);
};
