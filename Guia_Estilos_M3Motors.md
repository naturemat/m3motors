# GUÍA DE ESTILOS VISUALES - M3MOTORS

## 1. DESCRIPCIÓN

El presente documento define la guía de estilos visuales para el sistema
M3Motors. Esta guía establece la identidad visual de la plataforma,
incluyendo paleta de colores, tipografía, componentes base y tokens de
diseño, con el objetivo de garantizar una experiencia de usuario
coherente, profesional y alineada con el dominio del negocio de talleres
mecánicos.

Todas las decisiones de diseño aquí documentadas están justificadas en
función del contexto de uso, la psicología del color, la legibilidad y
la usabilidad en entornos de taller mecánico.

### 1.1. OBJETIVO

-   Definir una identidad visual profesional y coherente para M3Motors
-   Establecer una paleta de colores que transmita confianza, precisión
    y modernidad
-   Seleccionar una tipografía legible y funcional para entornos de
    trabajo
-   Definir componentes base reutilizables para acelerar el diseño y
    desarrollo
-   Proporcionar tokens de diseño para implementación consistente en
    código

### 1.2. ALCANCE

**Cubre:** - Paleta de colores primarios, secundarios, neutros y de
estado - Tipografía para títulos y cuerpo de texto - Componentes base:
botones, inputs, tarjetas, tablas y modales - Componentes de navegación:
AppBar, Bottom Nav, Sidebar - Estados y feedback: loading, error, empty
states - Tokens de diseño para implementación en código

**No cubre:** - Diseño de pantallas específicas (mockups) - Definición
de arquitectura de navegación - Prototipado interactivo

### 1.3. AUDIENCIA

  Perfil                     Lectura recomendada
  -------------------------- ---------------------
  Diseñadores UX/UI          Obligatoria
  Desarrolladores Frontend   Obligatoria
  Product Owner              Recomendada
  Stakeholders               Recomendada

------------------------------------------------------------------------

## 2. FUNDAMENTOS DE DISEÑO

### 2.1. FILOSOFÍA DE DISEÑO

M3Motors se posiciona como una plataforma digital para talleres
mecánicos que combina la tradición del servicio automotriz con la
innovación tecnológica. El diseño debe reflejar:

-   **Confianza:** El usuario debe sentirse seguro de que su vehículo
    está en buenas manos
-   **Precisión:** La información debe ser clara, exacta y fácil de
    escanear
-   **Modernidad:** La plataforma debe verse actual, tecnológica y
    profesional
-   **Simplicidad:** La interfaz debe ser intuitiva y reducir la carga
    cognitiva

### 2.2. PRINCIPIOS DE MARCA

  -----------------------------------------------------------------------
  Principio                        Descripción
  -------------------------------- --------------------------------------
  **Profesionalismo**              Todo debe transmitir seriedad y
                                   competencia técnica

  **Tecnología**                   El diseño debe reflejar que es una
                                   plataforma digital avanzada

  **Cercanía**                     Aunque es tecnología, debe sentirse
                                   humana y accesible

  **Eficiencia**                   La interfaz debe facilitar el trabajo
                                   rápido en el taller
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 3. PALETA DE COLORES

### 3.1. COLORES PRIMARIOS

  --------------------------------------------------------------------------
  Nombre             Código Hex                   HSL         Uso
  ------------------ ---------------------------- ----------- --------------
  **Azul Profundo**  #1A5276                      hsl(208,    Fondo de
                                                  71%, 28%)   cabeceras,
                                                              botones
                                                              principales,
                                                              elementos de
                                                              navegación

  **Azul Profundo    #154360                      hsl(208,    Hover de
  Hover**                                         71%, 22%)   botones
                                                              principales

  **Azul Profundo    #0E3B4F                      hsl(208,    Active de
  Active**                                        71%, 18%)   botones
                                                              principales

  **Azul Profundo    #EBF5FB                      hsl(210,    Fondo de
  Light**                                         67%, 95%)   elementos
                                                              destacados
  --------------------------------------------------------------------------

**Justificación:** El azul transmite confianza, seguridad y estabilidad.
Es el color más utilizado en la industria automotriz y financiera porque
genera credibilidad en el usuario. En un taller mecánico, el cliente
necesita sentirse seguro de que su vehículo está en buenas manos.

### 3.2. COLORES SECUNDARIOS

  --------------------------------------------------------------------------
  Nombre             Código Hex                   HSL         Uso
  ------------------ ---------------------------- ----------- --------------
  **Azul Claro**     #2E86C1                      hsl(206,    Botones
                                                  60%, 47%)   secundarios,
                                                              enlaces,
                                                              acentos
                                                              visuales

  **Azul Claro       #2471A3                      hsl(206,    Hover de
  Hover**                                         60%, 39%)   elementos
                                                              secundarios

  **Azul Claro       #D6EAF8                      hsl(206,    Fondos de
  Light**                                         60%, 90%)   elementos de
                                                              información
  --------------------------------------------------------------------------

**Justificación:** Complementa al azul profundo aportando claridad y
accesibilidad. Facilita la jerarquía visual sin romper la coherencia de
la marca.

