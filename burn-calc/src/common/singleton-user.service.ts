// src/common/singleton-user.ts
export class SingletonUser {
  private static instance: SingletonUser;
  private readonly CREATOR_ID = 1; // Фиксированный ID создателя
  private readonly MODERATOR_ID = 2; // Фиксированный ID модератора

  private constructor() {}

  static getInstance(): SingletonUser {
    if (!SingletonUser.instance) {
      SingletonUser.instance = new SingletonUser();
    }
    return SingletonUser.instance;
  }

  getCreatorId(): number {
    return this.CREATOR_ID;
  }

  getModeratorId(): number {
    return this.MODERATOR_ID;
  }
}