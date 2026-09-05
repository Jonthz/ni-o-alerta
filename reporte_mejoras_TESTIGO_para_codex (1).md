# TESTIGO — Reporte de mejoras y guía de evaluación para Codex

## 0. Objetivo de este documento

Este documento sirve para que Codex **audite la aplicación actual de TESTIGO antes de modificarla**.

La prioridad no es agregar más funciones por agregar. Primero hay que identificar:

1. qué ya está implementado;
2. qué está parcialmente implementado;
3. qué contradice el concepto actual del proyecto;
4. qué falta para que el MVP sea demostrable, coherente y creíble durante el hackathon.

> **Regla para Codex:** no asumir que una función está ausente. Revisar el repositorio primero y citar archivos/componentes relevantes antes de proponer cambios.

---

# 1. Definición actual recomendada del producto

## TESTIGO

**Una capa de evidencia comunitaria que documenta cómo evoluciona una amenaza, corrobora observaciones independientes y conecta esa evidencia con los canales de respuesta adecuados. Si se pierde Internet, preserva localmente la información hasta recuperar conectividad.**

### Los 3 pilares recomendados

1. **Evidencia** — documentar qué está cambiando en el territorio.
2. **Corroboración** — determinar si varias observaciones independientes apuntan al mismo evento.
3. **Trazabilidad** — saber si el reporte fue enviado, escalado y qué ocurrió después.

### Flujo conceptual

```text
OBSERVAR
   ↓
REGISTRAR EVIDENCIA
   ↓
CORROBORAR
   ↓
GENERAR EXPEDIENTE
   ↓
ESCALAR AL CANAL ADECUADO
   ↓
HACER SEGUIMIENTO
```

TESTIGO **no debe venderse como predictor de deslizamientos**, ni como sustituto de ECU 911, COE, GAD, INAMHI u otros sistemas oficiales.

---

# 2. Instrucciones de auditoría para Codex

Antes de tocar código, generar un diagnóstico con esta tabla:

| Área | Estado | Evidencia en código | Riesgo / problema | Cambio sugerido | Prioridad | Esfuerzo |
|---|---|---|---|---|---|---|
| Reporte ciudadano | Implementado / parcial / ausente | archivo/componente | ... | ... | P0/P1/P2 | Bajo/Medio/Alto |
| Modo emergencia | ... | ... | ... | ... | ... | ... |
| Offline/PWA | ... | ... | ... | ... | ... | ... |
| Corroboración | ... | ... | ... | ... | ... | ... |
| Mapa | ... | ... | ... | ... | ... | ... |
| Privacidad | ... | ... | ... | ... | ... | ... |
| Backend/sincronización | ... | ... | ... | ... | ... | ... |
| Roles | ... | ... | ... | ... | ... | ... |
| Expediente/seguimiento | ... | ... | ... | ... | ... | ... |
| InSAR | ... | ... | ... | ... | ... | ... |

Después del diagnóstico, proponer un plan de cambios **mínimo y priorizado**. Evitar reescribir componentes que ya funcionan correctamente.

---

# 3. Mejora P0 — Separar claramente Vigilancia y Emergencia

La aplicación debe tratar estos dos casos como experiencias distintas.

## 3.1 Modo Vigilancia

Uso normal durante días, semanas o meses.

### Objetivo

Construir evidencia longitudinal de señales observables:

- grietas;
- hundimientos;
- inclinación de postes;
- aparición de agua;
- saturación del suelo;
- daños progresivos;
- cambios visibles en una vivienda, vía o talud.

### Flujo mínimo

```text
Reportar observación
→ ubicación
→ foto opcional
→ descripción o voz opcional
→ guardar
→ mostrar folio TESTIGO
→ agrupar con observaciones cercanas
→ actualizar línea temporal
```

## 3.2 Modo Emergencia

Uso cuando el evento está ocurriendo o existe peligro inmediato.

### Flujo recomendado

```text
EMERGENCIA AHORA
→ registrar ubicación + precisión GPS + timestamp local
→ confirmar al usuario que la señal fue registrada localmente
→ si hay conectividad: ofrecer acceso inmediato al canal oficial de emergencia
→ después, solo si es seguro: pedir foto/video/información adicional
```

