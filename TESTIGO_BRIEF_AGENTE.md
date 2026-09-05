# TESTIGO — Brief para el agente de código

> Pégale esto completo al agente antes de pedirle nada. Es el contrato del proyecto.
> Si algo no está aquí, no se construye.

---

## 0. Qué es

Prototipo de hackathon (pocas horas) de un sistema de alerta comunitaria de deslaves.
Dos modos: **Vigilancia** (meses, foto + expediente) y **Emergencia** (segundos, botón de pánico + GPS).

**No es un producto real.** Es un demo que debe correr en una laptop y verse creíble en 4 minutos.
Los datos son sembrados. La lógica de validación sí se calcula de verdad.

---

## 1. Stack (no negociable)

- **Vite + React + TypeScript**
- **Leaflet** (react-leaflet) para el mapa
- **Tailwind** para estilos
- **Sin backend.** Estado en memoria + `localStorage`
- **BroadcastChannel API** para sincronizar entre pestañas del navegador
- **Web Speech API** (`speechSynthesis`) para TTS. Nativo, cero dependencias

Prohibido: Docker, Postgres, autenticación, ORM, backend, deploy. Todo corre en `localhost`.

### Cómo se simula la red

No hay red real. Un flag global `online: boolean` en el store.

- `online = true` → los mensajes salen por `BroadcastChannel` inmediatamente
- `online = false` → se encolan en `localStorage` con su `timestamp` real
- Al volver a `true` → se vacía la cola por `BroadcastChannel` en orden

El botón "MODO AVIÓN" está visible en la UI. Es parte del demo, no se esconde.

---

## 2. Las tres vistas

La app es **una sola SPA** con un selector de rol arriba (para el demo se cambia de rol en un click).

| Ruta | Rol | Qué muestra |
|---|---|---|
| `/vecino` | Vecino | Botón de pánico + formulario de reporte. Diseño de celular, botones enormes, íconos |
| `/promotor` | Promotor comunitario | Mapa del sector cacheado + censo de viviendas + confirmar alertas |
| `/coe` | Operador COE | Mapa completo, todos los sectores, cola de eventos, línea de tiempo fotográfica |

Para el demo se abren **dos pestañas**: `/vecino` en una, `/coe` en la otra, lado a lado.

---

## 3. Modelo de datos

Cerrar esto primero. No cambiarlo después.

```ts
type NivelAlerta = 'verde' | 'amarillo' | 'naranja' | 'rojo';

type Sector = {
  id: string;
  nombre: string;
  geometry: GeoJSON.Polygon;
  poblacion: number;
  viviendas: number;
  deformacion_mm_anio: number;   // capa InSAR precomputada
  nivel: NivelAlerta;
  ultimo_reporte_ts: string | null;
  dias_sin_respuesta_gad: number;
};

type Autor = {
  id: string;
  nombre: string;
  reportes_previos: number;
  reportes_confirmados: number;
  reputacion: number;            // confirmados/previos, default 0.5
};

type ReporteVigilancia = {
  id: string;                    // folio visible al usuario, ej "TST-0148"
  sector_id: string;
  autor_id: string;
  tipo: 'grieta' | 'poste_inclinado' | 'manantial_nuevo' | 'agua_turbia' | 'puerta_no_cierra';
  foto_url: string;              // ruta a /public/fotos/
  lat: number; lon: number;
  ts: string;
  punto_id: string | null;       // agrupa fotos del MISMO punto físico (para línea de tiempo)
  score: number;
  estado: 'sin_verificar' | 'corroborado' | 'confirmado_campo';
  sincronizado: boolean;
};

type SenalEmergencia = {
  id: string;
  tipo: 'deslave' | 'desbordamiento' | 'grieta_ahora';
  lat: number; lon: number;
  precision_m: number;
  ts: string;                    // hora REAL del disparo, no de la sincronización
  dispositivo_id: string;
  sincronizado: boolean;
  ts_sincronizacion: string | null;
};

type Evento = {                  // se crea cuando N señales corroboran
  id: string;
  sector_id: string;
  senales: string[];             // ids de SenalEmergencia
  centroide: { lat: number; lon: number };
  radio_m: number;
  ventana_s: number;
  nivel: NivelAlerta;
  confirmado_por_promotor: boolean;
};

type Vivienda = {                // para el censo del promotor, cacheado
  id: string;
  sector_id: string;
  lat: number; lon: number;
  personas: number;
  estado: 'sin_dato' | 'evacuado' | 'sin_contacto' | 'afectado';
};
```

---

