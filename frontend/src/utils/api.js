import axios from 'axios';

const isDev= window.location.hostname === 'localhost';
const API_BASE_URL = isDev
    ? 'http://localhost:5000'
    : '/https://des422-project-1.onrender.com'

export const api = axios.create({
    baseURL: "http://localhost:5000",
    headers: { 'Content-Type': 'application/json' }
})