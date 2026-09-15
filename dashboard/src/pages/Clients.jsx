import { useCallback, useEffect, useState } from "react";
import ClientFormModal from "../components/clients/ClientFormModal";
import ClientHistoryModal from "../components/clients/ClientHistoryModal";
import Button from "../components/ui/Button";
import Icon from "../components/ui/Icon";
import InlineFeedback from "../components/ui/InlineFeedback";
import PageHeader from "../components/ui/PageHeader";
import Skeleton from "../components/ui/Skeleton";
import { useAppointmentComposer } from "../context/AppointmentComposerContext";
import { getClients, searchClients } from "../services/clients";
import { parseDateOnly } from "../utils/date";
import { formatMoney, formatPhone, getInitials, whatsappLink } from "../utils/format";
import "./ClientsDirectory.css";

const PAGE_SIZE = 10;

const formatShortDate = iso =>
    parseDateOnly(iso).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" });

const Clients = () => {
    const { openComposer, version } = useAppointmentComposer();

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

    const load = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const result = query ? await searchClients(query, page, PAGE_SIZE) : await getClients(page, PAGE_SIZE);
            setClients(result.data);
            setPagination(result.pagination);
        } catch {
            setError("No se pudieron cargar los clientes. Intentá de nuevo.");
        } finally {
            setLoading(false);
        }
    }, [query, page]);

    // `version` sube cuando se guarda un turno desde el modal global: las
    // visitas y el último servicio de la lista cambian.
    useEffect(() => {
        load();
    }, [load, version]);

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

    const total = pagination?.total ?? clients.length;

    return (
        <div>
            <PageHeader
                eyebrow="Base de clientes"
                title="Clientes"
                titleAccent="Directorio"
                description="Buscá una ficha, mirá su historial o agendale un turno."
                action={
                    <Button icon="person_add" onClick={openCreate}>
                        Nuevo cliente
                    </Button>
                }
            />

            <div className="dir-toolbar">
                <label className="dir-search">
                    <Icon name="search" size={20} className="dir-search-icon" />
                    <span className="visually-hidden">Buscar clientes</span>
                    <input
                        type="search"
                        autoComplete="off"
                        value={searchInput}
                        onChange={e => setSearchInput(e.target.value)}
                        placeholder="Buscar por nombre, apellido o teléfono…"
                    />
                    {searchInput && (
                        <button
                            type="button"
                            className="dir-search-clear"
                            aria-label="Limpiar búsqueda"
                            onClick={() => setSearchInput("")}
                        >
                            <Icon name="cancel" size={18} />
                        </button>
                    )}
                </label>
                <div className="dir-count" aria-live="polite">
                    {loading ? (
                        "Buscando…"
                    ) : (
                        <>
                            <span className="dir-count-value">{total}</span>
                            {query
                                ? ` ${total === 1 ? "resultado" : "resultados"} para “${query}”`
                                : ` ${total === 1 ? "cliente registrado" : "clientes registrados"}`}
                        </>
                    )}
                </div>
            </div>

            {error && (
                <div className="dir-error">
                    <InlineFeedback tone="error">{error}</InlineFeedback>
                    <Button variant="secondary" icon="refresh" onClick={load}>
                        Reintentar
                    </Button>
                </div>
            )}

            <section className="dir-panel" aria-label="Listado de clientes">
                <div className="dir-head" aria-hidden="true">
                    <span>Cliente y notas</span>
                    <span>Contacto</span>
                    <span>Última visita</span>
                    <span className="is-numeric">Visitas</span>
                    <span className="is-numeric">Gastado</span>
                    <span className="is-numeric">Acciones</span>
                </div>

                {loading ? (
                    <div className="dir-skeleton">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Skeleton key={i} height="64px" />
                        ))}
                    </div>
                ) : clients.length === 0 ? (
                    <div className="dir-empty">
                        <Icon name={query ? "search_off" : "group_add"} size={36} />
                        <span className="dir-empty-title">{query ? "Sin resultados" : "Todavía no hay clientes"}</span>
                        <p>
                            {query
                                ? "Probá con otro nombre, apellido o teléfono."
                                : "Creá la primera ficha o se van a sumar solos con las reservas online."}
                        </p>
                        {!query && (
                            <Button icon="person_add" onClick={openCreate}>
                                Nuevo cliente
                            </Button>
                        )}
                    </div>
                ) : (
                    <ul className="dir-list">
                        {clients.map((client, index) => {
                            const name = [client.first_name, client.last_name].filter(Boolean).join(" ");
                            const visits = client.completed_visits;
                            return (
                                <li
                                    key={client.id}
                                    className="dir-row"
                                    style={{ animationDelay: `${Math.min(index, 9) * 30}ms` }}
                                >
                                    <div className="dir-cell dir-identity">
                                        <span className="dir-avatar" aria-hidden="true">
                                            {getInitials(client.first_name, client.last_name)}
                                        </span>
                                        <span className="dir-identity-text">
                                            <span className="dir-name">{name}</span>
                                            <span className={`dir-notes ${client.notes ? "" : "is-empty"}`}>
                                                {client.notes || "Sin notas"}
                                            </span>
                                        </span>
                                    </div>

                                    <div className="dir-cell dir-contact">
                                        <span className="dir-label">Contacto</span>
                                        {client.phone ? (
                                            <span className="dir-phone">
                                                {formatPhone(client.phone)}
                                                <a
                                                    className="dir-wa"
                                                    href={whatsappLink(client.phone, `Hola ${client.first_name}!`)}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    aria-label={`Escribirle a ${name} por WhatsApp`}
                                                >
                                                    <Icon name="chat" size={16} />
                                                </a>
                                            </span>
                                        ) : (
                                            <span className="dir-muted">—</span>
                                        )}
                                    </div>

                                    <div className="dir-cell dir-last">
                                        <span className="dir-label">Última visita</span>
                                        {client.last_visit ? (
                                            <span className="dir-last-text">
                                                <span className="dir-last-service">{client.last_service_name || "Servicio"}</span>
                                                <span className="dir-last-date">{formatShortDate(client.last_visit)}</span>
                                            </span>
                                        ) : (
                                            <span className="dir-muted">Sin visitas</span>
                                        )}
                                    </div>

                                    <div className="dir-cell is-numeric">
                                        <span className="dir-label">Visitas</span>
                                        <span className="dir-number">{visits ?? "—"}</span>
                                    </div>

                                    <div className="dir-cell is-numeric">
                                        <span className="dir-label">Gastado</span>
                                        <span className="dir-money">
                                            {client.total_spent != null ? formatMoney(client.total_spent) : "—"}
                                        </span>
                                    </div>

                                    <div className="dir-cell dir-actions">
                                        <button
                                            type="button"
                                            className="dir-action"
                                            onClick={() => setHistoryClientId(client.id)}
                                            aria-label={`Ver historial de ${name}`}
                                            title="Historial"
                                        >
                                            <Icon name="history" size={20} />
                                        </button>
                                        <button
                                            type="button"
                                            className="dir-action"
                                            onClick={() => openEdit(client)}
                                            aria-label={`Editar a ${name}`}
                                            title="Editar"
                                        >
                                            <Icon name="edit" size={20} />
                                        </button>
                                        <button
                                            type="button"
                                            className="dir-action is-primary"
                                            onClick={() => openComposer({ initialClient: client })}
                                            aria-label={`Agendar un turno para ${name}`}
                                            title="Nuevo turno"
                                        >
                                            <Icon name="event_available" size={20} />
                                            <span className="dir-action-text">Turno</span>
                                        </button>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}

                {pagination && pagination.totalPages > 1 && (
                    <div className="dir-pagination">
                        <span className="dir-pagination-label">
                            Página {pagination.page} de {pagination.totalPages}
                        </span>
                        <div className="dir-pagination-actions">
                            <Button
                                variant="ghost"
                                size="sm"
                                icon="chevron_left"
                                disabled={page <= 1 || loading}
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                            >
                                Anterior
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                iconRight="chevron_right"
                                disabled={page >= pagination.totalPages || loading}
                                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                            >
                                Siguiente
                            </Button>
                        </div>
                    </div>
                )}
            </section>

            <ClientFormModal
                open={formModalOpen}
                client={editingClient}
                onClose={() => setFormModalOpen(false)}
                onSaved={() => {
                    setFormModalOpen(false);
                    load();
                }}
            />

            <ClientHistoryModal clientId={historyClientId} onClose={() => setHistoryClientId(null)} />
        </div>
    );
};

export default Clients;
