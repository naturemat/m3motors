declare module 'jose' {
  export function createRemoteJWKSet(url: URL): any;
  export function jwtVerify(
    token: string,
    key: any,
    options?: { issuer?: string },
  ): Promise<{ payload: any }>;
}
