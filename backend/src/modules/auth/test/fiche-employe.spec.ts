import { decouperNomComplet, normaliserEmail, trouverOuCreerFiche, MESSAGE_FICHE_DEJA_LIEE } from "../fiche-employe";
import { HttpError } from "../../../errors/http-error";

// Client de transaction simulé (injecté, comme les repositories du module paie).
function clientTx(fiches: { libre?: any; prise?: any } = {}) {
    return {
        employe: {
            findFirst: jest.fn(async ({ where }: any) => (where.user ? fiches.libre ?? null : fiches.prise ?? null)),
            create: jest.fn(async () => ({ id: "emp-nouvelle" }))
        }
    };
}

describe("fiche-employe", () => {

    describe("decouperNomComplet", () => {

        it.each([
            ["Jean Dupont", { prenom: "Jean", nom: "Dupont" }],
            ["Jean Pierre Dupont", { prenom: "Jean", nom: "Pierre Dupont" }],
            ["  Jean   Dupont  ", { prenom: "Jean", nom: "Dupont" }],
            ["Rakoto", { prenom: "", nom: "Rakoto" }],
            ["", { prenom: "", nom: "" }],
        ])("%p", (entree, attendu) => {
            expect(decouperNomComplet(entree)).toEqual(attendu);
        });

    });


    it("normalise l'email (espaces, casse)", () => {
        expect(normaliserEmail("  Jean.Dupont@Test.COM ")).toBe("jean.dupont@test.com");
    });


    describe("trouverOuCreerFiche", () => {

        it("réutilise une fiche libre de même email, sans casse et sans créer de doublon", async () => {

            const tx = clientTx({ libre: { id: "emp-existante", nom: "Dupont", prenom: "Jean" } });

            const resultat = await trouverOuCreerFiche(tx as any, { nom: "Jean Dupont", email: "Jean.Dupont@Test.com" });

            expect(resultat).toEqual({ action: "liee", employeId: "emp-existante" });
            expect(tx.employe.findFirst).toHaveBeenCalledWith(expect.objectContaining({
                where: {
                    email: { equals: "jean.dupont@test.com", mode: "insensitive" },
                    user: { is: null }
                }
            }));
            expect(tx.employe.create).not.toHaveBeenCalled();
        });


        it("crée une fiche (nom découpé, email en minuscules, sans chantier, 0/0) si aucune ne correspond", async () => {

            const tx = clientTx();

            const resultat = await trouverOuCreerFiche(tx as any, { nom: "Jean Pierre Dupont", email: "Jean@Test.com" });

            expect(resultat).toEqual({ action: "creee", employeId: "emp-nouvelle" });
            expect(tx.employe.create).toHaveBeenCalledWith({
                data: {
                    nom: "Pierre Dupont",
                    prenom: "Jean",
                    email: "jean@test.com",
                    tauxHoraire: 0,
                    volumeMensuelObligatoire: 0,
                    chantierId: null
                },
                select: { id: true }
            });
        });


        it("refuse (409) si la seule fiche de même email est déjà liée à un autre compte", async () => {

            const tx = clientTx({ prise: { id: "emp-prise" } });

            const error = await trouverOuCreerFiche(tx as any, { nom: "Jean Dupont", email: "jean@test.com" }).catch((e) => e);

            expect(error).toBeInstanceOf(HttpError);
            expect(error.status).toBe(409);
            expect(error.message).toBe(MESSAGE_FICHE_DEJA_LIEE);
            expect(tx.employe.create).not.toHaveBeenCalled();
        });

    });

});
