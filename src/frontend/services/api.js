import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Example named export (keep or add more as needed)
// export const registerProfessor = async (data) => { ... };

export default api;