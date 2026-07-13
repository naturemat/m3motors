/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
declare module '@nestjs/bull' {
  import { DynamicModule, ModuleMetadata } from '@nestjs/common';

  export interface BullModuleAsyncOptions extends Pick<
    ModuleMetadata,
    'imports'
  > {
    useFactory: (...args: any[]) => any;
    inject?: any[];
  }

  export class BullModule {
    static forRootAsync(options: BullModuleAsyncOptions): DynamicModule;
    static registerQueue(...options: any[]): DynamicModule;
  }

  export function InjectQueue(name: string): ParameterDecorator;

  export function Process(name?: string | symbol): MethodDecorator;

  export function Processor(name: string): ClassDecorator;
}

declare module 'jose' {
  export interface JWTPayload {
    iss?: string;
    sub?: string;
    aud?: string | string[];
    exp?: number;
    nbf?: number;
    iat?: number;
    jti?: string;
    [key: string]: unknown;
  }

  export interface JWTVerifyResult {
    payload: JWTPayload;
    protectedHeader: Record<string, unknown>;
  }

  export interface RemoteJWKSetOptions {
    timeout?: number;
    cooldownDuration?: number;
  }

  export type KeyLike = any;

  export function createRemoteJWKSet(
    url: URL,
    options?: RemoteJWKSetOptions,
  ): KeyLike | ((...args: any[]) => Promise<KeyLike>);

  export function jwtVerify(
    jwt: string | Uint8Array,
    key: KeyLike | ((...args: any[]) => Promise<KeyLike>),
    options?: {
      issuer?: string | string[];
      audience?: string | string[];
      clockTolerance?: string | number;
    },
  ): Promise<JWTVerifyResult>;
}

declare module '@google/genai' {
  export interface GenerateContentResponse {
    text?: string;
    candidates?: any[];
    [key: string]: unknown;
  }

  export interface GenerateContentParameters {
    model: string;
    contents: any[];
    config?: Record<string, unknown>;
  }

  export class GoogleGenAI {
    constructor(options: { apiKey: string });
    models: {
      generateContent(
        params: GenerateContentParameters,
      ): Promise<GenerateContentResponse>;
    };
  }
}
