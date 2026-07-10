export function recordatorioTemplate(
  nombre: string,
  diasInactivo: number,
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f39c12; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Recordatorio de Activacion</h1>
        </div>
        <div class="content">
          <p>Hola ${nombre},</p>
          <p>Han pasado ${diasInactivo} dias desde que se pre-registro en M3Motors.</p>
          <p>Para comenzar a recibir alertas de mantenimiento predictivo, por favor active su cuenta.</p>
          <p>Si tiene alguna duda, no dude en contactarnos.</p>
          <p>Saludos,<br/>El equipo de M3Motors</p>
        </div>
        <div class="footer">
          <p>M3Motors - Sistema de Mantenimiento Predictivo</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