### 3.3. COLORES DE ESTADO

  -----------------------------------------------------------------------------
  Nombre             Código Hex                   HSL         Uso
  ------------------ ---------------------------- ----------- -----------------
  **Éxito**          #27AE60                      hsl(145,    Confirmaciones,
                                                  63%, 42%)   operaciones
                                                              exitosas, estado
                                                              "completado"

  **Éxito Light**    #D5F5E3                      hsl(145,    Fondo de mensajes
                                                  63%, 90%)   de éxito

  **Error**          #E74C3C                      hsl(6, 78%, Alertas críticas,
                                                  57%)        errores,
                                                              componentes en
                                                              estado crítico

  **Error Light**    #FDEDEC                      hsl(6, 78%, Fondo de mensajes
                                                  96%)        de error

  **Advertencia**    #F39C12                      hsl(38,     Alertas de
                                                  90%, 52%)   mantenimiento,
                                                              advertencias de
                                                              desgaste

  **Advertencia      #FEF9E7                      hsl(38,     Fondo de mensajes
  Light**                                         90%, 95%)   de advertencia

  **Información**    #3498DB                      hsl(204,    Mensajes
                                                  70%, 53%)   informativos,
                                                              notificaciones
                                                              generales

  **Información      #EBF5FB                      hsl(204,    Fondo de mensajes
  Light**                                         70%, 95%)   informativos
  -----------------------------------------------------------------------------

**Justificación:** - **Verde:** Universalmente asociado con éxito,
aprobación y seguridad - **Rojo:** Capta la atención inmediata, asociado
con urgencia y peligro - **Amarillo:** Indica precaución y atención,
como semáforos y señales - **Azul Claro:** Transmite información neutral
y objetiva

### 3.4. COLORES NEUTROS

  ---------------------------------------------------------------------------
  Nombre             Código Hex                   HSL         Uso
  ------------------ ---------------------------- ----------- ---------------
  **Negro (Textos    #2C3E50                      hsl(210,    Títulos
  Primarios)**                                    30%, 24%)   principales,
                                                              textos de alta
                                                              jerarquía

  **Gris Oscuro**    #34495E                      hsl(210,    Textos de media
                                                  30%, 29%)   jerarquía

  **Gris Medio       #5D6D7E                      hsl(210,    Textos
  (Textos)**                                      15%, 43%)   secundarios,
                                                              etiquetas,
                                                              descripciones

  **Gris Claro**     #95A5A6                      hsl(180,    Textos de baja
                                                  5%, 62%)    jerarquía,
                                                              placeholders

  **Gris Muy Claro** #BDC3C7                      hsl(210,    Bordes,
                                                  10%, 76%)   separadores

  **Gris Neutro      #F4F6F7                      hsl(210,    Fondos de
  (Fondos)**                                      15%, 96%)   pantalla,
                                                              tarjetas, áreas
                                                              de contenido

  **Blanco**         #FFFFFF                      hsl(0, 0%,  Fondos de
                                                  100%)       elementos
                                                              principales,
                                                              texto sobre
                                                              fondos oscuros
  ---------------------------------------------------------------------------

**Justificación:** El gris claro reduce la fatiga visual y permite que
los elementos importantes (botones, datos) destaquen. El negro garantiza
el máximo contraste y legibilidad para información crítica.

### 3.5. COLORES DE FONDO Y SUPERFICIE

  ------------------------------------------------------------------------
  Nombre             Código Hex                   HSL         Uso
  ------------------ ---------------------------- ----------- ------------
  **Fondo            #F4F6F7                      hsl(210,    Fondo de
  Principal**                                     15%, 96%)   pantallas y
                                                              layouts

  **Fondo            #EBF5FB                      hsl(210,    Fondo de
  Secundario**                                    67%, 95%)   secciones
                                                              destacadas

  **Superficie**     #FFFFFF                      hsl(0, 0%,  Cards,
                                                  100%)       paneles,
                                                              modales

  **Superficie       #1A5276                      hsl(208,    AppBar,
  Oscura**                                        71%, 28%)   Sidebar,
                                                              TopBar
  ------------------------------------------------------------------------

### 3.6. GRADIENTES

  --------------------------------------------------------------------------------------------
  Nombre                  Gradiente                                             Uso
  ----------------------- ----------------------------------------------------- --------------
  **Primario**            `linear-gradient(135deg, #1A5276 0%, #2E86C1 100%)`   Fondo de
                                                                                elementos
                                                                                destacados,
                                                                                hero banners

  **Éxito**               `linear-gradient(135deg, #27AE60 0%, #2ECC71 100%)`   Fondo de
                                                                                elementos de
                                                                                éxito

  **Error**               `linear-gradient(135deg, #E74C3C 0%, #EC7063 100%)`   Fondo de
                                                                                elementos de
                                                                                error
  --------------------------------------------------------------------------------------------

### 3.7. ACCESIBILIDAD Y CONTRASTE

  Combinación         Ratio de Contraste   Cumple WCAG AA
  ------------------- -------------------- -----------------------------------
  #1A5276 + #FFFFFF   8.2:1                ✅ Sí
  #2E86C1 + #FFFFFF   5.8:1                ✅ Sí
  #2C3E50 + #FFFFFF   12.3:1               ✅ Sí
  #5D6D7E + #FFFFFF   7.1:1                ✅ Sí
  #27AE60 + #FFFFFF   5.2:1                ✅ Sí
  #E74C3C + #FFFFFF   5.1:1                ✅ Sí
  #F39C12 + #FFFFFF   3.2:1                ❌ No (usar sobre fondos oscuros)

------------------------------------------------------------------------

## 4. TIPOGRAFÍA

