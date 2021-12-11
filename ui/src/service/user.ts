export interface UserOptions {
  name: string;
  email: string;
  oid: string;
  preferred_username: string;
  exp: number;
  roles: string[];
}

export class User {
  private _options: UserOptions | null;
  private _roles: string[];
  private _superUser: boolean;

  get name(): string {
    return this.options?.name || "";
  }

  get email(): string {
    return this.options?.email || "";
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
}

export class RootUser extends User {
  constructor() {
    super({
      name: "root",
      email: "root",
      oid: "",
      preferred_username: "root",
      exp: -1,
      roles: ["ADMIN"],
    });
  }

  isExpired(): boolean {
    return false;
  }
}
