// lib/digitapClient.js
import axios from 'axios';

const DIGITAP_BASE_URL = 'https://api.digitap.ai/v1'; // Replace with actual URL

export const digitapClient = axios.create({
  baseURL: DIGITAP_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.DIGITAP_API_KEY}`,
  },
});