### 4.1. FUENTE PRINCIPAL

  -------------------------------------------------------------------------------------
  Propiedad                                   Valor
  ------------------------------------------- -----------------------------------------
  **Familia**                                 Inter

  **Alternativas**                            -apple-system, BlinkMacSystemFont, 'Segoe
                                              UI', Roboto, sans-serif

  **Estilos**                                 Regular (400), Medium (500), SemiBold
                                              (600), Bold (700)

  **Descarga**                                https://fonts.google.com/specimen/Inter
  -------------------------------------------------------------------------------------

**Justificación:** Inter es una fuente sans-serif moderna, legible y
optimizada para pantallas. Su elección está justificada por su excelente
legibilidad en diferentes tamaños y su apariencia profesional y limpia.
Diseñada específicamente para interfaces digitales.

### 4.2. ESCALA TIPOGRÁFICA

  ----------------------------------------------------------------------------------------
  Nivel          Tamaño     Peso       Line Height      Letter Spacing       Uso
  -------------- ---------- ---------- ---------------- -------------------- -------------
  **H1**         32px       Bold (700) 1.2              -0.5px               Títulos de
                                                                             pantalla
                                                                             principales

  **H2**         28px       Bold (700) 1.2              -0.3px               Títulos de
                                                                             sección

  **H3**         24px       SemiBold   1.3              -0.2px               Subtítulos de
                            (600)                                            sección

  **H4**         20px       SemiBold   1.3              -0.1px               Encabezados
                            (600)                                            de tarjetas

  **H5**         18px       SemiBold   1.4              0px                  Subtítulos de
                            (600)                                            tarjetas

  **Body Large** 16px       Regular    1.5              0px                  Texto
                            (400)                                            principal

  **Body**       14px       Regular    1.5              0px                  Texto
                            (400)                                            estándar

  **Body Small** 12px       Regular    1.5              0px                  Texto
                            (400)                                            secundario,
                                                                             notas

  **Caption**    12px       Medium     1.4              0.2px                Etiquetas,
                            (500)                                            datos

  **Overline**   10px       Medium     1.4              0.5px                Texto de
                            (500)                                            categoría,
                                                                             badges

  **Button**     14px       Medium     1.2              0.3px                Texto de
                            (500)                                            botones

  **Input**      16px       Regular    1.2              0px                  Texto de
                            (400)                                            inputs
                                                                             (mínimo 16px
                                                                             para evitar
                                                                             zoom en iOS)
  ----------------------------------------------------------------------------------------

### 4.3. ESTILOS DE TEXTO (Text Styles)

  --------------------------------------------------------------------------
  Nombre del Estilo                    Propiedades              Uso
  ------------------------------------ ------------------------ ------------
  **heading-hero**                     32px / Bold / 1.2 /      Título
                                       -0.5px / #2C3E50         principal de
                                                                landing
                                                                pages

  **heading-h1**                       28px / Bold / 1.2 /      Título de
                                       -0.3px / #2C3E50         pantalla

  **heading-h2**                       24px / SemiBold / 1.3 /  Título de
                                       -0.2px / #2C3E50         sección

  **heading-h3**                       20px / SemiBold / 1.3 /  Encabezado
                                       -0.1px / #2C3E50         de tarjeta

  **body-large**                       16px / Regular / 1.5 /   Texto
                                       0px / #2C3E50            principal

  **body**                             14px / Regular / 1.5 /   Texto
                                       0px / #2C3E50            estándar

  **body-secondary**                   14px / Regular / 1.5 /   Texto
                                       0px / #5D6D7E            secundario

  **body-small**                       12px / Regular / 1.5 /   Texto
                                       0px / #5D6D7E            pequeño

  **caption**                          12px / Medium / 1.4 /    Etiquetas y
                                       0.2px / #5D6D7E          datos

  **button**                           14px / Medium / 1.2 /    Texto de
                                       0.3px / #FFFFFF          botones

  **input**                            16px / Regular / 1.2 /   Texto de
                                       0px / #2C3E50            campos de
                                                                entrada

  **link**                             14px / Medium / 1.4 /    Enlaces
                                       0px / #2E86C1            

  **link-hover**                       14px / Medium / 1.4 /    Enlaces en
                                       0px / #1A5276            hover

  **overline**                         10px / Medium / 1.4 /    Texto de
                                       0.5px / #5D6D7E          categoría,
                                                                badges

  **error-text**                       14px / Regular / 1.4 /   Mensajes de
                                       0px / #E74C3C            error

  **success-text**                     14px / Regular / 1.4 /   Mensajes de
                                       0px / #27AE60            éxito
  --------------------------------------------------------------------------

### 4.4. JERARQUÍA VISUAL

    H1 (28px / Bold)
      └─ H2 (24px / SemiBold)
          └─ H3 (20px / SemiBold)
              └─ Body (16px / Regular)
                  └─ Caption (12px / Medium)

### 4.5. ESPACIADO ENTRE LÍNEAS Y LETRAS

  Tipo de Texto     Line Height   Letter Spacing
  ----------------- ------------- -----------------
  Títulos (H1-H3)   1.2 - 1.3     -0.5px a -0.1px
  Cuerpo de texto   1.4 - 1.5     0px
  Etiquetas         1.4           0.2px - 0.5px
  Botones           1.2           0.3px

------------------------------------------------------------------------

## 5. ICONOGRAFÍA

### 5.1. ESTILO DE ICONOS

  Propiedad                  Valor
  -------------------------- ------------------------------------------
  **Estilo**                 Outline / Line (con trazo)
  **Grosor de trazo**        1.5px - 2px
  **Formato**                Vectorial (SVG)
  **Redondeo de esquinas**   Ligeramente redondeadas (cap rounded)
  **Librería recomendada**   Lucide Icons, Feather Icons, o Heroicons

