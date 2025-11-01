import { useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = async (method, url, data = null) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api({
        method,
        url,
        data,
      });
      if (response.data.message && !url.includes('login')) {
        toast.success(response.data.message);
      }
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      setError(message);
      if (!message.includes('401')) {
        toast.error(message);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { request, loading, error };
};
