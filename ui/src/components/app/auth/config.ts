import ServiceSettings from "../../../service/settings";

// https://docs.microsoft.com/en-us/azure/active-directory/develop/msal-net-web-browsers
// https://docs.microsoft.com/en-us/azure/active-directory/develop/tutorial-v2-javascript-auth-code

// This is beautiful:
// it is sufficient to create an app registration, add SPA as platform
// with a redirect URL, and the app is already ready to issue access tokens

export const msalConfig = {
  auth: {
    clientId: ServiceSettings.clientId,
    authority: ServiceSettings.authority,
    redirectUri: ServiceSettings.redirectURL,
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
};

export const loginRequest = {
  scopes: [
    "openid",
    "profile",
    "api://e9ee7140-519d-458c-9621-0b3e110ea5a3/user_impersonation",
  ],
};

export const tokenRequest = {
  scopes: ["api://e9ee7140-519d-458c-9621-0b3e110ea5a3/user_impersonation"],
};