### 5.2. TAMAÑOS DE ICONOS

  Tamaño    Pixeles   Uso
  --------- --------- -----------------------------------------
  **XS**    16px      Íconos en badges, etiquetas
  **S**     20px      Íconos en botones pequeños, enlaces
  **M**     24px      Íconos estándar en botones y navegación
  **L**     28px      Íconos en Bottom Navigation
  **XL**    32px      Íconos de perfil, acciones destacadas
  **XXL**   48px      Íconos de estado, vacío, hero

### 5.3. COLORES DE ICONOS

  Contexto                 Color            Código Hex
  ------------------------ ---------------- ------------
  **Default**              Gris Medio       #5D6D7E
  **Active / Primario**    Azul Profundo    #1A5276
  **Secondary**            Azul Claro       #2E86C1
  **Éxito**                Verde            #27AE60
  **Error**                Rojo             #E74C3C
  **Advertencia**          Amarillo         #F39C12
  **Sobre fondo oscuro**   Blanco           #FFFFFF
  **Disabled**             Gris Muy Claro   #BDC3C7

------------------------------------------------------------------------

## 6. ESPACIADO Y LAYOUT

### 6.1. SISTEMA DE ESPACIADO

  Nombre           Tamaño   Uso
  ---------------- -------- ------------------------------------------
  **spacing-0**    0px      Sin espaciado
  **spacing-1**    4px      Espaciado mínimo entre elementos
  **spacing-2**    8px      Espaciado entre elementos relacionados
  **spacing-3**    12px     Espaciado entre elementos cercanos
  **spacing-4**    16px     Espaciado estándar entre secciones
  **spacing-5**    20px     Espaciado entre elementos de una sección
  **spacing-6**    24px     Espaciado entre secciones principales
  **spacing-8**    32px     Espaciado entre bloques de contenido
  **spacing-10**   40px     Espaciado entre pantallas completas
  **spacing-12**   48px     Espaciado entre bloques grandes
  **spacing-16**   64px     Espaciado entre secciones de página

### 6.2. SISTEMA DE GRID

  Propiedad      Mobile   Tablet   Desktop
  -------------- -------- -------- ---------
  **Columnas**   4        8        12
  **Gutter**     16px     24px     24px
  **Margen**     16px     24px     32px

### 6.3. BREAKPOINTS

  Breakpoint   Ancho             Dispositivo
  ------------ ----------------- --------------------
  **xs**       \< 480px          Teléfonos pequeños
  **sm**       480px - 767px     Teléfonos grandes
  **md**       768px - 1023px    Tablets
  **lg**       1024px - 1279px   Laptops
  **xl**       1280px - 1535px   Desktops
  **2xl**      ≥ 1536px          Pantallas grandes

------------------------------------------------------------------------

## 7. BORDES Y SOMBRAS

### 7.1. BORDER RADIUS

  Nombre             Tamaño   Uso
  ------------------ -------- ---------------------------------------
  **rounded-none**   0px      Sin bordes redondeados
  **rounded-sm**     4px      Elementos pequeños, badges
  **rounded**        8px      Botones, inputs, componentes estándar
  **rounded-lg**     12px     Cards, paneles
  **rounded-xl**     16px     Modales, diálogos
  **rounded-2xl**    24px     Elementos de hero
  **rounded-full**   50%      Avatares, badges circulares

### 7.2. SOMBRAS

  -----------------------------------------------------------------------------------------------------
  Nivel                    Código                                                     Uso
  ------------------------ ---------------------------------------------------------- -----------------
  **none**                 `none`                                                     Sin sombra

  **xs**                   `0 1px 2px rgba(0,0,0,0.05)`                               Elementos muy
                                                                                      sutiles

  **sm**                   `0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)`   Cards, elementos
                                                                                      elevados

  **md**                   `0 4px 12px rgba(0,0,0,0.08)`                              Cards estándar,
                                                                                      paneles

  **lg**                   `0 10px 25px rgba(0,0,0,0.10)`                             Modales, diálogos

  **xl**                   `0 20px 50px rgba(0,0,0,0.12)`                             Elementos de
                                                                                      hero, overlays

  **inner**                `inset 0 2px 4px rgba(0,0,0,0.06)`                         Inputs con fondo
  -----------------------------------------------------------------------------------------------------

### 7.3. BORDES

  -----------------------------------------------------------------------
  Propiedad                         Valor                 Uso
  --------------------------------- --------------------- ---------------
  **Grosor estándar**               1px                   Líneas
                                                          divisorias,
                                                          bordes de
                                                          inputs

  **Grosor destacado**              2px                   Bordes de
                                                          botones
                                                          outline,
                                                          estados de foco

  **Color estándar**                #E2E8F0               Bordes de
                                                          inputs y cards

  **Color de estado**               #E74C3C               Bordes de error

  **Color de foco**                 #1A5276               Bordes de foco
                                                          en inputs
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 8. COMPONENTES BASE

