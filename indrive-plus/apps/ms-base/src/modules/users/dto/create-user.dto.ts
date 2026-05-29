import { UserRole } from '@app/shared';

export class CreateUserDto {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
}
