/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import {
  ApplicationError,
  ConflictError,
  NotFoundError,
  PreconditionFailedError,
  UnauthorizedError,
} from "./errors";
import {loginSilent, userFromStorage} from "../components/app/auth";

const JSON_ContentType = "application/json; charset=utf-8";

const storage = sessionStorage;

export const ACCESS_TOKEN_KEY = "ACCESS_TOKEN";

export function getAccessToken(): string | null {
  return storage.getItem(ACCESS_TOKEN_KEY);
}

// Exposes a dictionary that can be used by external code to include
// custom headers in a central place.
export const CustomHeaders: {[key: string]: string} = {};

// NB: @typescript-eslint/explicit-module-boundary-types is disabled
// because JSON.stringify and JSON.parse themselves are typed with `any`.
// There is no need to be more royal than the king and more saint than the pope
// Besides, we cannot assume that the server will return a body known to the
// client.

async function tryParseBodyAsJSON(response: Response): Promise<any> {
  const contentType = response.headers.get("content-type");

  if (contentType !== null && contentType.indexOf("json") > -1) {
    return await response.json();
  }

  return await response.text();
}

function getAuthorizationHeader(): {[key: string]: string} {
  return {
    Authorization: `Bearer ${getAccessToken()}`,
  };
}

/**
 * Wrapper around fetch API, with common logic to handle application errors
 * and response bodies.
 *
 * If the server returns 401 Unauthorized, this method tries once to obtain new
 * tokens silently. If that succeeds, the application flow continues
 * transparently, by repeating the original web request with a new token.
 */
async function appFetch<T>(
  input: RequestInfo,
  init?: RequestInit,
  addAuth: boolean = true,
  retrying: boolean = false
): Promise<T> {
  // extend init properties with an access token
  if (addAuth) {
    if (init === undefined) {
      init = {
        headers: Object.assign({}, getAuthorizationHeader(), CustomHeaders),
      };
    } else {
      init.headers = Object.assign(
        {},
        init.headers,
        getAuthorizationHeader(),
        CustomHeaders
      );
    }
  }

  const response = await fetch(input, init);

  const data = await tryParseBodyAsJSON(response);

  if (response.status === 404) {
    throw new NotFoundError();
  }

  if (response.status === 409) {
    throw new ConflictError();
  }

  if (response.status === 412) {
    throw new PreconditionFailedError();
  }

  if (response.status === 401) {
    if (retrying) {
      // this is already a retry: don't try again,
      throw new UnauthorizedError();
    }
    // try to obtain a new access token using a refresh token,
    // if this doesn't work, then throw exception
    const user = userFromStorage();
    if (user !== null) {
      try {
        const freshUser = await loginSilent(user.email);

        if (freshUser !== null) {
          return await appFetch(input, init, addAuth, true);
        } else {
          throw new UnauthorizedError();
        }
      } catch {
        throw new UnauthorizedError();
      }
    }
  }

  if (response.status >= 400) {
    throw new ApplicationError(
      "Response status does not indicate success",
      response.status,
      data
    );
  }

  return data as T;
}

export async function get<T>(
  url: string,
  headers?: HeadersInit,
  addAuth: boolean = true
): Promise<T> {
  return await appFetch(
    url,
    {
      method: "GET",
      headers,
    },
    addAuth
  );
}

export async function getOptional<T>(
  url: string,
  headers?: HeadersInit,
  addAuth: boolean = true
): Promise<T | null> {
  try {
    return await appFetch(
      url,
      {
        method: "GET",
        headers,
      },
      addAuth
    );
  } catch (error) {
    if (error instanceof NotFoundError) {
      return null;
    }

    throw error;
  }
}

export async function post<T>(
  url: string,
  data: any = null,
  headers?: {[key: string]: string}
): Promise<T> {
  if (!data) {
    return await appFetch(url, {
      method: "POST",
    });
  }

  return await appFetch(url, {
    method: "POST",
    body: JSON.stringify(data),
    headers: headers || {
      "Content-Type": JSON_ContentType,
    },
  });
}

export async function patch<T>(
  url: string,
  data: any,
  headers?: {[key: string]: string}
): Promise<T> {
  return await appFetch(url, {
    method: "PATCH",
    body: JSON.stringify(data),
    headers: headers || {
      "Content-Type": JSON_ContentType,
    },
  });
}

export async function put<T>(
  url: string,
  data: any,
  headers?: {[key: string]: string}
): Promise<T> {
  return await appFetch(url, {
    method: "PUT",
    body: JSON.stringify(data),
    headers: headers || {
      "Content-Type": JSON_ContentType,
    },
  });
}

export async function del<T>(
  url: string,
  data: any = null,
  headers?: {[key: string]: string}
): Promise<T> {
  if (!data) {
    return await appFetch(url, {
      method: "DELETE",
    });
  }

  return await appFetch(url, {
    method: "DELETE",
    body: JSON.stringify(data),
    headers: headers || {
      "Content-Type": JSON_ContentType,
    },
  });
}