### Regla crítica

**Nunca retrasar una acción de emergencia esperando una foto, video, formulario largo o validación de terceros.**

---

# 4. Mejora P0 — No confundir TESTIGO con un canal oficial

La aplicación debe diferenciar explícitamente:

- **Folio TESTIGO**: identificador interno del reporte.
- **Caso oficial**: identificador generado por el canal institucional correspondiente, si existe integración o si el usuario lo registra posteriormente.

## Recomendación UX

Mostrar estados separados:

```text
Reporte TESTIGO #T-2026-00182
Estado: corroborado comunitariamente

Caso institucional: no registrado
[Registrar número de caso]
```

O:

```text
Reporte TESTIGO #T-2026-00182
Caso institucional #XXXXXX
Última actualización registrada: 05/09/2026 10:22
```

### No hacer

No mostrar algo como:

> "47 días sin respuesta del GAD"

si TESTIGO no puede demostrar que el caso realmente fue recibido por el GAD.

### Sí hacer

Medir trazabilidad sobre hechos verificables:

- fecha del reporte TESTIGO;
- fecha en que el usuario indicó que fue enviado;
- número de caso oficial si existe;
- fecha de última actualización;
- estado conocido.

---

# 5. Mejora P0 — Corroborar eventos, no calificar personas

## Problema actual

El concepto de "reputación del reportante" puede generar sesgo y perjudicar a:

- usuarios nuevos;
- comunidades con menor uso digital;
- personas que solo reportan cuando ocurre algo grave.

## Cambio recomendado

Eliminar o minimizar la reputación individual como factor de credibilidad.

Evaluar **la evidencia del evento**, no a la persona.

### Señales útiles de corroboración

- múltiples dispositivos independientes;
- distancia entre reportes;
- ventana temporal;
- coincidencia de categoría;
- fotografías del mismo punto en diferentes fechas;
- coincidencia con lluvia, datos oficiales o capas geoespaciales;
- confirmación posterior por promotor/brigadista.

### Estados sugeridos

```text
REGISTRADO
CORROBORADO COMUNITARIAMENTE
REQUIERE VERIFICACIÓN
ESCALADO
EN ATENCIÓN
CERRADO
```

### Importante

Un reporte de un usuario nuevo **sigue siendo válido**.

Un único reporte debe etiquetarse como:

> "Registrado — aún no corroborado"

No como:

> "Poco confiable"

---

# 6. Mejora P0 — Corregir el concepto de offline

## Lo que realmente debe significar "funciona sin Internet"

La PWA puede:

- abrirse sin conexión si fue cacheada previamente;
- guardar nuevos reportes localmente;
- conservar timestamp y ubicación;
- mostrar reportes/cache local;
- poner datos en una cola de sincronización;
- sincronizar cuando regrese la conectividad.

## Lo que NO significa

Una PWA offline **no crea automáticamente una red mesh entre teléfonos**.

No asumir:

```text
Teléfono A ↔ Teléfono B ↔ Teléfono C
```

si no existe una implementación explícita de Bluetooth, Wi-Fi Direct, LoRa, SMS u otra capa de transporte.

### Requisitos para Codex

Verificar si existen:

- service worker;
- app shell cacheado;
- IndexedDB u otro almacenamiento persistente;
- cola de reportes pendientes;
- reintentos de sincronización;
- indicador visible `Sin conexión`;
- indicador visible `Pendiente de sincronizar`;
- prevención de duplicados al reintentar.

### UX recomendada

```text
✓ Guardado en este dispositivo
⚠ Sin conexión
⟳ Se enviará automáticamente al recuperar Internet
```

### Limitación que debe mantenerse explícita

Si el dispositivo nunca recupera ningún canal de comunicación, el servidor no puede conocer ese reporte.

No ocultar esta limitación.

---

# 7. Mejora P0 — Backend y sincronización multiusuario

El concepto de TESTIGO incluye:

- reportes de diferentes personas;
- corroboración por proximidad;
- panel de operador/promotor;
- mapa compartido;
- sincronización entre dispositivos.

Esto entra en conflicto con una arquitectura completamente "sin backend" si se desea que funcione de verdad entre dispositivos.

