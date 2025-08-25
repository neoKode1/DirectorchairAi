declare module '@fal-ai/client' {
  export interface FalClientRequest {
    url: string;
    method: string;
    headers: Record<string, string>;
    body?: any;
  }

  export interface FalClientOptions {
    proxyUrl?: string;
    credentials?: string | undefined;
    requestMiddleware?: (request: FalClientRequest) => FalClientRequest;
  }

  export interface FalClient {
    subscribe: (model: string, options: any) => Promise<any>;
    run: (model: string, input: any) => Promise<any>;
    config: (options: FalClientOptions) => void;
  }

  export function createFalClient(options: FalClientOptions): FalClient;
  
  // Default client instance
  export const fal: FalClient;
} 