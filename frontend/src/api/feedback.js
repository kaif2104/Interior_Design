import axios from 'axios';
import { API_BASE_URL } from './config';

const API_URL = `${API_BASE_URL}/feedback`;

export const createFeedback = (feedbackData) => {
  return axios.post(API_URL, feedbackData);
};

export const getFeedback = (filters = {}) => {
  return axios.get(API_URL, { params: filters });
};