## Codex debe verificar

1. ¿Existe backend?
2. ¿Dónde se almacenan reportes compartidos?
3. ¿Cómo recibe el dashboard los reportes de otros usuarios?
4. ¿Cómo se resuelven conflictos de sincronización?
5. ¿Cómo se autentican roles?
6. ¿Cómo se evita crear dos veces el mismo reporte durante reconexión?

## Para el hackathon

Dos alternativas aceptables:

### Opción A — MVP real multiusuario

Backend mínimo, por ejemplo:

- Supabase;
- Firebase;
- API mínima propia.

### Opción B — Simulación explícita

Si no hay backend, el demo debe declarar claramente que los demás dispositivos/reportes están simulados.

**No presentar sincronización multiusuario simulada como funcionalidad real.**

---

# 8. Mejora P1 — Mapa y privacidad

Sí, TESTIGO puede tener un mapa, pero deben existir diferentes niveles de visibilidad.

## Usuario comunitario

Puede ver:

- sus propios reportes;
- zonas agregadas;
- eventos corroborados del sector;
- información pública relevante.

## Promotor / brigadista

Puede ver, según permisos:

- reportes del sector;
- viviendas previamente registradas;
- estados de atención;
- puntos que requieren verificación.

## Operador / autoridad

Puede ver:

- detalle operativo;
- reportes georreferenciados;
- expedientes;
- clusters/eventos;
- estados de seguimiento.

## No recomendado

Mostrar públicamente en un mapa:

- ubicación exacta de viviendas vulnerables;
- nombres completos;
- teléfono;
- identidad de la persona que reportó;
- "última posición" individual sin control de acceso.

---

# 9. Mejora P1 — Evitar el lenguaje de "riesgo geotécnico" si no hay modelo validado

TESTIGO no debe mostrar algo como:

> Riesgo de deslizamiento: 87%

salvo que exista un modelo geotécnico validado para producir esa cifra.

## En su lugar medir

### Índice de evidencia / urgencia de verificación

Puede considerar:

- número de observaciones independientes;
- crecimiento de una señal en el tiempo;
- proximidad entre reportes;
- recencia;
- presencia de alerta oficial;
- lluvia acumulada;
- información geoespacial complementaria.

Este índice debe etiquetarse claramente como:

> "Prioridad de verificación"

No como:

> "Probabilidad de deslizamiento"

---

# 10. Mejora P1 — InSAR / Sentinel-1 como contexto, no como requisito

## Papel correcto

La capa InSAR puede ayudar a mostrar deformación lenta del terreno y aportar contexto histórico/geoespacial.

## No debe

- bloquear un reporte ciudadano;
- invalidar una emergencia;
- ser requisito para escalar una señal;
- presentarse como detección en tiempo real.

## Requisitos UX

Mostrar siempre:

- fecha de adquisición/procesamiento;
- estado `dato reciente` / `dato desactualizado`;
- leyenda clara de que es una capa complementaria.

### Regla

Si un reporte ciudadano indica emergencia y la capa InSAR no muestra cambio:

**el reporte sigue existiendo y se procesa normalmente.**

InSAR puede sumar contexto, no restar legitimidad automáticamente.

---

# 11. Mejora P1 — Última señal de emergencia, no "persona viva"

Evitar frases como:

> "Mapa de última posición conocida de personas vivas"

porque TESTIGO no puede saber si una persona continúa viva ni rastrear continuamente su posición.

## Terminología recomendada

> **Mapa de últimas señales de emergencia recibidas, con ubicación y hora de emisión.**

Campos útiles:

- timestamp de emisión original;
- timestamp de recepción en servidor;
- precisión GPS;
- dispositivo pseudonimizado;
- tipo de señal;
- estado de corroboración;
- última actualización.

---

# 12. Mejora P1 — Confirmación de emergencia

Cuando el usuario active emergencia:

1. registrar inmediatamente la señal;
2. confirmar visualmente que fue guardada;
3. indicar si está pendiente de sincronización;
4. ofrecer acceso rápido al canal oficial;
5. solo después solicitar evidencia adicional.

### Ejemplo UX

