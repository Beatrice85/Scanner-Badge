import { Prisma } from "@prisma/client";
import { UserService } from "../user.service";
import { UserRepository } from "../user.repository";
import { HttpError } from "../../../errors/http-error";
import { AuthPayload } from "../../../middleware/auth.middleware";

jest.mock("../user.repository");

async function expectHttpError(promise: Promise<unknown>, status: number, message?: string) {
    const error = await promise.then(() => null, (e) => e);
    expect(error).toBeInstanceOf(HttpError);
    expect(error.status).toBe(status);
    if (message) expect(error.message).toBe(message);
}

describe("UserService", () => {

    let service: UserService;
    let repository: jest.Mocked<UserRepository>;

    const compte = { id: "u1", nom: "Jean", email: "j@test.com", role: "EMPLOYE", employeId: null };

    beforeEach(() => {
        jest.clearAllMocks();

        service = new UserService();

        repository = (service as any).repository;
    });


    describe("getAll", () => {

        it("renvoie la liste du repository (sans mot de passe)", async () => {

            repository.findAll.mockResolvedValue([compte] as any);

            await expect(service.getAll()).resolves.toEqual([compte]);
        });

    });


    describe("lierEmploye", () => {

        it("lie un compte à un employé libre", async () => {

            repository.findById.mockResolvedValue(compte as any);
            repository.findEmployeById.mockResolvedValue({ id: "emp-1" } as any);
            repository.findByEmployeId.mockResolvedValue(null);
            repository.lierEmploye.mockResolvedValue({ ...compte, employeId: "emp-1" } as any);

            const result = await service.lierEmploye("u1", "emp-1");

            expect(repository.lierEmploye).toHaveBeenCalledWith("u1", "emp-1");
            expect(result.employeId).toBe("emp-1");
        });


        it("refuse (400) un employeId manquant", async () => {

            await expectHttpError(service.lierEmploye("u1", undefined), 400, "employeId est obligatoire");

            expect(repository.findById).not.toHaveBeenCalled();
        });


        it("renvoie 404 si le compte est introuvable", async () => {

            repository.findById.mockResolvedValue(null);

            await expectHttpError(service.lierEmploye("u-x", "emp-1"), 404, "Utilisateur introuvable");
        });


        it("renvoie 404 si l'employé est introuvable", async () => {

            repository.findById.mockResolvedValue(compte as any);
            repository.findEmployeById.mockResolvedValue(null);

            await expectHttpError(service.lierEmploye("u1", "emp-x"), 404, "Employé introuvable");
        });


        it("renvoie 409 si l'employé est déjà lié à un autre compte", async () => {

            repository.findById.mockResolvedValue(compte as any);
            repository.findEmployeById.mockResolvedValue({ id: "emp-1" } as any);
            repository.findByEmployeId.mockResolvedValue({ id: "u2", employeId: "emp-1" } as any);

            await expectHttpError(service.lierEmploye("u1", "emp-1"), 409);

            expect(repository.lierEmploye).not.toHaveBeenCalled();
        });


        it("ne change rien si l'employé est déjà lié à ce même compte", async () => {

            const dejaLie = { ...compte, employeId: "emp-1" };
            repository.findById.mockResolvedValue(dejaLie as any);
            repository.findEmployeById.mockResolvedValue({ id: "emp-1" } as any);
            repository.findByEmployeId.mockResolvedValue(dejaLie as any);

            await expect(service.lierEmploye("u1", "emp-1")).resolves.toEqual(dejaLie);

            expect(repository.lierEmploye).not.toHaveBeenCalled();
        });


        it("transforme une violation d'unicité concurrente (P2002) en 409", async () => {

            repository.findById.mockResolvedValue(compte as any);
            repository.findEmployeById.mockResolvedValue({ id: "emp-1" } as any);
            repository.findByEmployeId.mockResolvedValue(null);
            repository.lierEmploye.mockRejectedValue(
                new Prisma.PrismaClientKnownRequestError("Unique constraint failed", { code: "P2002", clientVersion: "6.19.3" })
            );

            await expectHttpError(service.lierEmploye("u1", "emp-1"), 409);
        });

    });


    describe("changerRole", () => {

        const admin: AuthPayload = { id: "u-admin", email: "a@test.com", role: "ADMIN", employeId: null };

        // Simule la transaction : appelle `verifier` avec le compte relu et le nombre d'ADMIN
        // verrouillés, puis renvoie le compte mis à jour (sauf si `verifier` lève une erreur).
        function transaction(cible: { id: string; role: "ADMIN" | "EMPLOYE" } | null, nombreAdmins: number) {
            repository.changerRoleEnTransaction.mockImplementation(async (id, role, verifier) => {
                verifier(cible, nombreAdmins);
                return { ...compte, id, role } as any;
            });
        }

        it("promeut un EMPLOYE en ADMIN dans une transaction", async () => {

            repository.findById.mockResolvedValue(compte as any);
            transaction({ id: "u1", role: "EMPLOYE" }, 1);

            const result = await service.changerRole("u1", "ADMIN", admin);

            expect(repository.changerRoleEnTransaction).toHaveBeenCalledWith("u1", "ADMIN", expect.any(Function));
            expect(result.role).toBe("ADMIN");
        });


        it("rétrograde un ADMIN s'il en reste un autre", async () => {

            repository.findById.mockResolvedValue({ ...compte, role: "ADMIN" } as any);
            transaction({ id: "u1", role: "ADMIN" }, 2);

            const result = await service.changerRole("u1", "EMPLOYE", admin);

            expect(result.role).toBe("EMPLOYE");
        });


        it.each([undefined, "", "SUPERADMIN", "admin"])("refuse (400) le rôle %p", async (role) => {

            await expectHttpError(service.changerRole("u1", role as any, admin), 400);

            expect(repository.findById).not.toHaveBeenCalled();
        });


        it("refuse (403) qu'un admin modifie son propre rôle", async () => {

            await expectHttpError(
                service.changerRole("u-admin", "EMPLOYE", admin),
                403,
                "Vous ne pouvez pas modifier votre propre rôle"
            );

            expect(repository.changerRoleEnTransaction).not.toHaveBeenCalled();
        });


        it("renvoie 404 si le compte est introuvable", async () => {

            repository.findById.mockResolvedValue(null);

            await expectHttpError(service.changerRole("u-x", "ADMIN", admin), 404, "Utilisateur introuvable");

            expect(repository.changerRoleEnTransaction).not.toHaveBeenCalled();
        });


        it("renvoie 404 si le compte disparaît avant la transaction", async () => {

            repository.findById.mockResolvedValue(compte as any);
            transaction(null, 1);

            await expectHttpError(service.changerRole("u1", "ADMIN", admin), 404);
        });


        it("refuse (409) de rétrograder le dernier ADMIN (décompte fait dans la transaction)", async () => {

            repository.findById.mockResolvedValue({ ...compte, role: "ADMIN" } as any);
            transaction({ id: "u1", role: "ADMIN" }, 1);

            await expectHttpError(
                service.changerRole("u1", "EMPLOYE", admin),
                409,
                "Impossible de rétrograder le dernier administrateur"
            );
        });


        it("refuse (409) la seconde de deux rétrogradations simultanées", async () => {

            // Avant la transaction, les deux admins voyaient 2 ADMIN. La première rétrogradation
            // est validée ; la seconde, sérialisée par le verrou, ne voit plus qu'un seul ADMIN.
            repository.findById.mockResolvedValue({ ...compte, id: "u2", role: "ADMIN" } as any);
            transaction({ id: "u2", role: "ADMIN" }, 1);

            await expectHttpError(service.changerRole("u2", "EMPLOYE", admin), 409);
        });


        it("ne change rien si le compte a déjà ce rôle", async () => {

            repository.findById.mockResolvedValue(compte as any);

            await expect(service.changerRole("u1", "EMPLOYE", admin)).resolves.toEqual(compte);

            expect(repository.changerRoleEnTransaction).not.toHaveBeenCalled();
        });

    });

});
