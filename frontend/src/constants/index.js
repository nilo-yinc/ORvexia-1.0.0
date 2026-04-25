// Application Constants
export const APP_NAME = 'Workflow Management System';
export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Status Constants
export const STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};