### 8.1. BOTONES

  --------------------------------------------------------------------------------------
  Variante         Fondo          Texto       Borde       Sombra       Uso
  ---------------- -------------- ----------- ----------- ------------ -----------------
  **Primary**      #1A5276        #FFFFFF     Ninguno     sm           Acciones
                                                                       principales

  **Primary        #154360        #FFFFFF     Ninguno     sm           Hover de acciones
  Hover**                                                              principales

  **Primary        #0E3B4F        #FFFFFF     Ninguno     sm           Active de
  Active**                                                             acciones
                                                                       principales

  **Primary        #BDC3C7        #FFFFFF     Ninguno     none         Acciones no
  Disabled**                                                           disponibles

  **Secondary**    Transparente   #1A5276     2px #1A5276 none         Acciones
                                                                       alternativas

  **Secondary      #EBF5FB        #1A5276     2px #1A5276 none         Hover de
  Hover**                                                              secundario

  **Success**      #27AE60        #FFFFFF     Ninguno     sm           Confirmaciones,
                                                                       acciones
                                                                       positivas

  **Danger**       #E74C3C        #FFFFFF     Ninguno     sm           Acciones
                                                                       destructivas
                                                                       (eliminar)

  **Ghost**        Transparente   #1A5276     Ninguno     none         Acciones de bajo
                                                                       énfasis

  **Ghost Hover**  #EBF5FB        #1A5276     Ninguno     none         Hover de ghost

  **Outline**      Transparente   #2E86C1     2px #2E86C1 none         Acciones
                                                                       secundarias
                                                                       destacadas
  --------------------------------------------------------------------------------------

  Tamaño           Padding     Font Size   Border Radius   Min Height
  ---------------- ----------- ----------- --------------- ----------------
  **Small**        6px 12px    12px        6px             32px
  **Medium**       10px 20px   14px        8px             40px
  **Large**        14px 28px   16px        8px             48px
  **Full Width**   \-          \-          \-              100% del ancho

### 8.2. INPUTS Y FORMULARIOS

  -----------------------------------------------------------------------
  Propiedad                                   Valor
  ------------------------------------------- ---------------------------
  **Label**                                   #5D6D7E, 14px, Regular,
                                              margin-bottom 4px

  **Input**                                   Borde 1px solid #E2E8F0,
                                              Border Radius 8px, Padding
                                              12px 16px, Fondo #FFFFFF,
                                              Color #2C3E50

  **Input Focus**                             Borde #1A5276 + sombra 0 0
                                              0 3px rgba(26,82,118,0.15)

  **Input Error**                             Borde #E74C3C + sombra 0 0
                                              0 3px rgba(231,76,60,0.15)

  **Input Disabled**                          Fondo #F4F6F7, texto
                                              #94A3B8, cursor not-allowed

  **Input Placeholder**                       Color #95A5A6

  **Select**                                  Mismo estilo que Input con
                                              flecha desplegable

  **TextArea**                                Mismo estilo que Input,
                                              altura mínima 100px, resize
                                              vertical

  **Helper Text**                             12px, Regular, #5D6D7E,
                                              margin-top 4px

  **Error Text**                              12px, Regular, #E74C3C,
                                              margin-top 4px
  -----------------------------------------------------------------------

### 8.3. CARDS

  Propiedad                Valor
  ------------------------ -------------------------------------------
  **Fondo**                #FFFFFF
  **Border Radius**        12px
  **Sombra**               0 4px 12px rgba(0,0,0,0.08)
  **Padding**              16px
  **Margen entre cards**   16px
  **Border**               Opcional: 1px solid #E2E8F0
  **Variante Destacada**   Borde izquierdo de 4px en color de estado
  **Variante Hover**       Sombra lg + transform translateY(-2px)

### 8.4. BADGES Y ETIQUETAS

  ----------------------------------------------------------------------------------
  Tipo              Fondo          Texto       Borde       Border Radius
  ----------------- -------------- ----------- ----------- -------------------------
  **Primary Solid** #1A5276        #FFFFFF     Ninguno     9999px

  **Primary         Transparente   #1A5276     1px solid   9999px
  Outlined**                                   #1A5276     

  **Éxito**         #27AE60        #FFFFFF     Ninguno     9999px

  **Advertencia**   #F39C12        #FFFFFF     Ninguno     9999px

  **Error**         #E74C3C        #FFFFFF     Ninguno     9999px

  **Información**   #3498DB        #FFFFFF     Ninguno     9999px

  **Neutral**       #F4F6F7        #5D6D7E     Ninguno     9999px
  ----------------------------------------------------------------------------------

  Tamaño       Padding    Font Size
  ------------ ---------- -----------
  **Small**    2px 8px    10px
  **Medium**   4px 12px   12px
  **Large**    6px 16px   14px

### 8.5. TABLAS

  -----------------------------------------------------------------------
  Propiedad                                   Valor
  ------------------------------------------- ---------------------------
  **Cabecera**                                Fondo #1A5276, texto
                                              #FFFFFF, Bold (600),
                                              padding 12px 16px

  **Filas**                                   Fondo alternado: #FFFFFF y
                                              #F4F6F7

  **Hover**                                   Fondo #EBF5FB

  **Padding**                                 12px 16px

  **Border**                                  1px solid #E2E8F0

  **Border Radius**                           8px (esquinas)

  **Densidad Normal**                         padding 12px 16px

  **Densidad Compacta**                       padding 8px 12px
  -----------------------------------------------------------------------

### 8.6. MODALES

  Propiedad                           Valor
  ----------------------------------- --------------------------------
  **Fondo overlay**                   rgba(0,0,0,0.5)
  **Fondo modal**                     #FFFFFF
  **Border Radius**                   16px
  **Padding**                         24px
  **Ancho máximo (Mobile)**           90%
  **Ancho máximo (Tablet/Desktop)**   500px
  **Sombra**                          xl
  **Header**                          Título en H3 + botón cerrar
  **Footer**                          Botones alineados a la derecha
  **Separación**                      8px entre botones