## 4. Las dos lógicas que SÍ se calculan de verdad

### 4.1 Validación geométrica (modo Emergencia) — la pieza central

Cuando llega una `SenalEmergencia`, buscar otras señales que cumplan **las tres**:

- **Proximidad:** distancia ≤ `RADIO_M` (300 m), usando Haversine
- **Simultaneidad:** diferencia de `ts` ≤ `VENTANA_S` (120 s). **Usar `ts` de disparo, NO de sincronización**
- **Independencia:** `dispositivo_id` distinto

Reglas de escalación:

| Señales corroboradas | Resultado |
|---|---|
| 1 | `amarillo`. Va solo al promotor y al COE. **No despierta al barrio** |
| 2 | `naranja`. Alerta al sector |
| 3 o más | `rojo`. Alerta general + TTS |
| Confirmación del promotor | fuerza `rojo` con 1 sola señal |

**El sistema nunca baja un nivel automáticamente.** Solo el operador desescala, con un botón explícito.

Al crear un `Evento`, calcular centroide y radio real de las señales y dibujarlo en el mapa como círculo.

### 4.2 Score de reportes (modo Vigilancia)

```
score = 0.40 * reputacion_autor
      + 0.35 * corroboracion
      + 0.25 * coincidencia_insar
```

- `reputacion_autor` = `confirmados / previos`, default `0.5` si `previos === 0`
- `corroboracion` = `min(1, reportes_independientes_mismo_sector_72h / 3)`
- `coincidencia_insar`: `1.0` si `deformacion_mm_anio > 8`; `0.5` si entre 3 y 8; `0` si menos

Estados por score: `< 0.3` → `sin_verificar` · `0.3–0.7` → `corroborado` · `> 0.7` → escala el sector

**Regla de equidad (importante, va en el pitch):** todo reporte es visible en el mapa siempre.
Score bajo significa "sin verificar", nunca "descartado". La reputación solo suma, nunca resta bajo un piso de `0.3`.

---

## 5. Constantes

```ts
export const RADIO_M = 300;
export const VENTANA_S = 120;
export const PISO_REPUTACION = 0.3;
export const REPUTACION_DEFAULT = 0.5;
export const UMBRAL_INSAR_ALTO = 8;    // mm/año
export const UMBRAL_INSAR_MEDIO = 3;
export const VENTANA_CORROBORACION_H = 72;
```

---

## 6. Escenario sembrado

Ubicación: cerros del noroeste de Guayaquil. **8 sectores**, no más.

| Sector | Deformación mm/año | Viviendas | Reportes previos | Días sin respuesta GAD |
|---|---|---|---|---|
| Monte Sinaí Alto | 11.2 | 340 | 9 | 47 |
| Bastión Popular Bl. 9 | 9.4 | 210 | 4 | 112 |
| Mapasingue Este | 6.1 | 180 | 2 | 23 |
| Sergio Toral | 4.8 | 260 | 1 | 8 |
| Flor de Bastión | 2.1 | 190 | 0 | 0 |
| Paraíso de la Flor | 1.4 | 150 | 0 | 0 |
| Cerro El Fortín | 7.9 | 120 | 3 | 61 |
| Nueva Prosperina | 0.9 | 300 | 0 | 0 |

**Monte Sinaí Alto es el sector protagonista.** Todo el demo pasa ahí.

Sembrar:
- **3 fotos del mismo `punto_id`** ("MS-P07", una pared con grieta) con fechas: 12 ene, 03 feb, 28 mar. La grieta crece visiblemente. Esta es la línea de tiempo del demo. Puedes usar 3 fotos reales de una pared con marcas dibujadas encima si no consigues mejor.
- **9 reportes** en Monte Sinaí Alto, de 6 autores distintos
- **1 reporte falso** en Nueva Prosperina, de un autor con reputación 0.15 → queda en `sin_verificar` y no escala nada
- **2 autores** con reputación alta (0.8) y **1** con reputación baja (0.15)
- **12 viviendas** con coordenadas en Monte Sinaí Alto, para el censo del promotor
- Sector "Flor de Bastión": **0 reportes en 90 días**. Se usa para mostrar el verde por ignorancia

---

## 7. Pantallas, en detalle

### `/vecino`

Dos zonas, claramente separadas:

**Arriba: EMERGENCIA.** Tres botones gigantes con ícono grande y texto corto. Rojo, naranja, amarillo.
`SE CAE UN CERRO` · `SE DESBORDA EL RÍO` · `SE AGRIETÓ AHORA`
Un toque dispara. Confirmación visual inmediata: "Señal enviada" o "Señal guardada, se enviará al recuperar señal".
Debe verse el estado de la cola: "1 señal pendiente".

