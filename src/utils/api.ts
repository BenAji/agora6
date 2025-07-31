// API utility functions for notification services

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// Generic API request function
export const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
};

// Notification-specific API functions
export const scheduleNotifications = async (): Promise<ApiResponse> => {
  return apiRequest('/api/notifications/schedule', {
    method: 'POST',
  });
};



export const getNotificationStats = async (): Promise<ApiResponse> => {
  return apiRequest('/api/notifications/stats');
};

// Health check for notification services
export const checkNotificationServices = async (): Promise<ApiResponse> => {
  return apiRequest('/api/notifications/health');
};

export default {
  apiRequest,
  scheduleNotifications,
  getNotificationStats,
  checkNotificationServices,
}; 