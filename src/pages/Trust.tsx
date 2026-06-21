import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Lock, Database, Mail } from "lucide-react";

const Trust = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-3xl px-4 py-10">
        <Button asChild variant="ghost" size="sm" className="mb-6">
          <Link to="/"><ArrowLeft className="w-4 h-4 mr-1" /> Volver</Link>
        </Button>

        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-7 h-7 text-primary" />
          <h1 className="text-3xl font-bold">Centro de Confianza</h1>
        </div>
        <p className="text-sm text-muted-foreground mb-8">
          Esta página es mantenida por el equipo de Nemu para responder dudas
          frecuentes sobre seguridad y privacidad de la plataforma. No constituye
          una certificación independiente.
        </p>

        <div className="space-y-8 text-foreground">
          <section>
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Autenticación y acceso</h2>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Inicio de sesión con correo y contraseña, con verificación de email obligatoria.</li>
              <li>Recuperación de contraseña mediante enlace enviado por correo electrónico.</li>
              <li>Las contraseñas se almacenan únicamente como hashes gestionados por el proveedor de autenticación.</li>
              <li>Cada usuario solo puede ver y modificar sus propios anuncios, mensajes y favoritos.</li>
            </ul>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-2">
              <Database className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Datos y privacidad</h2>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Los datos se almacenan en la infraestructura gestionada de Lovable Cloud / Supabase.</li>
              <li>Las consultas a la base de datos están protegidas con políticas de seguridad a nivel de fila (RLS).</li>
              <li>Los números de teléfono de los anunciantes no se exponen públicamente: se entregan a través de funciones controladas para usuarios autenticados.</li>
              <li>Las imágenes se almacenan en un bucket de almacenamiento dedicado y se comprimen antes de subirse.</li>
              <li>Solo recogemos los datos necesarios para operar la plataforma (cuenta, anuncios, mensajes, favoritos, pagos).</li>
            </ul>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Pagos</h2>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Los pagos por publicación de fotos adicionales se procesan a través de proveedores externos (Stripe / Pagopar).</li>
              <li>No almacenamos datos completos de tarjetas en nuestros servidores; esos datos los gestiona el procesador de pagos.</li>
            </ul>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-2">
              <Mail className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Contacto de seguridad</h2>
            </div>
            <p className="text-sm">
              Si encontraste un problema de seguridad o tenés dudas sobre el
              tratamiento de tus datos, escribinos desde la sección de contacto
              del sitio y revisaremos tu reporte lo antes posible.
            </p>
          </section>

          <p className="text-xs text-muted-foreground pt-4 border-t">
            Responsabilidad compartida: Lovable Cloud provee la infraestructura
            (hosting, base de datos, autenticación, almacenamiento). Nemu es
            responsable de la configuración de la aplicación y del uso correcto
            de la plataforma por parte de cada usuario.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Trust;