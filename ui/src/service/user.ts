export interface UserOptions {
  name: string;
  oid: string;
  preferred_username: string;
  exp: number;
  roles: string[];
}

export class User {
  private _options: UserOptions | null;
  private _roles: string[];
  private _superUser: boolean;

  get email(): string {
    return this.options?.preferred_username || "";
  }

  get options(): UserOptions | null {
    return this._options;
  }

  get roles(): string[] {
    return this._roles;
  }

  isExpired(): boolean {
    if (!this._options) {
      return false;
    }
    const expiryDate = new Date(this._options.exp * 1000);
    return expiryDate < new Date();
  }

  constructor(options?: UserOptions) {
    if (options) {
      const roles = options?.roles || [];
      this._options = options;
      this._roles = roles;
      this._superUser = roles.includes("ADMIN");
    } else {
      this._options = null;
      this._roles = [];
      this._superUser = false;
    }
  }

  hasRole(role: string): boolean {
    if (this._superUser) {
      return true;
    }
    return this._roles.includes(role);
  }

  can(role: string): boolean {
    if (this._superUser) {
      return true;
    }
    return this.hasRole(role);
  }

  private getRolesBySuffix(suffix: string): string[] {
    const roles: string[] = [];
    for (const role of this._roles) {
      if (role.startsWith(suffix)) {
        roles.push(role.substr(suffix.length));
      }
    }
    return roles;
  }
}
