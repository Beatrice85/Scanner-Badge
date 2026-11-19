import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { HttpError } from "../errors/http-error";

// Stockage des photos de profil dans Supabase Storage.
// Seul le backend détient la clé secrète (SUPABASE_SECRET_KEY) : elle ne doit jamais
// être exposée au frontend. Le bucket est public en lecture (URL d'affichage directe).
//   SUPABASE_URL         ex. https://<ref>.supabase.co
//   SUPABASE_SECRET_KEY  clé secrète / service_role du projet
//   SUPABASE_BUCKET      nom du bucket (défaut : Scanner_Badge)

export const DOSSIER_PHOTOS = "photos-profil";

export type FormatImage = { mime: "image/jpeg" | "image/png" | "image/webp"; extension: "jpg" | "png" | "webp" };

let client: SupabaseClient | null = null;

function bucket(): string {
    return process.env.SUPABASE_BUCKET?.trim() || "Scanner_Badge";
}

function supabase(): SupabaseClient {
    if (client) return client;
    const url = process.env.SUPABASE_URL?.trim();
    const cle = process.env.SUPABASE_SECRET_KEY?.trim();
    if (!url || !cle) {
        throw new HttpError(503, "Le stockage des photos n'est pas configuré sur le serveur");
    }
    client = createClient(url, cle, { auth: { persistSession: false, autoRefreshToken: false } });
    return client;
}

// Format réel de l'image, d'après ses premiers octets (signature), et non d'après le nom
// ou le type annoncé par le navigateur (falsifiables).
export function detecterFormatImage(octets: Buffer): FormatImage | null {
    if (octets.length >= 3 && octets[0] === 0xff && octets[1] === 0xd8 && octets[2] === 0xff) {
        return { mime: "image/jpeg", extension: "jpg" };
    }
    if (octets.length >= 8 && octets.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
        return { mime: "image/png", extension: "png" };
    }
    if (octets.length >= 12 && octets.toString("ascii", 0, 4) === "RIFF" && octets.toString("ascii", 8, 12) === "WEBP") {
        return { mime: "image/webp", extension: "webp" };
    }
    return null;
}

// Envoie la photo et renvoie son URL publique. Nom de fichier unique (horodaté) : un
// remplacement change d'URL, ce qui évite d'afficher une ancienne version en cache.
export async function televerserPhoto(utilisateurId: string, octets: Buffer, format: FormatImage): Promise<string> {
    const chemin = `${DOSSIER_PHOTOS}/${utilisateurId}/${Date.now()}.${format.extension}`;
    const { error } = await supabase().storage.from(bucket()).upload(chemin, octets, {
        contentType: format.mime,
        cacheControl: "31536000",
        upsert: false,
    });
    if (error) {
        throw new HttpError(502, `Envoi de la photo impossible : ${error.message}`);
    }
    return supabase().storage.from(bucket()).getPublicUrl(chemin).data.publicUrl;
}

// Chemin de l'objet dans le bucket à partir de son URL publique (null si l'URL n'est pas la nôtre).
export function cheminDepuisUrl(url: string): string | null {
    const marqueur = `/storage/v1/object/public/${bucket()}/`;
    const index = url.indexOf(marqueur);
    if (index === -1) return null;
    const chemin = decodeURIComponent(url.slice(index + marqueur.length).split("?")[0]);
    return chemin.startsWith(`${DOSSIER_PHOTOS}/`) ? chemin : null;
}

// Supprime une ancienne photo. Sans effet si l'URL n'appartient pas au bucket.
export async function supprimerPhotoStockee(url: string): Promise<void> {
    const chemin = cheminDepuisUrl(url);
    if (!chemin) return;
    const { error } = await supabase().storage.from(bucket()).remove([chemin]);
    if (error) {
        throw new HttpError(502, `Suppression de la photo impossible : ${error.message}`);
    }
}
