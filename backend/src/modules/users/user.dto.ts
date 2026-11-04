import { Role } from "@prisma/client";

export interface LierEmployeDto {
    employeId: string;
}

export interface ChangerRoleDto {
    role: Role;
}
