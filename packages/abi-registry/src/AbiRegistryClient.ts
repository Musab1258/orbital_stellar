/**
 * ABI Registry Specification Format Version-Negotiation Behavior
 * 
 * To ensure backward compatibility and prevent silent parsing failures when future spec format changes are introduced,
 * the `AbiRegistryClient` implements explicit version negotiation via the `Accept` header.
 * 
 * 1. Client Version Pinning:
 *    On every HTTP request, the client must include the following header:
 *    `Accept: application/vnd.orbital.abi-registry+json; version=1`
 * 
 * 2. Server Response Expectations:
 *    - Success: The server must respond with the requested payload matching the requested version format.
 *      The response `Content-Type` header should reflect this (e.g., `Content-Type: application/vnd.orbital.abi-registry+json; version=1`).
 *    - Incompatible / Unsupported Version: If the server cannot satisfy version 1 of the spec,
 *      it must return an HTTP status code `406 Not Acceptable` or `466 Version Not Supported` instead of returning
 *      an incompatible spec version payload. This prevents client-side JSON parsing or runtime decoding errors.
 *    - Missing Header: If the client request lacks the expected `Accept` version-negotiation header,
 *      the server should either default to the lowest common denominator (version 1) or reject the request with `406 Not Acceptable`.
 */

export interface AbiRegistryClientOptions {
  /** The base URL of the ABI Registry API server. Defaults to "https://api.orbital.vnd/abi-registry" */
  baseUrl?: string;
  /** Optional API token for authorization if required by the registry. */
  apiKey?: string;
  /** Optional custom headers to send with every request. */
  headers?: Record<string, string>;
  /** Optional custom fetch implementation (useful for testing or specific runtimes). */
  fetch?: typeof fetch;
}

export class AbiRegistryClient {
  private baseUrl: string;
  private apiKey?: string;
  private customHeaders: Record<string, string>;
  private fetchFn: typeof fetch;

  constructor(options: AbiRegistryClientOptions = {}) {
    this.baseUrl = options.baseUrl || "https://api.orbital.vnd/abi-registry";
    this.apiKey = options.apiKey;
    this.customHeaders = options.headers || {};
    this.fetchFn = options.fetch || globalThis.fetch;
  }

  /**
   * Helper to perform an HTTP request with version negotiation.
   */
  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
    const headers = new Headers(options.headers);

    // Apply custom headers passed to client constructor
    for (const [key, value] of Object.entries(this.customHeaders)) {
      headers.set(key, value);
    }

    // Set standard and version-negotiated headers
    headers.set("Accept", "application/vnd.orbital.abi-registry+json; version=1");
    if (this.apiKey) {
      headers.set("Authorization", `Bearer ${this.apiKey}`);
    }

    const response = await this.fetchFn(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`ABI Registry request failed with status ${response.status}: ${response.statusText}`);
    }

    return response.json() as Promise<T>;
  }

  /**
   * Retrieves the ABI definition for a given contract ID.
   * 
   * @param contractId The address or identifier of the Stellar/Soroban contract.
   * @returns The parsed ABI registry document payload.
   */
  async getAbi(contractId: string): Promise<any> {
    return this.request<any>(`/contracts/${contractId}`);
  }

  /**
   * Publishes or updates the ABI definition for a given contract ID.
   * 
   * @param contractId The address or identifier of the Stellar/Soroban contract.
   * @param abi The contract ABI definition / metadata.
   */
  async registerAbi(contractId: string, abi: any): Promise<void> {
    await this.request<void>(`/contracts/${contractId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ abi }),
    });
  }
}
