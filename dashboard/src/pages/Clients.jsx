import { useCallback, useEffect, useState } from "react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import FormField from "../components/ui/FormField";
import InlineFeedback from "../components/ui/InlineFeedback";
import PageHeader from "../components/ui/PageHeader";
import Skeleton from "../components/ui/Skeleton";
import ClientFormModal from "../components/clients/ClientFormModal";
import ClientHistoryModal from "../components/clients/ClientHistoryModal";
import AppointmentFormModal from "../components/schedule/AppointmentFormModal";
import { getClients, searchClients } from "../services/clients";
import "./Clients.css";

const PAGE_SIZE = 10;

const formatDate = isoString =>
    new Date(isoString).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });

const Clients = () => {
    const [searchInput, setSearchInput] = useState("");
    const [query, setQuery] = useState("");
    const [page, setPage] = useState(1);
    const [clients, setClients] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [formModalOpen, setFormModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState(null);
    const [historyClientId, setHistoryClientId] = useState(null);
    const [appointmentClient, setAppointmentClient] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const result = query ? await searchClients(query, page, PAGE_SIZE) : await getClients(page, PAGE_SIZE);
            setClients(result.data);
            setPagination(result.pagination);
        } catch {
            setError("No se pudieron cargar los clientes.");
        } finally {
            setLoading(false);
        }
    }, [query, page]);

    useEffect(() => {
        load();
    }, [load]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setPage(1);
            setQuery(searchInput.trim());
        }, 350);
        return () => clearTimeout(timeout);
    }, [searchInput]);

    const openCreate = () => {
        setEditingClient(null);
        setFormModalOpen(true);
    };

    const openEdit = client => {
        setEditingClient(client);
        setFormModalOpen(true);
    };

    const handleSaved = () => {
        setFormModalOpen(false);
        load();
    };

    return (
        <div>
            <PageHeader
                eyebrow="Clientes"
                title="Clientes"
                description="Buscá, creá y administrá los clientes de la barbería."
                action={
                    <Button variant="primary" onClick={openCreate}>
                        Nuevo cliente
                    </Button>
                }
            />

            <Card className="clients-search-card is-elevated">
                <FormField label="Buscar" hint="Por nombre, apellido o teléfono">
                    <input
                        type="search"
                        value={searchInput}
                        onChange={e => setSearchInput(e.target.value)}
                        placeholder="Ej: Carlos, Gomez, 1122334455"
                    />
                </FormField>
            </Card>

            {error && <InlineFeedback tone="error">{error}</InlineFeedback>}

            <Card className="clients-table-card">
                {loading ? (
                    <div className="clients-table-skeleton">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Skeleton key={i} height="52px" />
                        ))}
                    </div>
                ) : clients.length === 0 ? (
                    <div className="state-box">
                        <span className="state-box-title">
                            {query ? "Sin resultados" : "Todavía no hay clientes registrados"}
                        </span>
                        <p className="state-box-text">
                            {query ? "Probá con otro nombre, apellido o teléfono." : "Creá el primero con el botón de arriba."}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="clients-table-wrapper scroll-shadow-x">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th className="table-sticky-col">Nombre</th>
                                        <th>Teléfono</th>
                                        <th>Alta</th>
                                        <th className="is-numeric">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {clients.map(client => (
                                        <tr key={client.id}>
                                            <td className="table-sticky-col">
                                                <span className="clients-table-name">
                                                    {client.first_name} {client.last_name}
                                                </span>
                                            </td>
                                            <td className="clients-table-phone">{client.phone}</td>
                                            <td>{formatDate(client.created_at)}</td>
                                            <td className="is-numeric">
                                                <div className="clients-table-actions">
                                                    <Button variant="ghost" size="sm" onClick={() => openEdit(client)}>
                                                        Editar
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setHistoryClientId(client.id)}
                                                    >
                                                        Historial
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setAppointmentClient(client)}
                                                    >
                                                        Nuevo turno
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {pagination && pagination.totalPages > 1 && (
                            <div className="clients-pagination">
                                <span className="clients-pagination-label">
                                    Página {pagination.page} de {pagination.totalPages} · {pagination.total} clientes
                                </span>
                                <div className="clients-pagination-actions">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        disabled={page <= 1}
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                    >
                                        Anterior
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        disabled={page >= pagination.totalPages}
                                        onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                                    >
                                        Siguiente
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </Card>

            <ClientFormModal
                open={formModalOpen}
                client={editingClient}
                onClose={() => setFormModalOpen(false)}
                onSaved={handleSaved}
            />

            <ClientHistoryModal clientId={historyClientId} onClose={() => setHistoryClientId(null)} />

            <AppointmentFormModal
                open={Boolean(appointmentClient)}
                mode="create"
                initialClient={appointmentClient}
                onClose={() => setAppointmentClient(null)}
                onSaved={() => setAppointmentClient(null)}
            />
        </div>
    );
};

export default Clients;
