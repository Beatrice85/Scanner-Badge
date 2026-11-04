import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { AuthService } from "../auth.service";
import { AuthRepository } from "../auth.repository";
import { HttpError } from "../../../errors/http-error";

jest.mock("../auth.repository");
jest.mock("bcrypt");
jest.mock("jsonwebtoken");

describe("AuthService", () => {

    let service: AuthService;
    let repository: jest.Mocked<AuthRepository>;

    beforeEach(() => {
        jest.clearAllMocks();
        process.env.JWT_SECRET = "secret-de-test";

        service = new AuthService();

        repository = (service as any).repository;
    });


    describe("register", () => {

        function inscriptionPossible() {
            repository.findUserByEmail.mockResolvedValue(null);
            (bcrypt.hash as jest.Mock).mockResolvedValue("hash");
            repository.createUserAvecFiche.mockImplementation(async (data: any) => ({
                user: { id: "u1", ...data, employeId: data.role === "EMPLOYE" ? "emp-1" : null },
                liaison: data.role === "EMPLOYE" ? { action: "creee", employeId: "emp-1" } : null
            }) as any);
        }

        it.each([
            ["employe", "EMPLOYE"],
            ["admin", "ADMIN"],
        ])("enregistre le rôle %p comme %p", async (role, attendu) => {

            inscriptionPossible();

            const result = await service.register({ nom: "Jean", email: "j@test.com", password: "pwd", role });

            expect(repository.createUserAvecFiche).toHaveBeenCalledWith({
                nom: "Jean",
                email: "j@test.com",
                password: "hash",
                role: attendu
            });
            expect(result.role).toBe(attendu);
        });


        it("renvoie l'employeId de la fiche liée pour un EMPLOYE, null pour un ADMIN", async () => {

            inscriptionPossible();

            const employe = await service.register({ nom: "Jean", email: "j@test.com", password: "pwd", role: "employe" });
            const admin = await service.register({ nom: "Ana", email: "a@test.com", password: "pwd", role: "admin" });

            expect(employe.employeId).toBe("emp-1");
            expect(admin.employeId).toBeNull();
        });


        it("propage le 409 si la fiche de même email est déjà liée à un autre compte", async () => {

            repository.findUserByEmail.mockResolvedValue(null);
            (bcrypt.hash as jest.Mock).mockResolvedValue("hash");
            repository.createUserAvecFiche.mockRejectedValue(new HttpError(409, "Une fiche employé avec cet email est déjà liée à un autre compte"));

            const error = await service.register({ nom: "Jean", email: "j@test.com", password: "pwd", role: "employe" }).catch((e) => e);

            expect(error).toBeInstanceOf(HttpError);
            expect(error.status).toBe(409);
        });


        it("crée un EMPLOYE si aucun rôle n'est envoyé", async () => {

            inscriptionPossible();

            const result = await service.register({ nom: "Jean", email: "j@test.com", password: "pwd" });

            expect(result.role).toBe("EMPLOYE");
        });


        it.each(["ADMIN", "EMPLOYE", "superadmin", "", 1])("refuse (400) le rôle %p sans rien créer", async (role) => {

            const error = await service.register({ nom: "Jean", email: "j@test.com", password: "pwd", role }).catch((e) => e);

            expect(error).toBeInstanceOf(HttpError);
            expect(error.status).toBe(400);
            expect(error.message).toBe("Rôle invalide. Valeurs possibles : employe, admin");
            expect(repository.findUserByEmail).not.toHaveBeenCalled();
            expect(repository.createUserAvecFiche).not.toHaveBeenCalled();
        });

    });


    describe("login", () => {

        it("met id, email, role et employeId dans le JWT et les renvoie", async () => {

            repository.findUserByEmail.mockResolvedValue({
                id: "u1", email: "j@test.com", password: "hash", role: "EMPLOYE", employeId: "emp-1"
            } as any);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            (jwt.sign as jest.Mock).mockReturnValue("jeton");

            const result = await service.login({ email: "j@test.com", password: "pwd" });

            expect(jwt.sign).toHaveBeenCalledWith(
                { id: "u1", email: "j@test.com", role: "EMPLOYE", employeId: "emp-1" },
                "secret-de-test",
                { expiresIn: "1d" }
            );
            expect(result).toEqual({ token: "jeton", role: "EMPLOYE", employeId: "emp-1" });
        });


        it("refuse un mot de passe incorrect", async () => {

            repository.findUserByEmail.mockResolvedValue({ id: "u1", password: "hash" } as any);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await expect(service.login({ email: "j@test.com", password: "faux" })).rejects.toThrow("mot de passe incorrect");
            expect(jwt.sign).not.toHaveBeenCalled();
        });

    });


    describe("me", () => {

        it("renvoie l'utilisateur sans mot de passe", async () => {

            const user = { id: "u1", nom: "Jean", email: "j@test.com", role: "ADMIN", employeId: null };
            repository.findUserById.mockResolvedValue(user as any);

            await expect(service.me("u1")).resolves.toEqual(user);
        });


        it("renvoie 404 si l'utilisateur n'existe plus", async () => {

            repository.findUserById.mockResolvedValue(null);

            const error = await service.me("u-x").catch((e) => e);

            expect(error).toBeInstanceOf(HttpError);
            expect(error.status).toBe(404);
        });

    });

});
