export function alertaTemplate(
  componente: string,
  severidad: string,
  mensaje: string,
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
        .header { background-color: #e74c3c; color: white; padding: 20px; text-align: center; }
        .header.alta { background-color: #e74c3c; }
        .header.media { background-color: #f39c12; }
        .header.baja { background-color: #3498db; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .alert-box { background-color: white; border-left: 4px solid #e74c3c; padding: 15px; margin: 10px 0; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header ${severidad}">
          <h1>Alerta de Mantenimiento</h1>
        </div>
        <div class="content">
          <div class="alert-box">
            <p><strong>Componente:</strong> ${componente}</p>
            <p><strong>Severidad:</strong> ${severidad.toUpperCase()}</p>
            <p><strong>Mensaje:</strong> ${mensaje}</p>
          </div>
          <p>Por favor, contacte al taller para programar su mantenimiento.</p>
        </div>
        <div class="footer">
          <p>M3Motors - Sistema de Mantenimiento Predictivo</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