### 8.7. TOAST NOTIFICATIONS

  Propiedad               Valor
  ----------------------- ------------------------------------
  **Posición (Mobile)**   Bottom, centrado
  **Posición (Web)**      Top Right
  **Fondo**               Según tipo (ver colores de estado)
  **Color de texto**      #FFFFFF
  **Padding**             12px 20px
  **Border Radius**       8px
  **Sombra**              lg
  **Duración**            3000ms
  **Icono**               Icono correspondiente al tipo

  Tipo          Fondo     Icono
  ------------- --------- -------
  **Success**   #27AE60   ✓
  **Error**     #E74C3C   ✗
  **Warning**   #F39C12   ⚠
  **Info**      #3498DB   ℹ

### 8.8. ALERT BANNERS

  Propiedad             Valor
  --------------------- ---------------------------------------------
  **Fondo**             #EBF5FB (o color correspondiente al tipo)
  **Borde izquierdo**   4px solid #3498DB (o color correspondiente)
  **Padding**           12px 16px
  **Border Radius**     8px
  **Texto**             #2C3E50, 14px
  **Acción**            Link "Revisar" en azul

### 8.9. LOADING SPINNER

  Propiedad               Valor
  ----------------------- --------------------
  **Tamaño (Grande)**     48px
  **Tamaño (Mediano)**    32px
  **Tamaño (Pequeño)**    20px
  **Color**               #1A5276
  **Fondo del círculo**   #E2E8F0
  **Grosor del borde**    3px
  **Animación**           Rotación constante

### 8.10. PROGRESS BAR

  Propiedad                Valor
  ------------------------ ---------------------------
  **Fondo del track**      #E2E8F0
  **Fondo del progreso**   #1A5276
  **Altura**               8px
  **Border Radius**        4px
  **Label**                Encima o dentro del track

### 8.11. TABS

  Propiedad             Valor
  --------------------- -------------------------------------------------
  **Tab inactive**      Texto #5D6D7E, padding 8px 16px
  **Tab active**        Texto #1A5276, borde inferior 2px solid #1A5276
  **Tab hover**         Texto #1A5276, fondo #EBF5FB
  **Border inferior**   1px solid #E2E8F0

### 8.12. DROPDOWNS

  -----------------------------------------------------------------------
  Propiedad                                   Valor
  ------------------------------------------- ---------------------------
  **Trigger**                                 Botón estilo Input con
                                              flecha hacia abajo

  **Menu**                                    Fondo #FFFFFF,
                                              border-radius 8px, sombra
                                              lg, overflow auto

  **Item**                                    Padding 8px 16px, hover
                                              #EBF5FB

  **Item active**                             Fondo #EBF5FB, texto
                                              #1A5276

  **Divider**                                 Borde 1px solid #E2E8F0
  -----------------------------------------------------------------------

### 8.13. TOOLTIPS

  Propiedad           Valor
  ------------------- -------------------------------------------
  **Fondo**           #2C3E50
  **Texto**           #FFFFFF, 12px, Regular
  **Padding**         4px 8px
  **Border Radius**   4px
  **Flecha**          Triángulo en la dirección correspondiente

### 8.14. CHECKBOXES Y RADIOS

  Propiedad                      Valor
  ------------------------------ -----------------------------------
  **Tamaño**                     20px x 20px
  **Checked**                    Fondo #1A5276, check blanco
  **Unchecked**                  Borde #94A3B8, fondo transparente
  **Disabled**                   Fondo #F4F6F7, borde #BDC3C7
  **Label**                      16px, Regular, #2C3E50
  **Border Radius (Checkbox)**   4px
  **Border Radius (Radio)**      50%

### 8.15. TOGGLES (SWITCH)

  Propiedad           Valor
  ------------------- ------------------------------
  **Ancho**           40px
  **Altura**          24px
  **Border Radius**   9999px
  **Fondo Off**       #BDC3C7
  **Fondo On**        #1A5276
  **Handle**          Círculo blanco, 18px, sombra
  **Animación**       Transición suave

------------------------------------------------------------------------

## 9. COMPONENTES DE NAVEGACIÓN

### 9.1. APPBAR (MOBILE)

  -----------------------------------------------------------------------
  Propiedad                                   Valor
  ------------------------------------------- ---------------------------
  **Ubicación**                               Parte superior de todas las
                                              pantallas móviles

  **Altura**                                  56px

  **Fondo**                                   #1A5276

  **Color de texto**                          #FFFFFF

  **Logo**                                    Izquierda, 32px de alto,
                                              padding-left 16px

  **Título**                                  Centro, H5 (18px),
                                              SemiBold, #FFFFFF

  **Perfil**                                  Derecha, círculo 36px,
                                              padding-right 16px

  **Notificaciones**                          Derecha, junto al perfil,
                                              badge con número

  **Botón atrás**                             Izquierda, junto al logo
                                              (en pantallas secundarias)

  **Sombra**                                  Sombra sm
  -----------------------------------------------------------------------

### 9.2. TOPBAR (WEB)

  Propiedad            Valor
  -------------------- --------------------------------------------
  **Ubicación**        Parte superior, junto al Sidebar
  **Altura**           64px
  **Fondo**            #FFFFFF
  **Color de texto**   #2C3E50
  **Logo**             Izquierda, 32px de alto, padding-left 24px
  **Título**           Izquierda, después del logo, H3 (20px)
  **Perfil**           Derecha, círculo 40px, padding-right 24px
  **Notificaciones**   Derecha, junto al perfil
  **Sombra**           0 2px 8px rgba(0,0,0,0.06)

