// services/digitapService.js
import { digitapClient } from '@/lib/digitapClient';

export async function fetchKYCStatus(customerId) {
  try {
    const response = await digitapClient.get(`/kyc/status/${customerId}`);
    return { success: true, data: response.data };
  } catch (err) {
    const status = err.response?.status || 500;
    const message = err.response?.data?.message || 'Unknown Digitap error';
    return {
      success: false,
      error: {
        status,
        message,
        raw: err.response?.data || null,
      },
    };
  }
}
