export const environment = {
  production: false,
  // This value is injected at build-time by Angular CLI via the .env file
  apiUrl: import.meta.env.NG_APP_API_URL || 'http://localhost:3000/api'
};
