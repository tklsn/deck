import type { Profile } from "../../domain/Profile";

export interface UserProfileRepositoryPort {
  createProfile: (userId: string, profile: Profile) => Promise<Profile>;
  findProfileByUserId: (userId: string) => Promise<Profile>;
  updateProfile: (profile: Profile) => Promise<Profile>;
}
