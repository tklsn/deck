import type { OAuthProfile } from "../../domain/OAuthProfile";

export interface UserOAuthProfilePort {
  createOAuthProfile: (
    userId: string,
    profile: { sub: string, [key: string]: any },
    provider: string
  ) => Promise<OAuthProfile>
  findOAuthProfileByUserId: (
    userId: string,
    provider: string
  ) => Promise<OAuthProfile>
  updateOAuthProfile: (profile: OAuthProfile) => Promise<OAuthProfile>
}
