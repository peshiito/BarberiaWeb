import api from "./api";

let cachedBarbers = null;
let pendingRequest = null;

// GET /api/public/barbers -> [{ id, first_name, last_name, bio, photos: [] }]
// Cacheada + dedupe de requests en vuelo: varias secciones de Home consumen
// esta misma lista en simultáneo.
export async function fetchPublicBarbers() {
    if (cachedBarbers) return cachedBarbers;
    if (!pendingRequest) {
        pendingRequest = api
            .get("/public/barbers")
            .then(({ data }) => {
                cachedBarbers = data;
                return data;
            })
            .finally(() => {
                pendingRequest = null;
            });
    }
    return pendingRequest;
}
