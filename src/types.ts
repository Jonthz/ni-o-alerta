export type NivelAlerta = 'verde' | 'amarillo' | 'naranja' | 'rojo';
export type Origen = 'whatsapp' | 'app_vecino' | 'promotor';

export type Sector = {
  id: string;
  nombre: string;
  geometry: GeoJSON.Polygon;
  poblacion: number;
  viviendas: number;
  deformacion_mm_anio: number;
  nivel: NivelAlerta;
  ultimo_reporte_ts: string | null;
  dias_sin_respuesta_gad: number;
};

export type Autor = {
  id: string;
  nombre: string;
  reportes_previos: number;
  reportes_confirmados: number;
  reputacion: number;
};

export type ReporteVigilancia = {
  id: string;
  sector_id: string;
  autor_id: string;
  tipo: 'grieta' | 'poste_inclinado' | 'manantial_nuevo' | 'agua_turbia' | 'puerta_no_cierra';
  foto_url: string;
  lat: number;
  lon: number;
  ts: string;
  punto_id: string | null;
  score: number;
  estado: 'sin_verificar' | 'corroborado' | 'confirmado_campo';
  sincronizado: boolean;
  origen: Origen;
  ts_sincronizacion: string | null;
};

export type SenalEmergencia = {
  id: string;
  tipo: 'deslave' | 'desbordamiento' | 'grieta_ahora';
  lat: number;
  lon: number;
  precision_m: number;
  ts: string;
  dispositivo_id: string;
  sincronizado: boolean;
  ts_sincronizacion: string | null;
  origen: Origen;
};

export type Evento = {
  id: string;
  sector_id: string;
  senales: string[];
  centroide: { lat: number; lon: number };
  radio_m: number;
  ventana_s: number;
  nivel: NivelAlerta;
  confirmado_por_promotor: boolean;
  origen_confirmacion?: Origen;
  detalle_confirmacion?: string;
};

export type ConfirmacionPromotor = {
  id: string;
  sector_id: string;
  autor_id: string;
  punto_id: string;
  ts: string;
  origen: 'promotor';
  detalle: string;
};

export type Vivienda = {
  id: string;
  sector_id: string;
  lat: number;
  lon: number;
  personas: number;
  estado: 'sin_dato' | 'evacuado' | 'sin_contacto' | 'afectado';
};
