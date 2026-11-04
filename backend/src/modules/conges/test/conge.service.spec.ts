import { CongeService } from "../conge.service";
import { CongesRepository } from "../conges.repository";
import { AuthPayload } from "../../../middleware/auth.middleware";
import { HttpError } from "../../../errors/http-error";

jest.mock("../conges.repository");

const admin: AuthPayload = { id: "user-admin", email: "admin@test.com", role: "ADMIN", employeId: null };
const employe1: AuthPayload = { id: "user-1", email: "e1@test.com", role: "EMPLOYE", employeId: "emp-1" };
const employe2: AuthPayload = { id: "user-2", email: "e2@test.com", role: "EMPLOYE", employeId: "emp-2" };
const compteSansEmploye: AuthPayload = { id: "user-3", email: "e3@test.com", role: "EMPLOYE", employeId: null };

// Vérifie qu'une promesse échoue avec une HttpError de code et message donnés.
async function expectHttpError(promise: Promise<unknown>, status: number, message?: string) {
    const error = await promise.then(() => null, (e) => e);
    expect(error).toBeInstanceOf(HttpError);
    expect(error.status).toBe(status);
    if (message) expect(error.message).toBe(message);
}

describe("CongeService", () => {

    let service: CongeService;
    let repository: jest.Mocked<CongesRepository>;

    beforeEach(() => {
        jest.clearAllMocks();

        service = new CongeService();

        repository =
            (service as any).repository;
    });


    function congeExistant(statut: "EN_ATTENTE" | "VALIDE" | "REFUSE", employeId = "emp-1") {
        repository.findById.mockResolvedValue({
            id: "conge-1",
            employeId,
            statut,
            dateDebut: new Date("2026-08-10"),
            dateFin: new Date("2026-08-12")
        } as any);
    }


    describe("create", () => {

        it("doit créer un congé valide (ADMIN, pour n'importe quel employé)", async () => {

            const employeId = "emp-1";

            const dateDebut = new Date("2026-08-10");
            const dateFin = new Date("2026-08-12");

            repository.findEmployeById.mockResolvedValue({
                id: employeId
            } as any);

            repository.findOveralapping.mockResolvedValue(null);

            repository.create.mockResolvedValue({
                id: "conge-1",
                employeId,
                dateDebut,
                dateFin,
                statut: "EN_ATTENTE",
                createdAt: new Date()
            } as any);

            const result = await service.create({
                employeId,
                dateDebut,
                dateFin
            }, admin);

            expect(result.id).toBe("conge-1");

            expect(repository.create).toHaveBeenCalledWith({
                employeId,
                dateDebut,
                dateFin,
                motif: null
            });
        });


        it("un EMPLOYE crée toujours pour son propre employeId (celui du corps est ignoré)", async () => {

            repository.findEmployeById.mockResolvedValue({ id: "emp-1" } as any);
            repository.findOveralapping.mockResolvedValue(null);
            repository.create.mockResolvedValue({ id: "conge-1" } as any);

            await service.create({
                employeId: "emp-2",
                dateDebut: new Date("2026-08-10"),
                dateFin: new Date("2026-08-12")
            }, employe1);

            expect(repository.findEmployeById).toHaveBeenCalledWith("emp-1");
            expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({ employeId: "emp-1" }));
        });


        it("doit refuser (403) un compte EMPLOYE non associé à un employé", async () => {

            await expectHttpError(
                service.create({ dateDebut: new Date("2026-08-10"), dateFin: new Date("2026-08-12") }, compteSansEmploye),
                403
            );

            expect(repository.create).not.toHaveBeenCalled();
        });


        it("doit refuser (400) un ADMIN qui ne précise pas d'employeId", async () => {

            await expectHttpError(
                service.create({ dateDebut: new Date("2026-08-10"), dateFin: new Date("2026-08-12") }, admin),
                400,
                "employeId est obligatoire"
            );
        });


        it("doit refuser si l'employé n'existe pas", async () => {

            repository.findEmployeById.mockResolvedValue(null);

            await expectHttpError(
                service.create({
                    employeId: "emp-inexistant",
                    dateDebut: new Date("2026-08-10"),
                    dateFin: new Date("2026-08-12")
                }, admin),
                404,
                "Employé introuvable"
            );

            expect(repository.create).not.toHaveBeenCalled();
        });


        it("doit refuser si la date de début est après la date de fin", async () => {

            repository.findEmployeById.mockResolvedValue({
                id: "emp-1"
            } as any);

            await expect(
                service.create({
                    employeId: "emp-1",
                    dateDebut: new Date("2026-08-15"),
                    dateFin: new Date("2026-08-10")
                }, admin)
            ).rejects.toThrow(
                "La date de début doit être antérieure ou égale à la date de fin"
            );

            expect(repository.create).not.toHaveBeenCalled();
        });


        it("doit refuser un congé qui chevauche un autre congé", async () => {

            repository.findEmployeById.mockResolvedValue({
                id: "emp-1"
            } as any);

            repository.findOveralapping.mockResolvedValue({
                id: "conge-existant"
            } as any);

            await expect(
                service.create({
                    employeId: "emp-1",
                    dateDebut: new Date("2026-08-10"),
                    dateFin: new Date("2026-08-12")
                }, admin)
            ).rejects.toThrow(
                "Un congé existe déjà sur cette période"
            );

            expect(repository.create).not.toHaveBeenCalled();
        });


        it("doit accepter un congé si aucun congé actif (EN_ATTENTE/VALIDE) ne chevauche", async () => {

            // Le repository ne renvoie pas les congés REFUSE : sans chevauchement actif, la création passe.
            repository.findEmployeById.mockResolvedValue({ id: "emp-1" } as any);
            repository.findOveralapping.mockResolvedValue(null);
            repository.create.mockResolvedValue({ id: "conge-2" } as any);

            await service.create({ dateDebut: new Date("2026-08-10"), dateFin: new Date("2026-08-12") }, employe1);

            expect(repository.findOveralapping).toHaveBeenCalledWith("emp-1", new Date("2026-08-10"), new Date("2026-08-12"));
            expect(repository.create).toHaveBeenCalled();
        });

    });


    describe("getAll", () => {

        it("doit filtrer par statut", async () => {

            repository.findall.mockResolvedValue([]);

            await service.getAll("EN_ATTENTE");

            expect(repository.findall).toHaveBeenCalledWith("EN_ATTENTE");
        });


        it("doit refuser (400) un statut inconnu", async () => {

            await expectHttpError(service.getAll("ANNULE"), 400);

            expect(repository.findall).not.toHaveBeenCalled();
        });

    });


    describe("lecture par employé", () => {

        it("getMine renvoie les congés de l'employé du token", async () => {

            repository.findByEmployeId.mockResolvedValue([]);

            await service.getMine(employe1);

            expect(repository.findByEmployeId).toHaveBeenCalledWith("emp-1");
        });


        it("getByEmployeId : un EMPLOYE ne voit pas les congés d'un autre (403)", async () => {

            await expectHttpError(service.getByEmployeId("emp-1", employe2), 403);

            expect(repository.findByEmployeId).not.toHaveBeenCalled();
        });


        it("getByEmployeId : ADMIN et employé concerné autorisés", async () => {

            repository.findByEmployeId.mockResolvedValue([]);

            await service.getByEmployeId("emp-1", admin);
            await service.getByEmployeId("emp-1", employe1);

            expect(repository.findByEmployeId).toHaveBeenCalledTimes(2);
        });


        it("getByIdPourActeur : 403 pour le congé d'un autre employé", async () => {

            congeExistant("EN_ATTENTE", "emp-1");

            await expectHttpError(service.getByIdPourActeur("conge-1", employe2), 403);
        });

    });


    describe("getById", () => {

        it("doit retourner un congé existant", async () => {

            repository.findById.mockResolvedValue({
                id: "conge-1",
                employeId: "emp-1"
            } as any);

            const result = await service.getById("conge-1");

            expect(result.id).toBe("conge-1");

            expect(repository.findById)
                .toHaveBeenCalledWith("conge-1");
        });


        it("doit lever une erreur 404 si le congé n'existe pas", async () => {

            repository.findById.mockResolvedValue(null);

            await expectHttpError(service.getById("conge-inexistant"), 404, "conge Introuvabe");
        });

    });


    describe("motif (facultatif)", () => {

        beforeEach(() => {
            repository.findEmployeById.mockResolvedValue({ id: "emp-1" } as any);
            repository.findOveralapping.mockResolvedValue(null);
            repository.create.mockResolvedValue({ id: "conge-1" } as any);
            repository.update.mockResolvedValue({ id: "conge-1" } as any);
        });

        const dates = { dateDebut: new Date("2026-08-10"), dateFin: new Date("2026-08-12") };

        it("enregistre le motif nettoyé à la création", async () => {

            await service.create({ ...dates, motif: "  Mariage de ma sœur  " }, employe1);

            expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({ motif: "Mariage de ma sœur" }));
        });


        it.each([undefined, null, "", "   "])("enregistre null pour un motif %p", async (motif) => {

            await service.create({ ...dates, motif }, employe1);

            expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({ motif: null }));
        });


        it("refuse (400) un motif qui n'est pas du texte", async () => {

            await expectHttpError(service.create({ ...dates, motif: 42 }, employe1), 400, "Le motif doit être un texte");

            expect(repository.findEmployeById).not.toHaveBeenCalled();
        });


        it("refuse (400) un motif de plus de 500 caractères", async () => {

            await expectHttpError(
                service.create({ ...dates, motif: "x".repeat(501) }, employe1),
                400,
                "Le motif ne doit pas dépasser 500 caractères"
            );
            expect(repository.create).not.toHaveBeenCalled();
        });


        it("modification : motif absent -> inchangé (non transmis)", async () => {

            congeExistant("EN_ATTENTE");

            await service.update("conge-1", { dateFin: new Date("2026-08-13") }, employe1);

            expect(repository.update).toHaveBeenCalledWith("conge-1", { dateFin: new Date("2026-08-13") });
        });


        it("modification : motif vide -> effacé (null)", async () => {

            congeExistant("EN_ATTENTE");

            await service.update("conge-1", { motif: "" }, employe1);

            expect(repository.update).toHaveBeenCalledWith("conge-1", { motif: null });
        });


        it("modification du motif d'un congé déjà VALIDE par l'employé : 409", async () => {

            congeExistant("VALIDE");

            await expectHttpError(service.update("conge-1", { motif: "autre" }, employe1), 409);

            expect(repository.update).not.toHaveBeenCalled();
        });

    });


    describe("update", () => {

        it("l'EMPLOYE propriétaire peut modifier un congé EN_ATTENTE", async () => {

            congeExistant("EN_ATTENTE");
            repository.findOveralapping.mockResolvedValue(null);
            repository.update.mockResolvedValue({ id: "conge-1" } as any);

            await service.update("conge-1", { dateFin: new Date("2026-08-13") }, employe1);

            expect(repository.findOveralapping).toHaveBeenCalledWith("emp-1", new Date("2026-08-10"), new Date("2026-08-13"), "conge-1");
            expect(repository.update).toHaveBeenCalledWith("conge-1", { dateFin: new Date("2026-08-13") });
        });


        it("un EMPLOYE ne peut pas modifier le congé d'un autre (403)", async () => {

            congeExistant("EN_ATTENTE", "emp-1");

            await expectHttpError(service.update("conge-1", { dateFin: new Date("2026-08-13") }, employe2), 403);

            expect(repository.update).not.toHaveBeenCalled();
        });


        it("un EMPLOYE ne peut pas modifier un congé déjà VALIDE (409)", async () => {

            congeExistant("VALIDE");

            await expectHttpError(service.update("conge-1", { dateFin: new Date("2026-08-13") }, employe1), 409);

            expect(repository.update).not.toHaveBeenCalled();
        });


        it("un ADMIN peut modifier un congé quel que soit son statut", async () => {

            congeExistant("VALIDE");
            repository.findOveralapping.mockResolvedValue(null);
            repository.update.mockResolvedValue({ id: "conge-1" } as any);

            await service.update("conge-1", { dateFin: new Date("2026-08-13") }, admin);

            expect(repository.update).toHaveBeenCalled();
        });

    });


    describe("delete", () => {

        it("doit supprimer un congé existant (ADMIN)", async () => {

            repository.findById.mockResolvedValue({
                id: "conge-1",
                employeId: "emp-1",
                statut: "VALIDE"
            } as any);

            repository.delete.mockResolvedValue({
                id: "conge-1"
            } as any);

            await service.delete("conge-1", admin);

            expect(repository.delete)
                .toHaveBeenCalledWith("conge-1");
        });


        it("l'EMPLOYE propriétaire peut supprimer un congé EN_ATTENTE", async () => {

            congeExistant("EN_ATTENTE");
            repository.delete.mockResolvedValue({ id: "conge-1" } as any);

            await service.delete("conge-1", employe1);

            expect(repository.delete).toHaveBeenCalledWith("conge-1");
        });


        it("un EMPLOYE ne peut pas supprimer un congé REFUSE (409)", async () => {

            congeExistant("REFUSE");

            await expectHttpError(service.delete("conge-1", employe1), 409);

            expect(repository.delete).not.toHaveBeenCalled();
        });

    });


    describe("valider / refuser", () => {

        it("valider : EN_ATTENTE -> VALIDE avec traiteParId et traiteLe", async () => {

            congeExistant("EN_ATTENTE");
            repository.updateStatut.mockResolvedValue({ id: "conge-1", statut: "VALIDE" } as any);

            await service.valider("conge-1", admin);

            expect(repository.updateStatut).toHaveBeenCalledWith("conge-1", {
                statut: "VALIDE",
                traiteParId: "user-admin",
                traiteLe: expect.any(Date),
                motifRefus: null
            });
        });


        it("valider un congé REFUSE est impossible (409)", async () => {

            congeExistant("REFUSE");

            await expectHttpError(service.valider("conge-1", admin), 409, "Transition impossible : le congé est déjà refusé");

            expect(repository.updateStatut).not.toHaveBeenCalled();
        });


        it("valider un congé déjà VALIDE est impossible (409)", async () => {

            congeExistant("VALIDE");

            await expectHttpError(service.valider("conge-1", admin), 409);
        });


        it("valider un congé introuvable renvoie 404", async () => {

            repository.findById.mockResolvedValue(null);

            await expectHttpError(service.valider("conge-x", admin), 404);
        });


        it("refuser : EN_ATTENTE -> REFUSE avec motif", async () => {

            congeExistant("EN_ATTENTE");
            repository.updateStatut.mockResolvedValue({ id: "conge-1", statut: "REFUSE" } as any);

            await service.refuser("conge-1", "  Période chargée  ", admin);

            expect(repository.updateStatut).toHaveBeenCalledWith("conge-1", {
                statut: "REFUSE",
                traiteParId: "user-admin",
                traiteLe: expect.any(Date),
                motifRefus: "Période chargée"
            });
        });


        it("refuser sans motif est rejeté (400)", async () => {

            await expectHttpError(service.refuser("conge-1", "   ", admin), 400, "Le motif de refus est obligatoire");

            expect(repository.updateStatut).not.toHaveBeenCalled();
        });


        it("refuser un congé VALIDE est impossible (409)", async () => {

            congeExistant("VALIDE");

            await expectHttpError(service.refuser("conge-1", "trop tard", admin), 409);
        });

    });

});
