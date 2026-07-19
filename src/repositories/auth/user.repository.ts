import { User } from "../../models/auth/user";

export interface UserRepository {

  findById(id: string): Promise<User | null>;

  findByEmail(email: string): Promise<User | null>;

  save(user: User): Promise<void>;

  update(user: User): Promise<void>;

}