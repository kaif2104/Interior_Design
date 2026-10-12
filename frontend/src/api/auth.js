import axios from 'axios';
import { API_BASE_URL } from './config';

const API_URL = `${API_BASE_URL}/auth`;

const authAxios = axios.create({
  baseURL: API_URL,
  withCredentials: true // allows sending and receiving secure session cookies
});

export const signupUser = (userData) => {
  return authAxios.post('/signup', userData);
};

export const loginUser = (userData) => {
  return authAxios.post('/login', userData);
};

export const getMe = () => {
  return authAxios.get('/me');
};

export const logoutUser = () => {
  return authAxios.post('/logout');
};