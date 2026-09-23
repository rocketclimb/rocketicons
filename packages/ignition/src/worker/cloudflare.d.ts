/**
 * Minimal ambient declarations for the Cloudflare globals this Worker uses. Hand-rolled rather
 * than pulling in @cloudflare/workers-types, whose globals (Request, Response, caches) collide
 * with the DOM lib the rest of the app is typechecked against.
 */

interface Fetcher {
  fetch(input: Request | string, init?: RequestInit): Promise<Response>;
}

interface HTMLRewriterElement {
  getAttribute(name: string): string | null;
  setAttribute(name: string, value: string): void;
  setInnerContent(content: string): void;
}

interface HTMLRewriterElementHandler {
  element?(element: HTMLRewriterElement): void;
}

declare class HTMLRewriter {
  on(selector: string, handler: HTMLRewriterElementHandler): HTMLRewriter;
  transform(response: Response): Response;
}

/** Injected at bundle time by scripts/build-worker.ts. */
declare const SITE_NAME: string;
