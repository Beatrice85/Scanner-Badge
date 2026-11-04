import { Request, Response } from "express";
import { requireRole } from "../role.middleware";

function reponse() {
    const res = {} as Response;
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
}

describe("requireRole", () => {

    it("laisse passer un rôle autorisé", () => {

        const next = jest.fn();
        const req = { user: { id: "u1", role: "ADMIN" } } as unknown as Request;

        requireRole("ADMIN")(req, reponse(), next);

        expect(next).toHaveBeenCalled();
    });


    it("renvoie 403 pour un rôle insuffisant", () => {

        const next = jest.fn();
        const res = reponse();
        const req = { user: { id: "u1", role: "EMPLOYE" } } as unknown as Request;

        requireRole("ADMIN")(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ message: "Accès refusé : rôle insuffisant" });
    });


    it("renvoie 403 pour un ancien token sans rôle", () => {

        const next = jest.fn();
        const res = reponse();
        const req = { user: { id: "u1", email: "a@test.com" } } as unknown as Request;

        requireRole("ADMIN")(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
    });


    it("renvoie 401 sans utilisateur authentifié", () => {

        const next = jest.fn();
        const res = reponse();

        requireRole("ADMIN")({} as Request, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
    });

});
