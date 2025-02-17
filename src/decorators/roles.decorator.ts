import { SetMetadata } from "@nestjs/common";
import { UserRoles } from "src/mongoose/schemas/user.schema";

export const ROLES_KEY = "role";
export const Roles = (...roles: UserRoles[]) => SetMetadata(ROLES_KEY, roles);
