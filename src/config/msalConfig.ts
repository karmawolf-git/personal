import type { Configuration } from '@azure/msal-browser';

export const CLIENT_ID = (import.meta.env.VITE_AZURE_CLIENT_ID as string) || '';

export const msalConfig: Configuration = {
  auth: {
    clientId: CLIENT_ID || '00000000-0000-0000-0000-000000000000',
    authority: 'https://login.microsoftonline.com/common',
    redirectUri: typeof window !== 'undefined' ? window.location.origin : '/',
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
};

export const calendarScopes = ['Calendars.ReadWrite'];