### 9.3. BOTTOM NAVIGATION (MOBILE)

  Propiedad             Valor
  --------------------- -----------------------------------------------
  **Ubicación**         Parte inferior de todas las pantallas móviles
  **Altura**            64px
  **Fondo**             #FFFFFF
  **Borde superior**    1px solid #E2E8F0
  **Número de ítems**   4-5
  **Ítems**             Ícono + etiqueta
  **Ícono tamaño**      24px
  **Etiqueta**          10px, Medium, 0.5px spacing
  **Estado Active**     Ícono y texto #1A5276, SemiBold
  **Estado Inactive**   Ícono y texto #94A3B8, Regular
  **Padding**           4px 0

### 9.4. SIDEBAR (WEB)

  Propiedad             Valor
  --------------------- --------------------------------------
  **Ubicación**         Izquierda, altura completa
  **Ancho**             240px
  **Ancho colapsado**   64px
  **Fondo**             #1A5276
  **Color de texto**    #FFFFFF
  **Logo**              Superior, 40px de alto, padding 16px
  **Ítems**             Icono + texto, padding 12px 16px
  **Ítem activo**       Fondo #2E86C1
  **Ítem hover**        Fondo rgba(255,255,255,0.1)
  **Icono tamaño**      20px
  **Texto**             14px, Medium
  **Perfil**            Inferior, padding 16px

------------------------------------------------------------------------

## 10. ESTADOS Y FEEDBACK

### 10.1. ESTADOS DE INPUT

  Estado         Descripción            Visual
  -------------- ---------------------- ----------------------------------
  **Default**    Estado normal          Borde #E2E8F0
  **Focused**    Campo seleccionado     Borde #1A5276 + sombra azul
  **Hover**      Mouse sobre el campo   Borde #94A3B8
  **Filled**     Campo con contenido    Borde #1A5276
  **Disabled**   Campo deshabilitado    Fondo #F4F6F7, texto #94A3B8
  **Error**      Campo con error        Borde #E74C3C + mensaje de error
  **Success**    Campo válido           Borde #27AE60

### 10.2. ESTADOS DE CARGA

  Estado             Visual                        Uso
  ------------------ ----------------------------- -------------------------------
  **Spinner**        Círculo rotando               Carga indeterminada
  **Progress Bar**   Barra de progreso             Carga con progreso conocido
  **Skeleton**       Rectángulos grises animados   Carga de contenido
  **Shimmer**        Skeleton con brillo           Carga de contenido con efecto

### 10.3. ESTADOS VACÍOS

  -----------------------------------------------------------------------
  Estado              Descripción                     Visual
  ------------------- ------------------------------- -------------------
  **Sin datos**       No hay elementos para mostrar   Icono grande +
                                                      mensaje + acción

  **Sin resultados**  Búsqueda sin resultados         Icono + mensaje +
                                                      sugerencia

  **Sin               No hay notificaciones           Icono + mensaje
  notificaciones**                                    
  -----------------------------------------------------------------------

### 10.4. ESTADOS DE ERROR

  -----------------------------------------------------------------------
  Estado              Descripción                     Visual
  ------------------- ------------------------------- -------------------
  **Error de          Campo inválido                  Borde rojo +
  formulario**                                        mensaje de error

  **Error de          Fallo de red                    Banner de error +
  conexión**                                          botón reintentar

  **Error 404**       Página no encontrada            Página de error +
                                                      enlace a inicio

  **Error 500**       Error del servidor              Página de error +
                                                      enlace a inicio
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 11. ACCESIBILIDAD

### 11.1. CONTRASTE DE COLOR

  Combinación         Ratio    Cumple WCAG AA
  ------------------- -------- -----------------------------------
  #1A5276 + #FFFFFF   8.2:1    ✅ Sí
  #2E86C1 + #FFFFFF   5.8:1    ✅ Sí
  #2C3E50 + #FFFFFF   12.3:1   ✅ Sí
  #5D6D7E + #FFFFFF   7.1:1    ✅ Sí
  #27AE60 + #FFFFFF   5.2:1    ✅ Sí
  #E74C3C + #FFFFFF   5.1:1    ✅ Sí
  #F39C12 + #FFFFFF   3.2:1    ❌ No (usar sobre fondos oscuros)

### 11.2. TAMAÑOS DE TOUCH TARGET

  Elemento                  Tamaño Mínimo
  ------------------------- ----------------------------
  **Botones en mobile**     44x44px (48px recomendado)
  **Enlaces en mobile**     44x44px
  **Ítems de lista**        44px de alto
  **Inputs**                44px de alto
  **Checkboxes y Radios**   44x44px (área táctil)

### 11.3. FOCUS STATES

  Propiedad             Valor
  --------------------- ----------------------------------
  **Outline**           2px solid #1A5276
  **Outline offset**    2px
  **Sombra de focus**   0 0 0 3px rgba(26,82,118,0.25)
  **Visible en**        Todos los elementos interactivos

------------------------------------------------------------------------

## 12. TOKENS DE DISEÑO (DESIGN TOKENS)

### 12.1. TOKENS DE COLOR

