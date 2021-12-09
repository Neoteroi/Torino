interface SettingsFile {
  api_url: string;
  api_scope: string;
  client_id: string;
  client_authority: string;
}

// see settings.js
declare const Settings: SettingsFile;

class ServiceSettings {
  private _apiURL: string;
  private _apiScope: string;
  private _clientId: string;
  private _authority: string;
  private _redirectURL: string;

  public get apiURL(): string {
    return this._apiURL;
  }

  public get apiScope(): string {
    return this._apiScope;
  }

  public get clientId(): string {
    return this._clientId;
  }

  public get authority(): string {
    return this._authority;
  }

  public get redirectURL(): string {
    return this._redirectURL;
  }

  public get authEnabled(): boolean {
    if (!this._clientId || !this._apiScope) {
      return false;
    }

    return true;
  }

  constructor() {
    this._apiURL = Settings.api_url;
    this._apiScope = Settings.api_scope;
    this._clientId = Settings.client_id;
    this._authority = Settings.client_authority;
    this._redirectURL = window.location.origin;
  }
}

export default new ServiceSettings();
