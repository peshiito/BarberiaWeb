import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { BRAND } from "../../data/brand";
import { useDocumentHead } from "../../hooks/useDocumentHead";
import { buildIcs, downloadFile, googleCalendarUrl } from "../../utils/calendar";
import { formatFullDate, parseISODateOnly } from "../../utils/date";
import { addMinutesToTime, formatDuration, formatPrice, fullName } from "../../utils/format";
import { whatsappUrl } from "../../utils/links";
import Icon from "../ui/Icon";
import { IconWhatsapp } from "../ui/icons";
import "./BookingConfirmation.css";

function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

export default function BookingConfirmation({ appointment }) {
    useDocumentHead({ title: "Turno confirmado", description: "Tu turno en Oficio Barbería quedó reservado.", noIndex: true });

    const { id, service, barber, dateIso, time, guest } = appointment;
    const titleRef = useRef(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        titleRef.current?.focus();
    }, []);

    useEffect(() => {
        if (!copied) return undefined;
        const timer = setTimeout(() => setCopied(false), 2200);
        return () => clearTimeout(timer);
    }, [copied]);

    const code = `#OFC-${id}`;
    const dateLabel = capitalize(formatFullDate(parseISODateOnly(dateIso)).replace(",", ""));
    const endTime = addMinutesToTime(time, service.duration_minutes);
    const eventTitle = `${service.name} con ${barber.first_name} · ${BRAND.name}`;
    const eventDetails = `Código ${code}. ${BRAND.paymentNote} Sucursales y cómo llegar: ${window.location.origin}/sucursales`;
    const cancelText = `Hola! No voy a poder ir a mi turno ${code} del ${dateLabel} a las ${time} con ${barber.first_name}.`;

    async function copyCode() {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
        } catch {
            setCopied(false);
        }
    }

    function downloadIcs() {
        const ics = buildIcs({
            uid: `ofc-${id}@oficiobarberia.com.ar`,
            title: eventTitle,
            dateIso,
            time,
            endTime,
            details: eventDetails,
        });
        downloadFile(ics, `turno-oficio-${id}.ics`, "text/calendar;charset=utf-8");
    }

    const rows = [
        { label: "Servicio", value: service.name },
        { label: "Barbero", value: fullName(barber) },
        { label: "Fecha", value: dateLabel },
        { label: "Horario", value: `${time} a ${endTime}`, mono: true },
        { label: "Duración", value: formatDuration(service.duration_minutes), mono: true },
        { label: "A nombre de", value: `${guest.firstName.trim()} ${guest.lastName.trim()}` },
    ];

    return (
        <section className="section section-dark confirm-page" aria-labelledby="confirm-title">
            <div className="container confirm-inner">
                <div className="confirm-head">
                    <span className="confirm-check" aria-hidden="true">
                        <Icon name="check" size={30} />
                    </span>
                    <h1 id="confirm-title" ref={titleRef} tabIndex={-1} className="confirm-title">
                        Turno confirmado
                    </h1>
                    <p className="confirm-lede">
                        Te esperamos el {dateLabel.toLowerCase()} a las {time} con {barber.first_name}. Guardá el código o
                        agregalo a tu calendario.
                    </p>
                </div>

                <article className="ticket" aria-label="Comprobante del turno">
                    <div className="ticket-brand">
                        <span>{BRAND.shortName}</span>
                        <span className="ticket-brand-sub">Barbería · Buenos Aires</span>
                    </div>

                    <div className="ticket-code">
                        <div>
                            <p className="ticket-label">Código de reserva</p>
                            <p className="ticket-code-value">{code}</p>
                        </div>
                        <button type="button" className="ticket-copy" onClick={copyCode}>
                            <Icon name={copied ? "check" : "content_copy"} size={18} />
                            {copied ? "Copiado" : "Copiar código"}
                        </button>
                        <span className="visually-hidden" aria-live="polite">
                            {copied ? "Código copiado" : ""}
                        </span>
                    </div>

                    <div className="ticket-tear" aria-hidden="true" />

                    <dl className="ticket-rows">
                        {rows.map((row) => (
                            <div key={row.label} className="ticket-row">
                                <dt>{row.label}</dt>
                                <dd className={row.mono ? "mono" : undefined}>{row.value}</dd>
                            </div>
                        ))}
                    </dl>

                    <div className="ticket-total">
                        <span>Total del turno</span>
                        <span className="ticket-price">{formatPrice(service.price)}</span>
                    </div>
                    <p className="ticket-note">
                        <Icon name="payments" size={18} />
                        {BRAND.paymentNote}
                    </p>
                </article>

                <div className="confirm-actions">
                    <a
                        className="confirm-action"
                        href={googleCalendarUrl({ title: eventTitle, dateIso, time, endTime, details: eventDetails })}
                        target="_blank"
                        rel="noreferrer"
                    >
                        <Icon name="calendar_add_on" size={20} />
                        Agregar a Google Calendar
                    </a>
                    <button type="button" className="confirm-action" onClick={downloadIcs}>
                        <Icon name="download" size={20} />
                        Descargar .ics
                    </button>
                    <Link className="confirm-action" to="/sucursales">
                        <Icon name="directions" size={20} />
                        Ver sucursales y cómo llegar
                    </Link>
                </div>

                <div className="confirm-cancel">
                    <div>
                        <p className="confirm-cancel-title">¿No podés venir?</p>
                        <p>Avisanos por WhatsApp para liberar el horario para otro cliente.</p>
                    </div>
                    <a className="btn btn-whatsapp-solid btn-md" href={whatsappUrl(cancelText)} target="_blank" rel="noreferrer">
                        <IconWhatsapp width={18} height={18} />
                        Avisar por WhatsApp
                    </a>
                </div>

                <Link to="/" className="text-link confirm-back">
                    <Icon name="arrow_back" size={18} />
                    Volver al inicio
                </Link>
            </div>
        </section>
    );
}
