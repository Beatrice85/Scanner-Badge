import { cheminDepuisUrl, detecterFormatImage } from "../photos-profil";

describe("photos-profil", () => {

    describe("detecterFormatImage (signature du fichier)", () => {

        it("reconnaît un JPEG", () => {
            expect(detecterFormatImage(Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00]))).toEqual({ mime: "image/jpeg", extension: "jpg" });
        });

        it("reconnaît un PNG", () => {
            expect(detecterFormatImage(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]))).toEqual({ mime: "image/png", extension: "png" });
        });

        it("reconnaît un WebP", () => {
            const webp = Buffer.concat([Buffer.from("RIFF"), Buffer.from([0, 0, 0, 0]), Buffer.from("WEBPVP8 ")]);
            expect(detecterFormatImage(webp)).toEqual({ mime: "image/webp", extension: "webp" });
        });

        it.each([
            ["GIF", Buffer.from("GIF89a……")],
            ["texte renommé en .jpg", Buffer.from("ceci n'est pas une image")],
            ["fichier vide", Buffer.alloc(0)],
        ])("refuse : %s", (_nom, octets) => {
            expect(detecterFormatImage(octets)).toBeNull();
        });

    });


    describe("cheminDepuisUrl", () => {

        beforeEach(() => { process.env.SUPABASE_BUCKET = "Scanner_Badge"; });

        it("extrait le chemin d'une photo du bucket", () => {
            const url = "https://ref.supabase.co/storage/v1/object/public/Scanner_Badge/photos-profil/u1/1700000000000.jpg";
            expect(cheminDepuisUrl(url)).toBe("photos-profil/u1/1700000000000.jpg");
        });

        it("ignore une URL étrangère au bucket ou hors du dossier des photos", () => {
            expect(cheminDepuisUrl("https://exemple.com/photo.jpg")).toBeNull();
            expect(cheminDepuisUrl("https://ref.supabase.co/storage/v1/object/public/Scanner_Badge/autre/fichier.jpg")).toBeNull();
        });

    });

});
