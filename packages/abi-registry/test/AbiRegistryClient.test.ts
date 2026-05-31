import { describe, it, expect, vi } from "vitest";
import { AbiRegistryClient } from "../src/AbiRegistryClient.js";

describe("AbiRegistryClient", () => {
  it("sends the correct Accept header on every request", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: "ok" }),
    });

    const client = new AbiRegistryClient({
      fetch: mockFetch as any,
    });

    await client.getAbi("CA123");

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.orbital.vnd/abi-registry/contracts/CA123");
    
    const headers = init.headers as Headers;
    expect(headers.get("Accept")).toBe("application/vnd.orbital.abi-registry+json; version=1");
  });

  it("sets the Authorization header if apiKey is provided", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: "ok" }),
    });

    const client = new AbiRegistryClient({
      fetch: mockFetch as any,
      apiKey: "secret-token",
    });

    await client.getAbi("CA123");

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [, init] = mockFetch.mock.calls[0] as [string, RequestInit];
    const headers = init.headers as Headers;
    expect(headers.get("Authorization")).toBe("Bearer secret-token");
  });

  it("merges custom headers", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: "ok" }),
    });

    const client = new AbiRegistryClient({
      fetch: mockFetch as any,
      headers: {
        "X-Custom-Header": "custom-value",
      },
    });

    await client.getAbi("CA123");

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [, init] = mockFetch.mock.calls[0] as [string, RequestInit];
    const headers = init.headers as Headers;
    expect(headers.get("Accept")).toBe("application/vnd.orbital.abi-registry+json; version=1");
    expect(headers.get("X-Custom-Header")).toBe("custom-value");
  });

  it("submits POST requests correctly during registration", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: "ok" }),
    });

    const client = new AbiRegistryClient({
      fetch: mockFetch as any,
    });

    const testAbi = { methods: [] };
    await client.registerAbi("CA123", testAbi);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.orbital.vnd/abi-registry/contracts/CA123");
    expect(init.method).toBe("POST");
    expect(init.body).toBe(JSON.stringify({ abi: testAbi }));

    const headers = init.headers as Headers;
    expect(headers.get("Accept")).toBe("application/vnd.orbital.abi-registry+json; version=1");
    expect(headers.get("Content-Type")).toBe("application/json");
  });

  it("throws an error when response is not ok", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: "Not Found",
    });

    const client = new AbiRegistryClient({
      fetch: mockFetch as any,
    });

    await expect(client.getAbi("CA123")).rejects.toThrow(
      "ABI Registry request failed with status 404: Not Found"
    );
  });
});
