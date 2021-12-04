interface SettingsFile {
  api_url: string;
  client_id: string;
  client_authority: string;
}

class ServiceSettings {
  private _apiURL: string;
  private _clientId: string;
  private _authority: string;
  private _redirectURL: string;

  public get apiURL(): string {
    return this._apiURL;
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

  constructor() {
    const request = new XMLHttpRequest();
    // false makes the request sync
    request.open("GET", "/settings.json", false);
    request.send(null);

    if (request.status === 200) {
      const data = JSON.parse(request.responseText) as SettingsFile;
      this._apiURL = data.api_url;
      this._clientId = data.client_id;
      this._authority = data.client_authority;
    } else {
      throw new Error("Failed to load /settings.json");
    }

    this._redirectURL = window.location.origin;
  }
}

export default new ServiceSettings();
