import { HttpError } from "../../../errors/http-error";

// Base en mémoire avec transactions : les écritures faites via `tx` ne sont conservées
// (commit) que si le callback de $transaction réussit ; sinon elles sont annulées (rollback).
const base = { users: [] as any[], employes: [] as any[] };
const echecs = { creationFiche: false };

function clientTransaction(brouillon: typeof base) {
    let compteur = 0;
    return {
        user: {
            create: jest.fn(async ({ data }: any) => {
                const user = { id: `u-${++compteur}`, employeId: null, ...data };
                brouillon.users.push(user);
                return user;
            }),
            update: jest.fn(async ({ where, data }: any) => {
                const user = brouillon.users.find((u) => u.id === where.id);
                Object.assign(user, data);
                return { ...user };
            }),
            findUnique: jest.fn(async ({ where }: any) => brouillon.users.find((u) => u.id === where.id) ?? null)
        },
        employe: {
            findFirst: jest.fn(async ({ where }: any) => {
                const email = where.email.equals.toLowerCase();
                const memeEmail = brouillon.employes.filter((e) => e.email?.toLowerCase() === email);
                const libres = memeEmail.filter((e) => !brouillon.users.some((u) => u.employeId === e.id));
                return (where.user ? libres[0] : memeEmail[0]) ?? null;
            }),
            create: jest.fn(async ({ data }: any) => {
                if (echecs.creationFiche) throw new Error("échec simulé de création de fiche");
                const fiche = { id: `emp-${++compteur}`, ...data };
                brouillon.employes.push(fiche);
                return { id: fiche.id };
            })
        }
    };
}

let dernierTx: ReturnType<typeof clientTransaction>;

jest.mock("../../../database/prisma.service", () => ({
    prisma: {
        $transaction: jest.fn(async (callback: (tx: any) => Promise<unknown>) => {
            const brouillon = structuredClone(base);
            dernierTx = clientTransaction(brouillon);
            const resultat = await callback(dernierTx); // une erreur ici = rollback (base inchangée)
            base.users = brouillon.users;
            base.employes = brouillon.employes;
            return resultat;
        })
    }
}));

import { AuthRepository } from "../auth.repository";

describe("AuthRepository.createUserAvecFiche (transaction)", () => {

    const repository = new AuthRepository();

    beforeEach(() => {
        base.users = [];
        base.employes = [];
        echecs.creationFiche = false;
    });

    const compte = (role: "EMPLOYE" | "ADMIN", email = "jean@test.com") =>
        ({ nom: "Jean Dupont", email, password: "hash", role });


    it("EMPLOYE : lie la fiche libre existante de même email (sans casse), sans doublon", async () => {

        base.employes.push({ id: "emp-existante", nom: "Dupont", prenom: "Jean", email: "Jean@Test.com" });

        const { user, liaison } = await repository.createUserAvecFiche(compte("EMPLOYE"));

        expect(liaison).toEqual({ action: "liee", employeId: "emp-existante" });
        expect(user.employeId).toBe("emp-existante");
        expect(base.employes).toHaveLength(1);
        expect(base.users).toHaveLength(1);
    });


    it("EMPLOYE : crée une nouvelle fiche et la lie au compte si aucune ne correspond", async () => {

        const { user, liaison } = await repository.createUserAvecFiche(compte("EMPLOYE"));

        expect(liaison?.action).toBe("creee");
        expect(base.employes).toHaveLength(1);
        expect(base.employes[0]).toMatchObject({ nom: "Dupont", prenom: "Jean", email: "jean@test.com", chantierId: null });
        expect(user.employeId).toBe(base.employes[0].id);
    });


    it("annule tout (pas de compte) si la création de la fiche échoue", async () => {

        echecs.creationFiche = true;

        await expect(repository.createUserAvecFiche(compte("EMPLOYE"))).rejects.toThrow("échec simulé de création de fiche");

        // Le compte avait été créé dans la transaction avant l'échec : il est annulé avec elle.
        expect(dernierTx.user.create).toHaveBeenCalled();
        expect(base.users).toHaveLength(0);
        expect(base.employes).toHaveLength(0);
    });


    it("annule tout (409, pas de compte) si la fiche de même email est déjà liée à un autre compte", async () => {

        base.employes.push({ id: "emp-prise", nom: "Dupont", prenom: "Jean", email: "jean@test.com" });
        base.users.push({ id: "u-autre", email: "autre@test.com", role: "EMPLOYE", employeId: "emp-prise" });

        const error = await repository.createUserAvecFiche(compte("EMPLOYE")).catch((e) => e);

        expect(error).toBeInstanceOf(HttpError);
        expect(error.status).toBe(409);
        expect(base.users).toHaveLength(1);
        expect(base.employes).toHaveLength(1);
    });


    it("ADMIN : crée le compte sans aucune fiche employé", async () => {

        base.employes.push({ id: "emp-existante", nom: "Dupont", prenom: "Jean", email: "jean@test.com" });

        const { user, liaison } = await repository.createUserAvecFiche(compte("ADMIN"));

        expect(liaison).toBeNull();
        expect(user.employeId).toBeNull();
        expect(dernierTx.employe.findFirst).not.toHaveBeenCalled();
        expect(dernierTx.employe.create).not.toHaveBeenCalled();
        expect(base.employes).toHaveLength(1);
    });


    describe("lierCompteExistant (script link-employes)", () => {

        it("lie un compte EMPLOYE sans fiche, puis ne fait plus rien (idempotent)", async () => {

            base.users.push({ id: "u-1", nom: "Jean Dupont", email: "jean@test.com", role: "EMPLOYE", employeId: null });

            const premier = await repository.lierCompteExistant("u-1");
            const second = await repository.lierCompteExistant("u-1");

            expect(premier?.action).toBe("creee");
            expect(second).toBeNull();
            expect(base.employes).toHaveLength(1);
            expect(base.users[0].employeId).toBe(base.employes[0].id);
        });


        it("ignore un compte ADMIN", async () => {

            base.users.push({ id: "u-1", nom: "Ana", email: "ana@test.com", role: "ADMIN", employeId: null });

            await expect(repository.lierCompteExistant("u-1")).resolves.toBeNull();
            expect(base.employes).toHaveLength(0);
        });

    });

});
