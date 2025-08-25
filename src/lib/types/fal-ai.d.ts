import type { Result, QueueStatus, RequestLog } from '@fal-ai/client';

declare module '@fal-ai/client' {
  // Core types
  export interface RequestLog {
    message: string;
    level?: string;
    timestamp?: string;
  }

  export interface EndpointType {
    data: any;
  }

  export type RequestMiddleware = (request: FalClientRequest) => FalClientRequest;

  export interface FalClientRequest {
    url: string;
    method: string;
    headers: Record<string, string>;
    body?: any;
  }

  export interface FalClientOptions {
    proxyUrl?: string;
    credentials?: string;
    requestMiddleware?: (request: FalClientRequest) => FalClientRequest;
  }

  // Queue types
  export interface BaseQueueOptions {
    requestId: string;
    logs?: boolean;
  }

  export interface QueueStatusOptions extends BaseQueueOptions {
    logs?: boolean;
  }

  export interface SubmitOptions<Input = Record<string, any>> {
    input: Input;
    webhookUrl?: string;
  }

  export interface InQueueQueueStatus {
    status: 'IN_QUEUE';
    request_id: string;
  }

  export interface InProgressQueueStatus {
    status: 'IN_PROGRESS';
    logs: RequestLog[];
  }

  export interface CompletedQueueStatus {
    status: 'COMPLETED';
    logs: RequestLog[];
  }

  export interface QueueStatus {
    status: 'IN_QUEUE' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
    logs?: RequestLog[];
    error?: string;
  }

  // Stream types
  export interface StreamOptions<Input = Record<string, any>> {
    input: Input;
    logs?: boolean;
  }

  export type FalStreamEventType = 'data' | 'done' | 'error';
  export type EventHandler<T> = (data: T) => void;

  export class FalStream<Input = Record<string, any>, Output = any> implements AsyncIterableIterator<Output> {
    [Symbol.asyncIterator](): AsyncGenerator<Output, void, unknown>;
    abort(reason?: string | Error): void;
    done(): Promise<Result<Output>>;
    on(type: FalStreamEventType, listener: EventHandler<any>): void;
  }

  // Client interfaces
  export interface QueueClient {
    submit<Input = Record<string, any>>(endpointId: string, options: { input: Input; webhookUrl?: string }): Promise<{ request_id: string }>;
    status(endpointId: string, options: { requestId: string; logs?: boolean }): Promise<QueueStatus>;
    result<Output = any>(endpointId: string, options: { requestId: string }): Promise<Result<Output>>;
    cancel(endpointId: string, options: BaseQueueOptions): Promise<void>;
    streamStatus(endpointId: string, options: QueueStatusOptions): Promise<FalStream<unknown, QueueStatus>>;
    subscribeToStatus(endpointId: string, options: QueueStatusOptions): Promise<CompletedQueueStatus>;
  }

  export interface StorageClient {
    upload(file: File | Blob | string): Promise<string>;
  }

  export interface RealtimeClient {
    connect<Output = any, Input = Record<string, any>>(
      endpointId: string,
      options: {
        onResult: (result: Result<Output>) => void;
        onError: (error: Error) => void;
      }
    ): {
      send: (input: Input) => void;
      close: () => void;
    };
  }

  export interface StreamingClient {
    connect<Output = any, Input = Record<string, any>>(
      endpointId: string,
      options: StreamOptions<Input>
    ): Promise<FalStream<Input, Output>>;
  }

  export interface RunOptions<Input = Record<string, any>> {
    input: Input;
    logs?: boolean;
    pollInterval?: number;
  }

  export interface QueueUpdate {
    status: string;
    logs: Array<{ message: string }>;
  }

  export interface Result<T = any> {
    data: T;
    requestId: string;
    status: string;
    logs?: RequestLog[];
  }

  export interface QueueSubscribeOptions {
    onQueueUpdate?: (status: QueueStatus) => void;
  }

  export interface FalClient {
    queue: QueueClient;
    realtime: RealtimeClient;
    storage: StorageClient;
    stream: <Output = any, Input = Record<string, any>>(
      endpointId: string,
      options: StreamOptions<Input>
    ) => Promise<FalStream<Input, Output>>;
    streaming: StreamingClient;
    run<Output = any, Input = Record<string, any>>(
      endpointId: string,
      options: RunOptions<Input>
    ): Promise<Result<Output>>;
    subscribe<Output = any, Input = Record<string, any>>(
      endpointId: string,
      options: RunOptions<Input> & QueueSubscribeOptions
    ): Promise<Result<Output>>;
    subscribe: <T extends EndpointType = any>(model: string, options: any) => Promise<Result<T>>;
    run: <T extends EndpointType = any>(model: string, input: any) => Promise<Result<T>>;
    config(options: FalClientOptions): void;
  }

  export function createFalClient(options: FalClientOptions): FalClient;
  export const fal: FalClient;

  // Helper functions
  export function isQueueStatus(status: unknown): status is QueueStatus;
  export function isCompletedQueueStatus(status: QueueStatus): status is CompletedQueueStatus;
  export function parseEndpointId(id: string): { owner: string; name: string };
  export function withMiddleware(middleware: (request: FalClientRequest) => FalClientRequest): (request: FalClientRequest) => FalClientRequest;
  export function withProxy(proxyUrl: string): (request: FalClientRequest) => FalClientRequest;
}

// Re-export types that we use in our codebase
export type { Result, QueueStatus, RequestLog };