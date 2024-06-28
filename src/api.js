import axios from 'axios';

export const baseUrl = 'https://balldontlie.fr/pbox/api'; // Your API base URL

const api = axios.create({
  baseURL: baseUrl,
});

export default api;
