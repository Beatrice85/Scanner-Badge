import { AuthRepository } from "./auth.repository";
import  bcrypt  from "bcrypt"
import  jwt from "jsonwebtoken"
import { Role } from "@prisma/client";
import { AuthPayload } from "../../middleware/auth.middleware";
import { HttpError } from "../../errors/http-error";

// Valeurs acceptées à l'inscription (corps de POST /auth/register) et rôle Prisma correspondant.
export const ROLES_INSCRIPTION: Record<string, Role> = {
    employe: Role.EMPLOYE,
    admin: Role.ADMIN
};

// role absent : EMPLOYE (comportement historique). Toute autre valeur que "employe" ou "admin" : 400.
function roleInscription(role: unknown): Role {
    if (role === undefined || role === null) {
        return Role.EMPLOYE;
    }
    if (typeof role !== "string" || !Object.prototype.hasOwnProperty.call(ROLES_INSCRIPTION, role)) {
        throw new HttpError(400, `Rôle invalide. Valeurs possibles : ${Object.keys(ROLES_INSCRIPTION).join(", ")}`);
    }
    return ROLES_INSCRIPTION[role];
}

export class AuthService {
    private repository : AuthRepository;

    constructor() {
        this.repository = new AuthRepository();
    }


    async register(data:{ nom: string, email:string, password:string, role?: unknown }){

        // ATTENTION : route publique. Choisir "admin" donne immédiatement les droits ADMIN
        // à n'importe quel visiteur (choix assumé, voir CLAUDE.md).
        const role = roleInscription(data.role);

        const existingUser = await this.repository.findUserByEmail(data.email);

        if(existingUser) {
            throw new Error('utilisateur existe deja')
        }

        const hashPassword = await bcrypt.hash(data.password,10)

        // EMPLOYE : fiche employé liée (existante par email, sinon créée) dans la même
        // transaction, pour pouvoir demander un congé dès la première connexion.
        const { user } = await this.repository.createUserAvecFiche({
            nom : data.nom,
            email: data.email,
            password: hashPassword,
            role
        })

        return {
            id : user.id,
            nom: user.nom,
            email: user.email,
            role: user.role,
            employeId: user.employeId
        }
    }


    async login(data:{ email:string, password: string}) {

        const user = await this.repository.findUserByEmail(data.email);

        if(!user) {
            throw new Error("utilisateur introuvable")
        }

        const passwordValid = await bcrypt.compare(data.password, user.password);

        if(!passwordValid) {
            throw new Error("mot de passe incorrect")
        }

        const payload: AuthPayload = {
            id: user.id,
            email: user.email,
            role: user.role,
            employeId: user.employeId
        };

        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET!,
            {expiresIn: "1d" }
        );

        return { token, role: user.role, employeId: user.employeId }

    }


    async me(id: string) {

        const user = await this.repository.findUserById(id);

        if(!user) {
            throw new HttpError(404, "utilisateur introuvable")
        }

        return user;
    }


}
