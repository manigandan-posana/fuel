import type { PopupRequest, Configuration } from "@azure/msal-browser";

export const msalConfig: Configuration = {
    auth: {
        clientId: import.meta.env.VITE_CLIENT_ID || "",
        authority: `https://login.microsoftonline.com/${import.meta.env.VITE_TENANT_ID || "common"}`,
        redirectUri: window.location.origin,
    },
    cache: {
        cacheLocation: "sessionStorage", // Changed from localStorage to avoid storage access errors
        storeAuthStateInCookie: false,
    }
};

export const loginRequest: PopupRequest = {
    scopes: [`api://${import.meta.env.VITE_CLIENT_ID}/.default`]
};
