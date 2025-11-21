declare module 'next' {
  import type { IncomingMessage, ServerResponse } from 'http';

  export interface NextApiRequest extends IncomingMessage {
    body: any;
    query: Record<string, string | string[]>;
    cookies: Record<string, string>;
    method?: string;
    headers: Record<string, string | string[] | undefined>;
  }

  export interface NextApiResponse<T = any> extends ServerResponse {
    status(code: number): NextApiResponse<T>;
    json(body: T): NextApiResponse<T>;
    send(body: any): NextApiResponse<T>;
    setHeader(name: string, value: string): void;
  }
}

declare module 'node-mocks-http' {
  import type { NextApiRequest, NextApiResponse } from 'next';

  export interface MockRequestInit<TBody = any> {
    method?: string;
    headers?: Record<string, string | string[]>;
    body?: TBody;
  }

  export interface MockResponse<T = any> extends NextApiResponse<T> {
    _getStatusCode(): number;
    _getData(): string;
  }

  export function createRequest<T = NextApiRequest>(options?: Partial<T> & MockRequestInit): T;
  export function createResponse<T = NextApiResponse>(): MockResponse<T>;
}

declare module 'vitest/config' {
  export function defineConfig(config: any): any;
}

declare module 'crypto' {
  interface Hmac {
    update(data: string): Hmac;
    digest(encoding: 'hex'): string;
  }

  interface CryptoModule {
    createHmac(algo: string, key: string): Hmac;
    randomUUID(): string;
    timingSafeEqual(a: BufferLike, b: BufferLike): boolean;
  }

  const crypto: CryptoModule;
  export = crypto;
}

declare const process: {
  env: Record<string, string | undefined>;
  exitCode?: number;
  uptime(): number;
};

interface BufferLike {
  length: number;
}

declare const Buffer: {
  from(input: string): BufferLike;
};

declare const vi: {
  fn<T extends (...args: any[]) => any>(impl?: T): vi.Mock<T>;
  mock(modulePath: string, factory: () => any): void;
};

declare namespace vi {
  type Mock<T extends (...args: any[]) => any = (...args: any[]) => any> = T & {
    mockImplementation(impl: T): void;
    mockImplementationOnce(impl: T): void;
  };
}

declare function describe(name: string, fn: () => void): void;
declare function it(name: string, fn: () => any): void;
declare function beforeEach(fn: () => any): void;
declare function expect(actual: any): any;
