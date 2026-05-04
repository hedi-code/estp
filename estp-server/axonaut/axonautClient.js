// axonaut/axonautClient.js
// Low-level HTTP wrapper for the Axonaut REST API v2.
// Authentication: userApiKey header (API key from Axonaut account settings).

const BASE_URL = 'https://axonaut.com/api/v2';

class AxonautError extends Error {
  constructor(status, path, detail) {
    super(`Axonaut HTTP ${status} on ${path}: ${detail}`);
    this.status = status;
    this.path = path;
  }
}

class AxonautClient {
  constructor(apiKey) {
    if (!apiKey) throw new Error('AXONAUT_API_KEY is not set');
    this.apiKey = apiKey;
  }

  async _request(method, path, body = null) {
    const opts = {
      method,
      headers: {
        userApiKey: this.apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    };
    if (body !== null) opts.body = JSON.stringify(body);

    let res;
    try {
      res = await fetch(`${BASE_URL}${path}`, opts);
    } catch (networkErr) {
      throw new Error(`Axonaut network error on ${path}: ${networkErr.message}`);
    }

    const text = await res.text();
    if (!res.ok) throw new AxonautError(res.status, path, text);

    return text ? JSON.parse(text) : null;
  }

  get(path)          { return this._request('GET',    path); }
  post(path, body)   { return this._request('POST',   path, body); }
  patch(path, body)  { return this._request('PATCH',  path, body); }
  put(path, body)    { return this._request('PUT',    path, body); }
  delete(path)       { return this._request('DELETE', path); }
}

module.exports = {
  AxonautClient,
  AxonautError,
  // Singleton instance – lazily created so tests can override the env var.
  get client() {
    if (!this._instance) {
      this._instance = new AxonautClient(process.env.AXONAUT_API_KEY);
    }
    return this._instance;
  },
};
