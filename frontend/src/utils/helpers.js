// In-memory storage replacement for localStorage
const memoryStorage = {};

export const getFromStorage = (key, defaultValue = null) => {
  try {
    return memoryStorage[key] || defaultValue;
  } catch (error) {
    console.error('Error reading from memory storage:', error);
    return defaultValue;
  }
};

export const setToStorage = (key, value) => {
  try {
    memoryStorage[key] = value;
    return true;
  } catch (error) {
    console.error('Error writing to memory storage:', error);
    return false;
  }
};

export const removeFromStorage = (key) => {
  try {
    delete memoryStorage[key];
    return true;
  } catch (error) {
    console.error('Error removing from memory storage:', error);
    return false;
  }
};

export const getStatusColor = (status) => {
  const colors = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
    draft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    failed: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    running: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  };
  return colors[status] || colors.inactive;
};

export const getStatusDot = (status) => {
  const colors = {
    active: 'bg-green-500',
    inactive: 'bg-gray-500',
    draft: 'bg-yellow-500',
    completed: 'bg-green-500',
    failed: 'bg-red-500',
    running: 'bg-blue-500',
  };
  return colors[status] || colors.inactive;
};

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
  });
};

export const truncateText = (text, maxLength = 50) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
