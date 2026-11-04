// Erreur métier portant le code HTTP à renvoyer ; le contrôleur répond { message }.
export class HttpError extends Error {

    constructor(public readonly status: number, message: string) {
        super(message);
        this.name = "HttpError";
    }
}
