export interface JWTManagerRepositoryPort {
  sign: (payload: any, options: any) => string
  verify: (token: string) => string
  decode: (token: string) => any
}