```text
SEÑAL REGISTRADA
05/09/2026 — 11:43:12
Ubicación guardada

Estado: enviada / pendiente de conexión

[CONTACTAR EMERGENCIAS]

Si estás en un lugar seguro:
[Agregar foto] [Agregar video] [Agregar nota de voz]
```

---

# 13. Mejora P1 — WhatsApp comunitario

Permitir compartir un reporte con el grupo de la comunidad puede ser útil y no necesariamente redundante.

## Diferenciar dos acciones

### Acción 1 — Reportar a TESTIGO

Crea evidencia estructurada y trazable.

### Acción 2 — Compartir con mi comunidad

Genera un mensaje preparado con:

- categoría;
- sector;
- hora;
- enlace o referencia del reporte;
- recomendación de acudir a canales oficiales en emergencia.

## Importante

WhatsApp no debe sustituir la trazabilidad interna ni el canal oficial de emergencia.

No implementar una integración ficticia si no existe API/webhook real.

---

# 14. Mejora P1 — Rol de promotor / brigadista

Este rol sí puede ser un diferenciador útil si se orienta a gestión comunitaria territorial.

## Capacidades recomendadas

- ver puntos pendientes de verificación;
- confirmar observaciones en campo;
- marcar vivienda/sector como:
  - verificado;
  - evacuado;
  - sin contacto;
  - afectado;
  - requiere asistencia;
- consultar datos previamente cacheados;
- sincronizar resultados al recuperar conexión;
- visualizar historial de un punto.

## Regla

No dar al promotor poderes equivalentes a una autoridad oficial si no corresponde.

---

# 15. Mejora P1 — Alertas y colores

Evitar generar un sistema propio de:

```text
Verde
Amarillo
Naranja
Rojo
```

si esos colores pueden confundirse con niveles oficiales de alerta.

## Estados de producto recomendados

```text
Registrado
Corroborado
Requiere verificación
Escalado
Caso institucional registrado
En atención
Cerrado
```

Si se muestra una alerta oficial, debe identificarse claramente como **alerta oficial externa**, separada del estado interno del reporte.

---

# 16. Mejora P1 — Fotografías y visión por computadora

En el MVP, las fotografías deben tratarse principalmente como **evidencia**.

## Casos de uso razonables

- agrupar imágenes del mismo lugar;
- ordenar cronológicamente;
- comparar "antes / después";
- detectar duplicados;
- validar que existe contenido visual utilizable;
- eventualmente ocultar rostros/placas por privacidad.

## No prometer

- diagnóstico geotécnico automático;
- clasificación automática de peligro;
- predicción de colapso desde una foto.

### Momento de demo recomendado

```text
ENERO → grieta pequeña
FEBRERO → grieta mayor
MARZO → múltiples viviendas cercanas reportan cambios
```

Mensaje:

> **Una red social ve fotografías aisladas. TESTIGO ve una evolución documentada.**

---

# 17. Mejora P1 — Expediente comunitario

Este puede ser uno de los componentes más fuertes de TESTIGO.

## Un expediente debería contener

- ID TESTIGO;
- sector;
- punto/área geográfica;
- fecha del primer reporte;
- fecha del último reporte;
- número de observaciones independientes;
- línea temporal fotográfica;
- categorías observadas;
- reportes de promotor;
- contexto ambiental disponible;
- estado de corroboración;
- estado de escalamiento;
- número de caso institucional, si existe;
- historial de cambios.

## Exportación potencial

Para demo puede existir:

- vista imprimible;
- PDF/JSON posterior;
- resumen copiable para canal institucional.

No es obligatorio implementar exportación completa si compromete el MVP.

---

# 18. Mejora P1 — Métricas de producto

Evitar métricas vagas como "accuracy de la IA" si no existe un modelo central de predicción.

## Métrica principal sugerida

### Tiempo desde la primera observación hasta el escalamiento

```text
T_escalamiento = timestamp_escalado - timestamp_primera_observacion
```

## Métricas secundarias

- tiempo hasta corroboración;
- número de observaciones independientes por evento;
- porcentaje de reportes geolocalizados;
- porcentaje de reportes sincronizados con éxito;
- tiempo promedio en cola offline;
- número de duplicados detectados;
- porcentaje de expedientes con seguimiento;
- tiempo desde escalamiento hasta primera actualización registrada;
- porcentaje de usuarios capaces de completar el reporte sin escribir texto;

