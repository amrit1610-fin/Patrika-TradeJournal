import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: { 'Content-Type': 'application/json' },
});

export const getAllTrades = () => API.get('/trades');
export const getTradesByMonth = (year, month) => API.get(`/trades/month/${year}/${month}`);
export const getTradesByDate = (date) => API.get(`/trades/date/${date}`);
export const createTrade = (data) => API.post('/trades', data);
export const updateTrade = (id, data) => API.put(`/trades/${id}`, data);
export const deleteTrade = (id) => API.delete(`/trades/${id}`);
