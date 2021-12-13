import JwtDecode from "jwt-decode";
import {loginSilent} from ".";
import {User} from "../../../service/user";

export interface JwtToken {
  aud: string;
  exp: number;
  iat: number;
  iss: string;
  name: string;
  nbf: number;
  nonce: string;
  oid: string;
  email: string;
  preferred_username: string;
  roles: string[];
}

export function isExpired(token: JwtToken): boolean {
  const expiryDate = new Date(token.exp * 1000);
  return expiryDate < new Date();
}

export function userFromAccessToken(token: string | null): User | null {
  if (!token) {
    return null;
  }

  try {
    const jwt = JwtDecode<JwtToken>(token);
    return new User(jwt);
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error(error);

    return null;
  }
}

export async function userFromCachedAccessToken(
  token: string
): Promise<User | null> {
  if (!token) {
    return null;
  }

  try {
    const jwt = JwtDecode<JwtToken>(token);

    if (isExpired(jwt)) {
      // eslint-disable-next-line no-console
      console.info("The id token expired, try to obtain a new one.");
      return await loginSilent(jwt.preferred_username);
    }

    return new User(jwt);
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error(error);

    return null;
  }
}
