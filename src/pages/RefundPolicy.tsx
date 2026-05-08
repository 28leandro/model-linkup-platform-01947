import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const RefundPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-3xl px-4 py-10">
        <Button asChild variant="ghost" size="sm" className="mb-6">
          <Link to="/"><ArrowLeft className="w-4 h-4 mr-1" /> Volver</Link>
        </Button>

        <h1 className="text-3xl font-bold mb-2">Política de Reembolso</h1>
        <p className="text-sm text-muted-foreground mb-8">Última actualización: 2026</p>

        <div className="prose prose-sm max-w-none space-y-4 text-foreground">
          <p>
            La presente Política de Reembolso regula las condiciones bajo las cuales
            los usuarios de esta plataforma pueden solicitar la devolución de los
            valores abonados por los servicios digitales de publicación de anuncios,
            de conformidad con la Ley N.° 1.334/98 de Defensa del Consumidor y del
            Usuario de la República del Paraguay.
          </p>

          <h2 className="text-lg font-semibold mt-6">1. Naturaleza del servicio</h2>
          <p>
            El servicio ofrecido consiste en la habilitación de publicación de
            anuncios y la posibilidad de cargar fotografías adicionales en la
            plataforma. Se trata de un servicio digital de ejecución inmediata una
            vez confirmado el pago.
          </p>

          <h2 className="text-lg font-semibold mt-6">2. Derecho de arrepentimiento</h2>
          <p>
            El usuario dispone de un plazo de <strong>siete (7) días corridos</strong>,
            contados desde la fecha de pago, para ejercer su derecho de
            arrepentimiento y solicitar el reembolso íntegro del importe abonado,
            <strong> siempre y cuando no haya hecho uso del servicio contratado</strong>,
            es decir, que no haya publicado, modificado ni cargado fotografías a
            través de la herramienta habilitada.
          </p>

          <h2 className="text-lg font-semibold mt-6">3. Casos en que no procede el reembolso</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Cuando el anuncio ya haya sido publicado.</li>
            <li>Cuando se hayan cargado fotografías mediante la herramienta de publicación.</li>
            <li>Cuando hayan transcurrido más de siete (7) días desde la confirmación del pago.</li>
            <li>Cuando el incumplimiento se deba a causas atribuibles al usuario (datos incorrectos, uso indebido, etc.).</li>
          </ul>

          <h2 className="text-lg font-semibold mt-6">4. Procedimiento de solicitud</h2>
          <p>
            Para solicitar un reembolso, el usuario deberá contactar al equipo de
            soporte por WhatsApp o por correo electrónico, indicando el número de
            orden de pago y el motivo de la solicitud. El equipo evaluará el caso y
            responderá en un plazo máximo de cinco (5) días hábiles.
          </p>

          <h2 className="text-lg font-semibold mt-6">5. Forma de devolución</h2>
          <p>
            En caso de proceder, el reembolso se efectuará por el mismo medio de
            pago utilizado en la transacción original. Los plazos de acreditación
            dependerán de la entidad financiera o medio de pago correspondiente.
          </p>

          <h2 className="text-lg font-semibold mt-6">6. Contacto</h2>
          <p>
            Para cualquier consulta relacionada con esta política, contáctenos por
            WhatsApp desde el botón disponible en la plataforma.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicy;