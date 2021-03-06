import {CommonAuthorizationUrlRequest} from "@azure/msal-common";
import {loginRequest, msalConfig} from "./config";
import {User} from "../../../service/user";
import {
  PublicClientApplication,
  InteractionRequiredAuthError,
} from "@azure/msal-browser";
import {userFromAccessToken} from "./tokens";
import {startsWith} from "lodash";

const app = new PublicClientApplication(msalConfig);

export type SsoSilentRequest = Partial<
  Omit<
    CommonAuthorizationUrlRequest,
    "responseMode" | "codeChallenge" | "codeChallengeMethod"
  >
>;

const storage = sessionStorage;
const TOKEN_STORAGE_KEY = "ACCESS_TOKEN";

export function hasStoredToken(): boolean {
  return TOKEN_STORAGE_KEY in storage;
}

export function login(): Promise<User> {
  return new Promise((resolve, reject) => {
    app
      .loginPopup(loginRequest)
      .then((resp) => {
        if (resp !== null) {
          storage.setItem(TOKEN_STORAGE_KEY, resp.accessToken);

          const user = userFromAccessToken(resp.accessToken);

          if (user) {
            resolve(user);
          } else {
            reject("The JWT could not be used");
          }
        } else {
          reject("Response is null");
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
}

export function clearTokens(): void {
  let key: string;
  const keysToRemove: string[] = [];

  for (key in storage) {
    if (startsWith(key, "msal.")) {
      keysToRemove.push(key);
    }
  }
  for (key in keysToRemove) {
    storage.removeItem(key);
  }

  storage.removeItem(TOKEN_STORAGE_KEY);
}

export function logout(): void {
  app.logout();
  clearTokens();
}

export function userFromStorage(): User | null {
  const stored = storage.getItem(TOKEN_STORAGE_KEY);

  if (!stored) {
    return null;
  }

  return userFromAccessToken(stored);
}

export function loginSilent(loginHint: string): Promise<User | null> {
  // Tries to obtain a new access token silently, for the user with the given
  // login hint (email address).
  // If it fails for most reasons, it return null (the user will be requested
  // to repeat login).
  return new Promise((resolve, reject) => {
    app
      .ssoSilent({
        loginHint,
      })
      .then((resp) => {
        if (resp !== null) {
          storage.setItem(TOKEN_STORAGE_KEY, resp.accessToken);

          const user = userFromAccessToken(resp.accessToken);

          if (user) {
            resolve(user);
          } else {
            resolve(null);
          }
        } else {
          resolve(null);
        }
      })
      .catch((error) => {
        if (error instanceof InteractionRequiredAuthError) {
          // perfectly fine
          resolve(null);
        } else {
          reject(error);
        }
      });
  });
}
