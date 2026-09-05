import type { Autor, ReporteVigilancia, Sector, Vivienda } from '../types';

const base = (id: string, nombre: string, lat: number, lon: number, deformation: number, viviendas: number, poblacion: number, previos: number, dias: number): Sector => {
  const d = 0.0065;
  return {
    id,
    nombre,
    poblacion,
    viviendas,
    deformacion_mm_anio: deformation,
    nivel: 'verde',
    ultimo_reporte_ts: previos ? '2026-03-28T14:20:00-05:00' : null,
    dias_sin_respuesta_gad: dias,
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [lon - d, lat - d],
        [lon + d, lat - d * 0.7],
        [lon + d * 0.9, lat + d],
        [lon - d * 0.8, lat + d * 0.8],
        [lon - d, lat - d],
      ]],
    },
  };
};

export const SECTORS: Sector[] = [
  base('monte-sinai', 'Monte Sinai Alto', -2.0913, -79.9885, 11.2, 340, 1390, 9, 47),
  base('bastion-9', 'Bastion Popular Bl. 9', -2.1058, -79.9582, 9.4, 210, 860, 4, 112),
  base('mapasingue-este', 'Mapasingue Este', -2.1558, -79.925, 6.1, 180, 720, 2, 23),
  base('sergio-toral', 'Sergio Toral', -2.081, -79.966, 4.8, 260, 1020, 1, 8),
  base('flor-bastion', 'Flor de Bastion', -2.067, -79.945, 2.1, 190, 760, 0, 0),
  base('paraiso-flor', 'Paraiso de la Flor', -2.074, -79.932, 1.4, 150, 610, 0, 0),
  base('fortin', 'Cerro El Fortin', -2.119, -79.973, 7.9, 120, 480, 3, 61),
  base('nueva-prosperina', 'Nueva Prosperina', -2.126, -79.994, 0.9, 300, 1200, 0, 0),
];

export const AUTORES: Autor[] = [
  { id: 'a1', nombre: 'Luz Mera', reportes_previos: 10, reportes_confirmados: 8, reputacion: 0.8 },
  { id: 'a2', nombre: 'Carlos Vera', reportes_previos: 5, reportes_confirmados: 4, reputacion: 0.8 },
  { id: 'a3', nombre: 'Rosa Pluas', reportes_previos: 6, reportes_confirmados: 3, reputacion: 0.5 },
  { id: 'a4', nombre: 'Martha Leon', reportes_previos: 2, reportes_confirmados: 1, reputacion: 0.5 },
  { id: 'a5', nombre: 'Daniel Cruz', reportes_previos: 1, reportes_confirmados: 0, reputacion: 0.3 },
  { id: 'a6', nombre: 'Elena Andrade', reportes_previos: 0, reportes_confirmados: 0, reputacion: 0.5 },
  { id: 'a7', nombre: 'Anonimo NP', reportes_previos: 20, reportes_confirmados: 3, reputacion: 0.15 },
];

const report = (id: string, autor_id: string, lat: number, lon: number, ts: string, punto_id: string | null, foto_url = '/fotos/grieta-mar.svg'): ReporteVigilancia => ({
  id,
  sector_id: 'monte-sinai',
  autor_id,
  tipo: 'grieta',
  foto_url,
  lat,
  lon,
  ts,
  punto_id,
  score: 0,
  estado: 'sin_verificar',
  sincronizado: true,
  origen: 'app_vecino',
  ts_sincronizacion: ts,
});

export const REPORTES: ReporteVigilancia[] = [
  report('TST-0121', 'a1', -2.0912, -79.9886, '2026-01-12T10:00:00-05:00', 'MS-P07', '/fotos/grieta-ene.svg'),
  report('TST-0129', 'a2', -2.0911, -79.9884, '2026-02-03T09:30:00-05:00', 'MS-P07', '/fotos/grieta-feb.svg'),
  report('TST-0144', 'a3', -2.091, -79.9883, '2026-03-28T14:20:00-05:00', 'MS-P07', '/fotos/grieta-mar.svg'),
  report('TST-0130', 'a4', -2.092, -79.9878, '2026-03-26T12:00:00-05:00', null),
  report('TST-0131', 'a5', -2.09, -79.989, '2026-03-26T13:00:00-05:00', null),
  report('TST-0134', 'a6', -2.0919, -79.9873, '2026-03-27T07:40:00-05:00', null),
  report('TST-0136', 'a1', -2.0905, -79.9887, '2026-03-27T11:10:00-05:00', null),
  report('TST-0140', 'a2', -2.0922, -79.9891, '2026-03-28T08:15:00-05:00', null),
  report('TST-0142', 'a3', -2.0915, -79.9875, '2026-03-28T10:00:00-05:00', null),
  {
    ...report('TST-0099', 'a7', -2.126, -79.994, '2026-03-28T10:00:00-05:00', null, '/fotos/grieta-ene.svg'),
    sector_id: 'nueva-prosperina',
  },
];

export const VIVIENDAS: Vivienda[] = Array.from({ length: 12 }, (_, index) => ({
  id: `MS-V${String(index + 1).padStart(2, '0')}`,
  sector_id: 'monte-sinai',
  lat: -2.0913 + (index % 4) * 0.0012 - 0.0018,
  lon: -79.9885 + Math.floor(index / 4) * 0.0012 - 0.0012,
  personas: [3, 5, 4, 2, 6, 3, 4, 7, 2, 5, 4, 3][index],
  estado: 'sin_dato',
}));
