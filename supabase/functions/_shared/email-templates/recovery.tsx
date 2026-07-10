/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface RecoveryEmailProps {
  siteName: string
  confirmationUrl: string
}

export const RecoveryEmail = ({
  siteName,
  confirmationUrl,
}: RecoveryEmailProps) => (
  <Html lang="es" dir="ltr">
    <Head>
      <style>{`
        @media (prefers-color-scheme: dark) {
          .nemu-btn {
            background-color: #ffffff !important;
            color: #000000 !important;
          }
          .nemu-h1 { color: #ffffff !important; }
          .nemu-text { color: #cccccc !important; }
        }
      `}</style>
    </Head>
    <Preview>Restablecé tu contraseña en {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1} className="nemu-h1">Restablecé tu contraseña</Heading>
        <Text style={text} className="nemu-text">
          Recibimos una solicitud para restablecer tu contraseña en {siteName}.
          Hacé clic en el botón de abajo para elegir una nueva contraseña.
        </Text>
        <Button style={button} href={confirmationUrl} className="nemu-btn">
          Restablecer contraseña
        </Button>
        <Text style={footer} className="nemu-text">
          Si no solicitaste restablecer tu contraseña, podés ignorar este
          correo. Tu contraseña no será modificada.
        </Text>
        <Text style={footer} className="nemu-text">Equipo de Nemu</Text>
      </Container>
    </Body>
  </Html>
)

export default RecoveryEmail

const main = { backgroundColor: '#ffffff', fontFamily: 'Inter, Arial, sans-serif' }
const container = { padding: '20px 25px' }
const h1 = {
  fontSize: '22px',
  fontWeight: 'bold' as const,
  color: 'hsl(220, 15%, 12%)',
  margin: '0 0 20px',
}
const text = {
  fontSize: '14px',
  color: 'hsl(220, 10%, 45%)',
  lineHeight: '1.5',
  margin: '0 0 25px',
}
const button = {
  backgroundColor: 'hsl(262, 83%, 58%)',
  color: 'hsl(0, 0%, 100%)',
  fontSize: '14px',
  borderRadius: '12px',
  padding: '12px 20px',
  textDecoration: 'none',
}
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0' }
