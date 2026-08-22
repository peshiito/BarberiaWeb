import api from "./api";

let cachedServices = null;
let pendingRequest = null;

// GET /api/public/services -> [{ id, name, description, price, duration_minutes }]
// Cacheada + dedupe de requests en vuelo, mismo patrón que fetchPublicBarbers.
export async function fetchPublicServices() {
    if (cachedServices) return cachedServices;
    if (!pendingRequest) {
        pendingRequest = api
            .get("/public/services")
            .then(({ data }) => {
                cachedServices = data;
                return data;
            })
            .finally(() => {
                pendingRequest = null;
            });
    }
    return pendingRequest;
}
