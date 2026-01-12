// client-side

export const API_BASE_URL = import.meta.env.MODE === 'development' 
  ? 'http://localhost:8000/api/v1' 
  : 'https://taskmaster-8upr.onrender.com/api/v1';