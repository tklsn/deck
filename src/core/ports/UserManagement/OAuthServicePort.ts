export interface OAuthServicePort {
  getOAuthURL: () => Promise<string>
  getOAuthToken: (code: string) => Promise<any>
  getOAuthProfile: (token: string) => Promise<any>
}
