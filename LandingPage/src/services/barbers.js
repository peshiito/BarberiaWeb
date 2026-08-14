import api from "./api";

let cachedBarbers = null;
let pendingRequest = null;

// GET /api/public/barbers -> [{ id, first_name, last_name, bio, photos: [] }]
// No hay endpoint de detalle individual: se resuelve filtrando esta misma lista.
//
// Cacheada + con dedupe de requests en vuelo a propósito: la Home monta
// BarbersTeaser y GallerySection al mismo tiempo, y ambos consumen esta
// lista — sin esto se disparan dos GET idénticos en simultáneo en cada carga.
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
