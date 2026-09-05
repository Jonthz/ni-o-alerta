import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AUTORES, REPORTES, SECTORS, VIVIENDAS } from './data/seed';
import { corroborateEmergency } from './logic/geo';
import { scoreReport, stateForScore } from './logic/score';
import type { ConfirmacionPromotor, Evento, NivelAlerta, Origen, ReporteVigilancia, Sector, SenalEmergencia, Vivienda } from './types';

type Message =
  | { type: 'signal'; payload: SenalEmergencia }
  | { type: 'report'; payload: ReporteVigilancia }
  | { type: 'promotor-confirm'; payload: ConfirmacionPromotor }
  | { type: 'deescalate'; sectorId: string };

type AppState = {
  online: boolean;
  sectors: Sector[];
  reports: ReporteVigilancia[];
  signals: SenalEmergencia[];
  events: Evento[];
  viviendas: Vivienda[];
  confirmations: ConfirmacionPromotor[];
  pending: Message[];
  lastAck: string;
  alertSpeechText: string;
  setOnline: (value: boolean) => void;
  sendSignal: (tipo: SenalEmergencia['tipo'], origen?: Origen) => void;
  sendReport: (origen?: Origen, tipo?: ReporteVigilancia['tipo']) => ReporteVigilancia;
  sendDemoSecondDeviceSignal: () => void;
  replayAlert: () => void;
  forceRed: () => void;
  deescalate: (sectorId: string) => void;
  updateHouse: (id: string, estado: Vivienda['estado']) => void;
};

const CHANNEL = 'testigo-demo';
const PENDING_KEY = 'testigo.pending';
const ONLINE_KEY = 'testigo.online';
const DEVICE_KEY = 'testigo.device';
const Context = createContext<AppState | null>(null);
const RED_ALERT_TEXT = 'Alerta en Monte Sinai Alto. Salga de su casa ahora.';
const DEMO_TS_1 = '2026-09-05T11:43:12-05:00';
const DEMO_TS_2 = '2026-09-05T11:43:52-05:00';

const scoredReports = REPORTES.map((report) => {
  const score = scoreReport(report, REPORTES, SECTORS, AUTORES);
  return { ...report, score, estado: stateForScore(score) };
});