## Importante

TESTIGO puede medir **su propio tiempo de procesamiento y escalamiento**.

No debe prometer reducir a 72 horas una obra o respuesta institucional que está fuera de su control.

---

# 19. Mejora P1 — Necesidades reales de comunidad

El software debe priorizar simplicidad y baja fricción.

## Principios UX

- dos acciones principales claramente visibles:
  - `REPORTAR OBSERVACIÓN`
  - `EMERGENCIA AHORA`
- botones grandes;
- texto corto;
- uso de iconos;
- entrada por voz opcional;
- no exigir texto largo;
- no exigir historial previo;
- consumo bajo de datos;
- funcionar en teléfonos de gama baja;
- feedback inmediato;
- accesibilidad visual y auditiva;
- no pedir permisos innecesarios.

### Principio

> **A veces lo minimalista es lo que realmente ayuda a la comunidad.**

Codex debe identificar pantallas, campos o pasos que no aporten al flujo principal y proponer simplificación.

---

# 20. Mejora P2 — Evacuación

No implementar un motor autónomo de rutas de evacuación si no existen:

- puntos seguros validados;
- vías actualizadas;
- restricciones oficiales;
- datos suficientes para saber si una ruta continúa transitable.

## Para el MVP

TESTIGO puede mostrar:

- puntos de encuentro oficiales previamente cargados;
- instrucciones oficiales cacheadas;
- contactos de emergencia;
- información del sector.

No presentar una ruta generada automáticamente como "ruta segura" sin datos confiables.

---

# 21. Mejora P2 — Comunicación alternativa futura

La limitación de zonas sin cobertura permanente es real.

No es necesario resolverla en dos días.

## Roadmap posible

Diseñar una abstracción futura de transporte:

```text
Report
  ↓
Transport Adapter
  ├─ Internet/API
  ├─ SMS
  ├─ LoRa gateway
  ├─ Bluetooth/Wi-Fi Direct
  └─ radio/otro canal
```

Para el hackathon implementar solo el canal real disponible y declarar los demás como roadmap.

No simular una mesh network como si estuviera implementada.

---

# 22. Benchmark / soluciones actuales que Codex debe considerar conceptualmente

No es necesario integrarlas sin API disponible, pero sí evitar duplicar su propósito.

## ECU 911

Canal oficial de atención de emergencias.

TESTIGO debe complementarlo, no reemplazarlo.

## 181 Responde / canales municipales

Pueden existir canales para solicitudes, derivación y seguimiento municipal.

TESTIGO puede aportar mejor estructuración de evidencia y trazabilidad.

## ESPOL Alert

Ya existen patrones como:

- botón de alerta;
- geolocalización;
- brigadistas;
- comunicación rápida.

Por tanto, el diferenciador de TESTIGO no debería ser simplemente "tenemos un botón de pánico".

## Redes sociales y WhatsApp

Son los canales naturales donde hoy circula la evidencia comunitaria.

TESTIGO debe convertir información dispersa en historial estructurado y trazable.

---

# 23. Qué NO debe prometer TESTIGO

Codex debe buscar textos de interfaz, README, tooltips y componentes que hagan estas afirmaciones y marcarlos para revisión.

Evitar:

- "predecimos deslizamientos";
- "detectamos automáticamente cuándo va a caer un cerro";
- "funciona sin ningún tipo de red";
- "sabemos dónde están las personas vivas";
- "nuestro nivel rojo significa evacuación";
- "el sistema reemplaza al COE";
- "el algoritmo decide evacuar";
- "InSAR confirma una emergencia en tiempo real";
- "un folio TESTIGO equivale a un caso municipal";
- "cada reporte público muestra ubicación exacta";
- "ningún otro sistema hace esto".

---

# 24. Modelo de datos mínimo sugerido

Codex debe comparar esta propuesta con el modelo actual y reutilizar lo que ya exista.

## Report