**Abajo: REPORTAR.** Cámara/upload de foto, selector de tipo con íconos, y botón de enviar.
Al enviar, **pantalla de confirmación** con:
- Folio (`TST-0148`)
- "9 vecinos reportaron lo mismo en tu sector"
- "Días sin respuesta del GAD: 47"
- "Este reporte quedó guardado con fecha y ubicación. Es tuyo."

**Esa pantalla de confirmación es crítica. Es la respuesta a "¿por qué reportaría alguien?". No la simplifiques.**

Botón `MODO AVIÓN` visible arriba.

### `/coe`

Mapa con los 8 sectores coloreados por nivel. Panel lateral:
- Cola de eventos y reportes entrantes, en tiempo real
- Al hacer click en un sector: población, viviendas, deformación InSAR, último reporte, días sin respuesta
- **Línea de tiempo fotográfica:** las 3 fotos del `punto_id` MS-P07 lado a lado con sus fechas
- Cuando llega un `Evento`, dibujar el círculo con centroide y radio, y mostrar en texto: "2 señales · 180 m · 40 s de diferencia · dispositivos distintos"
- Botón para desescalar manualmente

### `/promotor`

Mapa del sector con las 12 viviendas como puntos. Lista lateral para marcar estado de cada una.
Indicador grande: "MODO OFFLINE — datos cacheados el 04/09".
Botón "Confirmar alerta" que fuerza `rojo`.

---

## 8. Orden de construcción (respetarlo)

**P0 — sin esto no hay demo:**
1. Datos sembrados + mapa Leaflet pintando los 8 sectores
2. Vista `/vecino` con los 3 botones de emergencia
3. Flag `online` + encolado en `localStorage` + sincronización por `BroadcastChannel`
4. Validación geométrica (Haversine + ventana temporal + independencia) y escalación
5. Vista `/coe` mostrando el evento con círculo y el detalle de corroboración

**P1 — el corazón del pitch:**
6. Formulario de reporte + pantalla de confirmación con folio, contador de vecinos y días sin respuesta
7. Línea de tiempo fotográfica del `punto_id`

**P2 — si sobra tiempo:**
8. TTS con `speechSynthesis`: "Alerta en Monte Sinaí Alto. Salga de su casa ahora."
9. Score de reportes visible en el mapa (pines con opacidad según score)
10. Vista `/promotor` con censo

**P3 — solo si todo lo demás está listo y ensayado:**
11. Capa InSAR como polígonos semitransparentes

**NO CONSTRUIR:** bot de WhatsApp (se explica en slide), modelo de visión, reconocimiento de voz, mesh Bluetooth, backend, login, historial de usuario, configuración, dashboard de métricas.

---

## 9. Guion del demo (construir hacia esto)

Dos pestañas lado a lado: `/vecino` y `/coe`.

1. **Mapa verde.** Click en Flor de Bastión: 0 reportes en 90 días. *"Verde porque nadie está mirando."*
2. **Reporte de vigilancia.** Foto de grieta desde `/vecino` → pantalla de folio, "9 vecinos reportaron", "47 días sin respuesta".
3. **Línea de tiempo.** En `/coe`, abrir MS-P07: la misma pared en enero, febrero y marzo. *"Este cerro llevaba tres meses avisando."*
4. **MODO AVIÓN.** Tocar `SE CAE UN CERRO`. Señal encolada, con su hora real. Sin red.
5. **Segunda señal** desde otro `dispositivo_id`, también offline, a 180 m.
6. **Quitar modo avión.** Sincronizan. `/coe` dibuja el círculo: 2 señales, 180 m, 40 s, dispositivos distintos → **naranja automático**. Nadie escribió nada.
7. **TTS suena.** Cierre con el dato de Alausí.

Regla dura: cuando el guion completo corra 5 veces seguidas sin fallar, **se congela el código**. Nada de features nuevos después de eso.

---

## 10. Estilo visual

Serio, no juguetón. Es un sistema de emergencias.
Fondo oscuro en `/coe` (sala de operaciones), fondo claro y alto contraste en `/vecino`.
Tipografía grande en `/vecino`: el usuario no lee bien y está asustado.
Colores de nivel: verde `#16a34a`, amarillo `#eab308`, naranja `#ea580c`, rojo `#dc2626`.
Nada de gradientes ni animaciones decorativas. Que se vea como una herramienta, no como una landing page.
