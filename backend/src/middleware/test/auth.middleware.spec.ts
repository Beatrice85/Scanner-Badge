import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { creerAuthMiddleware } from "../auth.middleware";

const SECRET = "secret-de-test";

function reponse() {
    const res = {} as Response;
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
}

function requete(token?: string) {
    return { headers: token ? { authorization: `Bearer ${token}` } : {} } as unknown as Request;
}

describe("authMiddleware", () => {

    const repository = { findUserById: jest.fn() };
    const middleware = creerAuthMiddleware(repository as any);

    beforeEach(() => {
        jest.clearAllMocks();
        process.env.JWT_SECRET = SECRET;
    });


    it("utilise le rôle et l'employeId lus en base, pas ceux du token", async () => {

        // Token émis quand le compte était ADMIN sans employé ; en base il est désormais EMPLOYE lié à emp-1.
        const token = jwt.sign({ id: "u1", email: "j@test.com", role: "ADMIN", employeId: null }, SECRET);
        repository.findUserById.mockResolvedValue({ id: "u1", nom: "Jean", email: "j@test.com", role: "EMPLOYE", employeId: "emp-1" });

        const req = requete(token);
        const next = jest.fn();

        await middleware(req, reponse(), next);

        expect(repository.findUserById).toHaveBeenCalledWith("u1");
        expect((req as any).user).toEqual({ id: "u1", email: "j@test.com", role: "EMPLOYE", employeId: "emp-1" });
        expect(next).toHaveBeenCalled();
    });


    it("accepte un ancien token sans rôle : le rôle vient de la base", async () => {

        const token = jwt.sign({ id: "u1", email: "j@test.com" }, SECRET);
        repository.findUserById.mockResolvedValue({ id: "u1", nom: "Jean", email: "j@test.com", role: "ADMIN", employeId: null });

        const req = requete(token);
        const next = jest.fn();

        await middleware(req, reponse(), next);

        expect((req as any).user.role).toBe("ADMIN");
        expect(next).toHaveBeenCalled();
    });


    it("renvoie 401 si le compte n'existe plus", async () => {

        const token = jwt.sign({ id: "u-supprime", email: "x@test.com", role: "ADMIN", employeId: null }, SECRET);
        repository.findUserById.mockResolvedValue(null);

        const res = reponse();
        const next = jest.fn();

        await middleware(requete(token), res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: "compte introuvable" });
        expect(next).not.toHaveBeenCalled();
    });


    it("renvoie 401 sans token, sans lire la base", async () => {

        const res = reponse();

        await middleware(requete(), res, jest.fn());

        expect(res.status).toHaveBeenCalledWith(401);
        expect(repository.findUserById).not.toHaveBeenCalled();
    });


    it("renvoie 401 pour un token signé avec un autre secret", async () => {

        const res = reponse();

        await middleware(requete(jwt.sign({ id: "u1" }, "autre-secret")), res, jest.fn());

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: "token invalide" });
        expect(repository.findUserById).not.toHaveBeenCalled();
    });


    it("renvoie 401 pour un token expiré", async () => {

        const token = jwt.sign({ id: "u1", exp: Math.floor(Date.now() / 1000) - 60 }, SECRET);
        const res = reponse();

        await middleware(requete(token), res, jest.fn());

        expect(res.json).toHaveBeenCalledWith({ message: "token expiré" });
    });


    it("renvoie 500 si la base est indisponible", async () => {

        const token = jwt.sign({ id: "u1", email: "j@test.com" }, SECRET);
        repository.findUserById.mockRejectedValue(new Error("connexion perdue"));
        jest.spyOn(console, "error").mockImplementation(() => {});

        const res = reponse();
        const next = jest.fn();

        await middleware(requete(token), res, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(next).not.toHaveBeenCalled();
    });

});
