# M3Motors - Plataforma Inteligente de Gestión y Mantenimiento Predictivo para Talleres Mecánicos

M3Motors es un ecosistema digital diseñado para modernizar la operación de talleres mecánicos mediante la captura sistemática de intervenciones técnicas y la implementación de un motor analítico predictivo. La plataforma permite calcular tasas de desgaste vehicular para despachar alertas proactivas a los clientes a través de un canal conversacional automatizado.

---

## 🚀 Estado del Proyecto
* **Estado actual:** `En desarrollo`
* **Fase:** Requerimientos, Análisis y Diseño de Arquitectura (Sprint Actual).

---

## 🛠️ Tecnologías Utilizadas

La arquitectura del sistema está proyectada bajo los principios de *Clean Architecture* y *Domain-Driven Design (DDD)* utilizando el siguiente stack tecnológico:

*   **Backend:** Node.js (NestJS) + Prisma
*   **Frontend:** React / TypeScript (Vite + Tailwind CSS)
*   **Base de Datos:** PostgreSQL (Persistencia relacional y almacenamiento del historial clínico vehicular)
*   **Integraciones:** Telegram Bot API (Interfaz conversacional para clientes finales)
*   **Infraestructura:** Docker / AWS (EC2 para despliegue de instancias y servicios controlados)

---

## 📁 Estructura del Proyecto

El repositorio está organizado bajo una estructura modular de documentación y desarrollo:

```text
├── 00. PROJECT OVERVIEW       # Documentación de objetivos globales del sistema
├── 01. LENGUAJE UBICUO        # Glosario y términos del dominio de negocio
├── 03. REQUERIMIENTOS Y ANÁLISIS
│   ├── 3.3. Casos de Uso      # Especificación funcional de actores y diagramas
│   └── 3.6. Roles del Sistema # Definición de permisos, restricciones y responsabilidades
├── 05. DISEÑO DE INTERFACES
│   └── 5.2. Bot de Telegram   # Árbol de decisiones y flujo lógico del chatbot OCR
├── 06. MODELO DE DATOS
│   └── 6.1. Modelo ER         # Diagrama Entidad-Relación y diccionario de datos preliminar
└── 07. DISEÑO DE INTERFACES   # Investigación UI/UX, hallazgos de industria y moodboard