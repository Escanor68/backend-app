export interface UserPlayerServiceInterface {
  getName(name: string): Promise<UserPlayerObject> | null;
}
