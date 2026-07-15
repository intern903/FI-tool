import type { AnalyzeResponse } from "./types";

// Encodes a full audit result into a URL fragment so a shared link reproduces
// the exact report with no backend storage. The payload is gzip-compressed
// (when the browser supports CompressionStream) then base64url-encoded.

function bytesToBase64url(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64urlToBytes(s: string): Uint8Array {
  const padded = s.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(padded);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function gzip(input: Uint8Array): Promise<Uint8Array> {
  const stream = new Blob([input as unknown as BlobPart])
    .stream()
    .pipeThrough(new CompressionStream("gzip"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

async function gunzip(input: Uint8Array): Promise<Uint8Array> {
  const stream = new Blob([input as unknown as BlobPart])
    .stream()
    .pipeThrough(new DecompressionStream("gzip"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

const HASH_PREFIX = "#r=";

export async function encodeResult(result: AnalyzeResponse): Promise<string> {
  const json = JSON.stringify(result);
  const raw = new TextEncoder().encode(json);
  // Tag byte: 'g' = gzipped, 'r' = raw, so decode knows how to reverse it.
  if (typeof CompressionStream !== "undefined") {
    const compressed = await gzip(raw);
    return "g" + bytesToBase64url(compressed);
  }
  return "r" + bytesToBase64url(raw);
}

export async function decodeResult(token: string): Promise<AnalyzeResponse | null> {
  try {
    const tag = token[0];
    const bytes = base64urlToBytes(token.slice(1));
    const raw = tag === "g" ? await gunzip(bytes) : bytes;
    const json = new TextDecoder().decode(raw);
    const parsed = JSON.parse(json) as AnalyzeResponse;
    if (!parsed?.report || typeof parsed.report.overallScore !== "number") return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Reads an encoded result token from the current URL fragment, if present. */
export function readHashToken(): string | null {
  const hash = window.location.hash;
  return hash.startsWith(HASH_PREFIX) ? hash.slice(HASH_PREFIX.length) : null;
}

export async function buildShareUrl(result: AnalyzeResponse): Promise<string> {
  const token = await encodeResult(result);
  const { origin, pathname } = window.location;
  return `${origin}${pathname}${HASH_PREFIX}${token}`;
}

export function setHash(token: string): void {
  history.replaceState(null, "", `${HASH_PREFIX}${token}`);
}

export function clearHash(): void {
  history.replaceState(null, "", window.location.pathname + window.location.search);
}
