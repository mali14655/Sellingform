export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('adminToken', token);
  } else {
    localStorage.removeItem('adminToken');
  }
};

export const getAuthToken = () => {
  return localStorage.getItem('adminToken');
};

export const isAuthenticated = () => {
  return !!getAuthToken();
};
