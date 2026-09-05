import { RADIO_M, VENTANA_S } from '../constants';
import type { Evento, NivelAlerta, SenalEmergencia } from '../types';

export const metersBetween = (a: { lat: number; lon: number }, b: { lat: number; lon: number }) => {
  const r = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * r * Math.asin(Math.sqrt(h));
};

const levelFor = (count: number): NivelAlerta => {
  if (count >= 3) return 'rojo';
  if (count === 2) return 'naranja';
  return 'amarillo';
};

export const corroborateEmergency = (signals: SenalEmergencia[], sectorId = 'monte-sinai'): Evento[] => {
  const events: Evento[] = [];
  const seen = new Set<string>();

  for (const signal of signals) {
    if (seen.has(signal.id)) continue;
    const cluster = signals.filter((other) => {
      const seconds = Math.abs(new Date(other.ts).getTime() - new Date(signal.ts).getTime()) / 1000;
      return (
        other.dispositivo_id !== signal.dispositivo_id &&
        metersBetween(signal, other) <= RADIO_M &&
        seconds <= VENTANA_S
      );
    });
    const unique = [signal, ...cluster].filter((item, index, all) => all.findIndex((x) => x.dispositivo_id === item.dispositivo_id) === index);
    if (unique.length === 0) continue;
    unique.forEach((item) => seen.add(item.id));

    const lat = unique.reduce((sum, item) => sum + item.lat, 0) / unique.length;
    const lon = unique.reduce((sum, item) => sum + item.lon, 0) / unique.length;
    const pairDistances = unique.flatMap((item) => unique.map((other) => metersBetween(item, other)));
    const radio = Math.max(60, ...pairDistances);
    const times = unique.map((item) => new Date(item.ts).getTime());

    events.push({
      id: `EV-${unique.map((item) => item.id.slice(-4)).join('-')}`,
      sector_id: sectorId,
      senales: unique.map((item) => item.id),
      centroide: { lat, lon },
      radio_m: Math.round(radio),
      ventana_s: Math.round((Math.max(...times) - Math.min(...times)) / 1000),
      nivel: levelFor(unique.length),
      confirmado_por_promotor: false,
    });
  }

  return events;
};