```ts
interface Report {
  id: string;
  deviceId: string;          // pseudónimo, no IMEI
  userId?: string;
  type: 'observation' | 'emergency';
  category: string;

  createdAtLocal: string;
  receivedAtServer?: string;

  latitude: number;
  longitude: number;
  gpsAccuracy?: number;

  text?: string;
  voiceUrl?: string;
  mediaUrls?: string[];

  syncStatus: 'local' | 'pending' | 'synced' | 'failed';
  evidenceStatus: 'registered' | 'corroborated' | 'needs_verification';

  clusterId?: string;
  officialCaseId?: string;
  officialCaseStatus?: string;

  createdByRole: 'resident' | 'promoter' | 'operator';
}
```

## EventCluster

```ts
interface EventCluster {
  id: string;
  category: string;
  centroidLat: number;
  centroidLng: number;
  radiusMeters: number;

  firstSeenAt: string;
  lastSeenAt: string;

  reportsCount: number;
  independentDevicesCount: number;

  status:
    | 'observed'
    | 'community_corroborated'
    | 'needs_verification'
    | 'escalated'
    | 'in_attention'
    | 'closed';
}
```

## TimelineEntry

```ts
interface TimelineEntry {
  id: string;
  reportId: string;
  eventClusterId?: string;
  timestamp: string;
  type: 'report' | 'verification' | 'escalation' | 'official_update';
  summary: string;
}
```

---

# 25. Algoritmo de corroboración MVP sugerido

No usar ML si reglas explícitas son suficientes para el hackathon.

Ejemplo conceptual:

```text
Si existen >= 2 reportes
Y provienen de dispositivos distintos
Y están a <= 250 m
Y ocurrieron dentro de una ventana razonable
Y tienen categoría compatible
→ marcar como "corroborado comunitariamente"
```

Para vigilancia de largo plazo, la ventana temporal puede ser más amplia y debe considerarse el mismo punto/sector.

Para emergencia, la ventana debe ser corta.

Todos los umbrales deben estar configurados y ser visibles en modo demo/admin, no hardcodeados sin explicación.

---

# 26. Pantallas mínimas recomendadas

Codex debe determinar cuáles ya existen.

## Ciudadano

1. Home
2. Reportar observación
3. Emergencia ahora
4. Confirmación / folio
5. Mis reportes
6. Detalle + línea temporal
7. Mapa comunitario agregado

## Promotor

1. Mapa del sector
2. Pendientes de verificación
3. Detalle de evento
4. Estado de viviendas / puntos
5. Sincronización offline

## Operador/demo

1. Mapa general
2. Lista de eventos
3. Timeline
4. Corroboración
5. Estado de sincronización
6. Caso institucional / trazabilidad

---

# 27. Guion de demo técnico recomendado

El MVP debe poder demostrar, idealmente en 2–3 minutos:

1. Usuario A reporta una grieta con ubicación.
2. El reporte aparece como `Registrado`.
3. Usuario B reporta cerca desde otro dispositivo/sesión.
4. El evento pasa a `Corroborado comunitariamente`.
5. Se muestra la línea temporal de evidencias.
6. Se corta Internet en un dispositivo.
7. Se crea un nuevo reporte y queda `Pendiente de sincronización`.
8. Regresa Internet.
9. El reporte se sincroniza sin duplicarse.
10. Se abre el expediente y se muestra la trazabilidad.

### Wow moment recomendado

Mostrar el mismo punto en distintas fechas:

```text
ENERO → cambio leve
FEBRERO → cambio mayor
MARZO → varios reportes cercanos
```

Mensaje:

> **Las redes sociales ven publicaciones aisladas. TESTIGO construye una historia del lugar.**

---

# 28. Prioridades sugeridas para las próximas iteraciones

## P0 — Debe quedar correcto antes del pitch

- [ ] Separar Vigilancia / Emergencia.
- [ ] Verificar que emergencia no espere fotografías.
- [ ] Eliminar dependencia de reputación del usuario.
- [ ] Corroborar por evento/dispositivos/proximidad/tiempo.
- [ ] Aclarar comportamiento offline.
- [ ] Mostrar estados de sincronización.
- [ ] Separar folio TESTIGO de caso oficial.
- [ ] Corregir cualquier texto que prometa predicción geotécnica.
- [ ] Corregir cualquier texto que diga que una PWA offline es mesh.
- [ ] Determinar si el backend permite realmente multiusuario.