``` json
{
  "color": {
    "primary": {
      "500": "#1A5276",
      "600": "#154360",
      "700": "#0E3B4F",
      "100": "#EBF5FB"
    },
    "secondary": {
      "500": "#2E86C1",
      "600": "#2471A3",
      "100": "#D6EAF8"
    },
    "success": {
      "500": "#27AE60",
      "100": "#D5F5E3"
    },
    "error": {
      "500": "#E74C3C",
      "100": "#FDEDEC"
    },
    "warning": {
      "500": "#F39C12",
      "100": "#FEF9E7"
    },
    "info": {
      "500": "#3498DB",
      "100": "#EBF5FB"
    },
    "neutral": {
      "900": "#2C3E50",
      "800": "#34495E",
      "600": "#5D6D7E",
      "400": "#95A5A6",
      "300": "#BDC3C7",
      "200": "#E2E8F0",
      "100": "#F4F6F7",
      "0": "#FFFFFF"
    }
  }
}
```

### 12.2. TOKENS DE TIPOGRAFÍA

``` json
{
  "typography": {
    "fontFamily": "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    "heading-hero": {
      "fontSize": "32px",
      "fontWeight": "700",
      "lineHeight": "1.2",
      "letterSpacing": "-0.5px",
      "color": "#2C3E50"
    },
    "heading-h1": {
      "fontSize": "28px",
      "fontWeight": "700",
      "lineHeight": "1.2",
      "letterSpacing": "-0.3px",
      "color": "#2C3E50"
    },
    "heading-h2": {
      "fontSize": "24px",
      "fontWeight": "600",
      "lineHeight": "1.3",
      "letterSpacing": "-0.2px",
      "color": "#2C3E50"
    },
    "heading-h3": {
      "fontSize": "20px",
      "fontWeight": "600",
      "lineHeight": "1.3",
      "letterSpacing": "-0.1px",
      "color": "#2C3E50"
    },
    "body-large": {
      "fontSize": "16px",
      "fontWeight": "400",
      "lineHeight": "1.5",
      "letterSpacing": "0px",
      "color": "#2C3E50"
    },
    "body": {
      "fontSize": "14px",
      "fontWeight": "400",
      "lineHeight": "1.5",
      "letterSpacing": "0px",
      "color": "#2C3E50"
    },
    "body-secondary": {
      "fontSize": "14px",
      "fontWeight": "400",
      "lineHeight": "1.5",
      "letterSpacing": "0px",
      "color": "#5D6D7E"
    },
    "caption": {
      "fontSize": "12px",
      "fontWeight": "500",
      "lineHeight": "1.4",
      "letterSpacing": "0.2px",
      "color": "#5D6D7E"
    },
    "button": {
      "fontSize": "14px",
      "fontWeight": "500",
      "lineHeight": "1.2",
      "letterSpacing": "0.3px"
    }
  }
}
```

### 12.3. TOKENS DE ESPACIADO

``` json
{
  "spacing": {
    "0": "0px",
    "1": "4px",
    "2": "8px",
    "3": "12px",
    "4": "16px",
    "5": "20px",
    "6": "24px",
    "8": "32px",
    "10": "40px",
    "12": "48px",
    "16": "64px"
  },
  "borderRadius": {
    "none": "0px",
    "sm": "4px",
    "base": "8px",
    "lg": "12px",
    "xl": "16px",
    "2xl": "24px",
    "full": "50%"
  },
  "shadow": {
    "none": "none",
    "sm": "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)",
    "md": "0 4px 12px rgba(0,0,0,0.08)",
    "lg": "0 10px 25px rgba(0,0,0,0.10)",
    "xl": "0 20px 50px rgba(0,0,0,0.12)",
    "inner": "inset 0 2px 4px rgba(0,0,0,0.06)"
  },
  "breakpoints": {
    "xs": "0px",
    "sm": "480px",
    "md": "768px",
    "lg": "1024px",
    "xl": "1280px",
    "2xl": "1536px"
  }
}
```

------------------------------------------------------------------------

## 13. HISTORIAL DE CAMBIOS

  -----------------------------------------------------------------------
  Versión             Fecha           Autor           Cambios
  ------------------- --------------- --------------- -------------------
  1.0.0               28 de junio de  Mathias         Creación inicial de
                      2026            Fernández       la guía de estilos

  2.0.0               8 de julio de   Mathias         Actualización
                      2026            Fernández       completa: nuevos
                                                      colores, tipografía
                                                      Inter, componentes
                                                      base, tokens de
                                                      diseño,
                                                      accesibilidad
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 14. DOCUMENTOS RELACIONADOS

  ---------------------------------------------------------------------------------------------------------------------------
  Documento                Descripción                                                                      Enlace
  ------------------------ -------------------------------------------------------------------------------- -----------------
  Project Overview         Visión ejecutiva del proyecto                                                    

  Contextos Delimitados    Definición de bounded contexts                                                   

  Modelo de Dominio        Entidades, servicios y eventos del dominio                                       

  Modelo de Datos          Diagrama ER y diccionario de datos                                               

  Guía de Implementación   Cómo implementar estos estilos en código                                         
  Frontend                                                                                                  

  Link de Figma            https://www.figma.com/design/QP7j0vEb0PARyGZwJ7LUPl/M3Motors---Guía-de-Estilos   
  ---------------------------------------------------------------------------------------------------------------------------

------------------------------------------------------------------------

Esta guía constituye la especificación completa de estilos visuales del
sistema M3Motors. Todos los componentes, colores y estilos aquí
definidos deben ser implementados de manera consistente en toda la
plataforma.
