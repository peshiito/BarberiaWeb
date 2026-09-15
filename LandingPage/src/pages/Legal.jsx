import { useParams, Navigate } from "react-router-dom";
import { useDocumentHead } from "../hooks/useDocumentHead";
import { BRAND } from "../data/brand";
import "./Legal.css";

const TERMS = {
    title: "Términos y condiciones",
    updated: "Vigente desde agosto de 2026",
    sections: [
        {
            heading: "1. Objeto",
            body: `Estos términos regulan el uso del sitio web de ${BRAND.name} y la reserva de turnos online para servicios de barbería. Al reservar un turno a través de este sitio, aceptás estas condiciones.`,
        },
        {
            heading: "2. Reserva de turnos",
            body: "Cada turno se reserva para un servicio, un barbero, una fecha y un horario. No hace falta crear una cuenta ni pagar una seña: alcanza con tu nombre, apellido y teléfono. Solo podés tener un turno activo por día. Si otra persona reservó el mismo horario justo antes, te lo avisamos al confirmar para que elijas otro.",
        },
        {
            heading: "3. Cancelaciones",
            body: "Si no podés venir, avisanos por WhatsApp con la mayor anticipación posible para liberar el horario para otro cliente. Por ahora las cancelaciones y los cambios de horario se gestionan por WhatsApp.",
        },
        {
            heading: "4. Datos de contacto",
            body: "Usamos el teléfono que dejás al reservar para identificarte cuando llegás y, si hace falta, para avisarte por un cambio en tu turno. Te pedimos cargar un número propio y vigente.",
        },
        {
            heading: "5. Precios",
            body: "El precio que ves al reservar es el del servicio en ese momento. Se paga en el local, en efectivo o transferencia.",
        },
        {
            heading: "6. Uso del sitio",
            body: "Te pedimos usar el sitio de buena fe: no reservar turnos que no pensás honrar, no reservar a nombre de otra persona sin su consentimiento y no utilizar el sitio con fines distintos a reservar tus propios turnos.",
        },
        {
            heading: "7. Modificaciones",
            body: "Podemos actualizar estos términos para reflejar cambios en nuestros servicios. La fecha de vigencia se actualiza en esta misma página.",
        },
    ],
};

const PRIVACY = {
    title: "Política de privacidad",
    updated: "Vigente desde agosto de 2026",
    sections: [
        {
            heading: "1. Qué datos recopilamos",
            body: "Al reservar un turno pedimos tu nombre, apellido, número de teléfono y, si querés, una referencia para el barbero. También guardamos el servicio, el barbero, la fecha y el horario elegidos. No pedimos ni almacenamos datos de tarjetas ni información de pago en este sitio.",
        },
        {
            heading: "2. Para qué usamos tus datos",
            body: "Usamos tu nombre y teléfono exclusivamente para identificarte, gestionar tus turnos y, si hace falta, contactarte por un cambio o cancelación relacionada con tu reserva. No usamos tus datos con fines publicitarios ni los vendemos a terceros.",
        },
        {
            heading: "3. Con quién compartimos tus datos",
            body: "Tu información de contacto es visible para el equipo de la barbería, que la usa para atender tu turno. No compartimos tus datos con terceros ajenos a la operación del negocio.",
        },
        {
            heading: "4. Cómo protegemos tus datos",
            body: "Tus datos se almacenan en nuestra base de datos con acceso restringido al personal autorizado de la barbería.",
        },
        {
            heading: "5. Cuánto tiempo guardamos tus datos",
            body: "Conservamos tu información mientras mantengas turnos activos o un historial reciente con nosotros. Si querés que eliminemos tus datos, podés escribirnos por WhatsApp o al correo de contacto que figura en el pie de página.",
        },
        {
            heading: "6. Tus derechos",
            body: "Podés pedirnos en cualquier momento que te confirmemos qué datos tenemos tuyos, que los corrijamos si están mal, o que los eliminemos si ya no querés ser cliente.",
        },
    ],
};

const DOCS = { terminos: TERMS, privacidad: PRIVACY };

export default function Legal() {
    const { doc } = useParams();
    const content = DOCS[doc];

    useDocumentHead({
        title: content ? content.title : "Legal",
        description: content ? `${content.title} de ${BRAND.name}.` : `Información legal de ${BRAND.name}.`,
    });

    if (!content) {
        return <Navigate to="/legal/terminos" replace />;
    }

    return (
        <section className="section section-dark legal-page">
            <div className="container legal-container">
                <p className="eyebrow">Legal</p>
                <h1 className="section-title">{content.title}</h1>
                <p className="legal-updated">{content.updated}</p>

                <div className="legal-body">
                    {content.sections.map((s) => (
                        <div key={s.heading} className="legal-section">
                            <h2>{s.heading}</h2>
                            <p>{s.body}</p>
                        </div>
                    ))}
                </div>

                <p className="legal-disclaimer">
                    Este documento es una base estándar redactada para el lanzamiento del sitio. Te recomendamos
                    validarlo con un asesor legal antes de tratarlo como definitivo, especialmente si cambian las
                    condiciones reales de reserva, cancelación o tratamiento de datos.
                </p>
            </div>
        </section>
    );
}
