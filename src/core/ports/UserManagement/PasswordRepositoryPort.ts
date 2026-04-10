export interface PasswordRepositoryPort {
  comparePassword: (password: string, hashedPassword: string) => Promise<boolean>
  hashPassword: (password: string) => Promise<string>
}