const storedDevice = () => {
  const existing = sessionStorage.getItem(DEVICE_KEY);
  if (existing) return existing;
  const next = `DEV-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
  sessionStorage.setItem(DEVICE_KEY, next);
  return next;
};

const readPending = (): Message[] => JSON.parse(localStorage.getItem(PENDING_KEY) || '[]');
const writePending = (items: Message[]) => localStorage.setItem(PENDING_KEY, JSON.stringify(items));

const speak = (text: string) => {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
};

export const badgeFor = (origin: Origen, synced: boolean) => {
  if (origin === 'whatsapp') return 'WHATSAPP';
  if (origin === 'promotor') return 'PROMOTOR';
  return synced ? 'APP' : 'APP OFFLINE';
};

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [onlineState, setOnlineState] = useState(localStorage.getItem(ONLINE_KEY) !== 'false');
  const [sectors, setSectors] = useState(SECTORS);
  const [reports, setReports] = useState(scoredReports);
  const [signals, setSignals] = useState<SenalEmergencia[]>([]);
  const [events, setEvents] = useState<Evento[]>([]);
  const [viviendas, setViviendas] = useState(VIVIENDAS);
  const [confirmations, setConfirmations] = useState<ConfirmacionPromotor[]>([]);
  const [pending, setPending] = useState<Message[]>(readPending);
  const [lastAck, setLastAck] = useState('');
  const [alertSpeechText, setAlertSpeechText] = useState('');
  const bc = useMemo(() => new BroadcastChannel(CHANNEL), []);

  const applyMessage = useCallback((message: Message, synced = true) => {
    if (message.type === 'signal') {
      const signal = { ...message.payload, sincronizado: synced, ts_sincronizacion: synced ? new Date().toISOString() : message.payload.ts_sincronizacion };
      setSignals((current) => (current.some((item) => item.id === signal.id) ? current : [...current, signal]));
      setLastAck(synced ? `${badgeFor(signal.origen, signal.sincronizado)} · Senal recibida por COE` : 'Senal guardada en este dispositivo');
    }

    if (message.type === 'report') {
      const report = { ...message.payload, sincronizado: synced, ts_sincronizacion: synced ? new Date().toISOString() : message.payload.ts_sincronizacion };
      setReports((current) => (current.some((item) => item.id === report.id) ? current : [...current, report]));
      setSectors((current) => current.map((sector) => (
        sector.id === report.sector_id
          ? { ...sector, ultimo_reporte_ts: report.ts, nivel: sector.nivel === 'verde' && report.score > 0.7 ? 'amarillo' : sector.nivel }
          : sector
      )));
      setLastAck(`${badgeFor(report.origen, report.sincronizado)} · Reporte ${report.id} registrado`);
    }

    if (message.type === 'promotor-confirm') {
      setConfirmations((current) => (current.some((item) => item.id === message.payload.id) ? current : [...current, message.payload]));
      setSectors((current) => current.map((sector) => sector.id === message.payload.sector_id ? { ...sector, nivel: 'rojo' } : sector));
      setEvents((current) => {
        const existing = current.find((event) => event.sector_id === message.payload.sector_id);
        const forced: Evento = {
          id: existing?.id ?? 'EV-PROMOTOR-MS-P07',
          sector_id: message.payload.sector_id,
          senales: existing?.senales ?? [],
          centroide: existing?.centroide ?? { lat: -2.0913, lon: -79.9885 },
          radio_m: existing?.radio_m ?? 180,
          ventana_s: existing?.ventana_s ?? 0,
          nivel: 'rojo',
          confirmado_por_promotor: true,
          origen_confirmacion: 'promotor',
          detalle_confirmacion: message.payload.detalle,
        };
        return existing ? current.map((event) => event.id === existing.id ? forced : event) : [...current, forced];
      });
      setAlertSpeechText(RED_ALERT_TEXT);
      speak(RED_ALERT_TEXT);
      setLastAck('PROMOTOR · Confirmacion de campo registrada');
    }

    if (message.type === 'deescalate') {
      setSectors((current) => current.map((sector) => sector.id === message.sectorId ? { ...sector, nivel: 'amarillo' } : sector));
    }
  }, []);

  const publish = useCallback((message: Message) => {
    if (onlineState) {
      bc.postMessage(message);
      applyMessage(message, true);
      return;
    }

    const next = [...readPending(), message];
    writePending(next);
    setPending(next);
    setLastAck('Guardado en este dispositivo · se sincronizara al recuperar conectividad');
  }, [applyMessage, bc, onlineState]);

  const setOnline = useCallback((value: boolean) => {
    localStorage.setItem(ONLINE_KEY, String(value));
    setOnlineState(value);
    if (!value) return;

    const queued = readPending();
    queued.forEach((item) => {
      bc.postMessage(item);
      applyMessage(item, true);
    });
    writePending([]);
    setPending([]);
    setLastAck(`${queued.length} entradas sincronizadas`);
  }, [applyMessage, bc]);

  useEffect(() => {
    bc.onmessage = (event: MessageEvent<Message>) => applyMessage(event.data, true);
    return () => {
      bc.onmessage = null;
      bc.close();
    };
  }, [applyMessage, bc]);

  useEffect(() => {
    const nextEvents = corroborateEmergency(signals);
    setEvents((current) => {
      const forced = current.filter((event) => event.confirmado_por_promotor);
      return [...nextEvents, ...forced.filter((forcedEvent) => !nextEvents.some((event) => event.id === forcedEvent.id))];
    });
    setSectors((current) => current.map((sector) => {
      const event = nextEvents.find((item) => item.sector_id === sector.id);
      if (!event) return sector;
      const order: NivelAlerta[] = ['verde', 'amarillo', 'naranja', 'rojo'];
      return order.indexOf(event.nivel) > order.indexOf(sector.nivel) ? { ...sector, nivel: event.nivel } : sector;
    }));
    if (nextEvents.some((event) => event.nivel === 'rojo')) {
      setAlertSpeechText(RED_ALERT_TEXT);
      speak(RED_ALERT_TEXT);
    }
  }, [signals]);

  const sendSignal = (tipo: SenalEmergencia['tipo'], origen: Origen = 'app_vecino') => {
    const offsets = { deslave: [0, 0], desbordamiento: [0.00162, 0], grieta_ahora: [0.0009, 0.0009] }[tipo];
    const ts = signals.length === 0 && origen === 'app_vecino' ? DEMO_TS_1 : new Date().toISOString();
    publish({
      type: 'signal',
      payload: {
        id: origen === 'app_vecino' && signals.length === 0 ? 'DEMO-SIGNAL-01' : crypto.randomUUID(),
        tipo,
        lat: -2.0913 + offsets[0],
        lon: -79.9885 + offsets[1],
        precision_m: 16,
        ts,
        dispositivo_id: storedDevice(),
        sincronizado: onlineState,
        ts_sincronizacion: onlineState ? new Date().toISOString() : null,
        origen,
      },
    });
  };

  const sendDemoSecondDeviceSignal = () => {
    publish({
      type: 'signal',
      payload: {
        id: 'DEMO-SIGNAL-02',
        tipo: 'deslave',
        lat: -2.08968,
        lon: -79.9885,
        precision_m: 14,
        ts: DEMO_TS_2,
        dispositivo_id: 'DEV-ESCENARIO-02',
        sincronizado: onlineState,
        ts_sincronizacion: onlineState ? new Date().toISOString() : null,
        origen: 'app_vecino',
      },
    });
  };

  const sendReport = (origen: Origen = 'app_vecino', tipo: ReporteVigilancia['tipo'] = 'grieta') => {
    const count = reports.filter((report) => report.ts === '2026-09-05T11:35:20-05:00').length;
    const id = `TST-${String(148 + count).padStart(4, '0')}`;
    const draft: ReporteVigilancia = {
      id,
      sector_id: 'monte-sinai',
      autor_id: origen === 'whatsapp' ? 'a1' : 'a6',
      tipo,
      foto_url: '/fotos/grieta-mar.svg',
      lat: -2.091,
      lon: -79.9881,
      ts: '2026-09-05T11:35:20-05:00',
      punto_id: 'MS-P07',
      score: 0,
      estado: 'sin_verificar',
      sincronizado: onlineState,
      origen,
      ts_sincronizacion: onlineState ? new Date().toISOString() : null,
    };
    const score = scoreReport(draft, reports, sectors, AUTORES);
    const payload = { ...draft, score, estado: stateForScore(score) };
    publish({ type: 'report', payload });
    return payload;
  };

  const value: AppState = {
    online: onlineState,
    sectors,
    reports,
    signals,
    events,
    viviendas,
    confirmations,
    pending,
    lastAck,
    alertSpeechText,
    setOnline,
    sendSignal,
    sendReport,
    sendDemoSecondDeviceSignal,
    replayAlert: () => speak(alertSpeechText || RED_ALERT_TEXT),
    forceRed: () => publish({
      type: 'promotor-confirm',
      payload: {
        id: 'PROM-MS-P07-01',
        sector_id: 'monte-sinai',
        autor_id: 'promotor-01',
        punto_id: 'MS-P07',
        ts: '2026-09-05T11:46:18-05:00',
        origen: 'promotor',
        detalle: 'Inspeccion MS-P07: grieta activa y viviendas cercanas sin contacto.',
      },
    }),
    deescalate: (sectorId) => publish({ type: 'deescalate', sectorId }),
    updateHouse: (id, estado) => setViviendas((items) => items.map((item) => item.id === id ? { ...item, estado } : item)),
  };

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export const useStore = () => {
  const value = useContext(Context);
  if (!value) throw new Error('StoreProvider missing');
  return value;
};