## P1 — Gran valor para demo

- [ ] Línea temporal visual por punto.
- [ ] Mapa con privacidad por rol.
- [ ] Panel promotor/brigadista.
- [ ] Expediente estructurado.
- [ ] Registro de seguimiento institucional.
- [ ] Compartir resumen por WhatsApp.
- [ ] InSAR con fecha y estado de actualización.
- [ ] Métricas de escalamiento y corroboración.
- [ ] Accesibilidad: voz, iconos, botones grandes.

## P2 — Roadmap

- [ ] Integraciones oficiales reales.
- [ ] SMS.
- [ ] LoRa / gateways.
- [ ] Bluetooth/Wi-Fi Direct.
- [ ] exportación avanzada de expedientes.
- [ ] análisis de imágenes más sofisticado.
- [ ] integración con capas oficiales en tiempo real.
- [ ] rutas/puntos de evacuación validados.

---

# 29. Preguntas que Codex debe responder al terminar la auditoría

1. ¿La aplicación actual tiene dos flujos claros: vigilancia y emergencia?
2. ¿Qué ocurre exactamente si se pierde Internet mientras se crea un reporte?
3. ¿El dato queda persistido si el navegador se cierra?
4. ¿Existe sincronización real multiusuario o está simulada?
5. ¿Hay prevención de reportes duplicados tras reconexión?
6. ¿Existe algún score basado en reputación del usuario?
7. ¿Un usuario nuevo puede activar una observación importante sin penalización?
8. ¿Cómo se determina que dos reportes pertenecen al mismo evento?
9. ¿InSAR afecta el score? ¿Puede reducir/invalidar un reporte?
10. ¿Se muestra la fecha de la capa InSAR?
11. ¿El mapa expone ubicaciones o identidades sensibles?
12. ¿Qué ve cada rol?
13. ¿Un folio interno se presenta incorrectamente como caso oficial?
14. ¿Existe una línea temporal real del mismo punto?
15. ¿El modo emergencia solicita evidencia antes de ofrecer acceso a emergencias?
16. ¿La UI utiliza colores que puedan confundirse con alertas oficiales?
17. ¿Hay textos que digan "predicción" cuando solo existe corroboración?
18. ¿Hay textos que digan "funciona sin red" cuando realmente significa "guarda y sincroniza después"?
19. ¿Hay alguna función crítica que dependa de datos simulados sin indicarlo?
20. ¿Qué tres cambios producirían la mayor mejora de claridad y utilidad con el menor esfuerzo?

---

# 30. Formato esperado de la respuesta de Codex

Codex debería devolver:

## A. Resumen ejecutivo

Máximo 10 puntos.

## B. Auditoría por funcionalidad

Tabla con:

```text
Funcionalidad | Estado | Archivos | Problema | Recomendación | Prioridad | Esfuerzo
```

## C. Riesgos críticos

Separar:

- funcionales;
- UX;
- privacidad;
- arquitectura;
- claims/credibilidad del pitch.

## D. Quick wins

Cambios realizables en pocas horas.

## E. Cambios que NO recomienda hacer antes del hackathon

Para evitar sobreingeniería.

## F. Plan de implementación

Orden de commits recomendado.

Ejemplo:

```text
1. fix: separate observation and emergency flows
2. fix: persist offline emergency reports
3. refactor: replace reporter reputation with event corroboration
4. feat: timeline per location
5. feat: report sync status
6. feat: official case tracking fields
```

## G. Solo después del diagnóstico

Proponer cambios de código concretos.

---

# 31. Principio final del MVP

TESTIGO no necesita resolver El Niño, predecir un deslave ni sustituir a las instituciones.

Debe resolver muy bien una brecha más pequeña y demostrable:

> **Que una señal observada por la comunidad no se pierda como una publicación aislada, sino que se convierta en evidencia georreferenciada, corroborable, trazable y utilizable.**

Y cuando la conectividad sea intermitente:

> **que la aplicación preserve la evidencia hasta poder transmitirla, sin fingir capacidades de telecomunicaciones que todavía no existen.**

Ese enfoque minimalista debería guiar cualquier cambio de código previo al hackathon.
