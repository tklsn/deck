import type { User } from "../../domain/User";

export interface UserRepositoryPort {
  save: (user: User) => Promise<void> | Promise<User>;
  findById: (id: string) => Promise<User | null>;
  findByEmail: (email: string) => Promise<User | null>;
  update: (user: User) => Promise<User>;
  delete: (id: string) => Promise<void> | Promise<User>;
  list: () => Promise<User[]>;
}
