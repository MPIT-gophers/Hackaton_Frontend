export type AuthService = {
  signIn(): Promise<void>;
};

export const authService: AuthService = {
  async signIn() {
    return Promise.resolve();
  }
};
