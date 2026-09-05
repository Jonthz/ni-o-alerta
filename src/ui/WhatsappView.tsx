import { useState } from 'react';
import { MapPin, Mountain, Send, Waves, Zap } from 'lucide-react';
import { useStore } from '../store';
import type { ReporteVigilancia, SenalEmergencia } from '../types';
import { Button } from './components/Button';

const tipos: Array<[ReporteVigilancia['tipo'], string]> = [
  ['grieta', 'Grieta'],
  ['poste_inclinado', 'Poste inclinado'],
  ['manantial_nuevo', 'Manantial nuevo'],
  ['agua_turbia', 'Agua turbia'],
  ['puerta_no_cierra', 'Puerta no cierra'],
];

const emergencias: Array<[SenalEmergencia['tipo'], string, React.ReactNode]> = [
  ['deslave', 'Se cae un cerro', <Mountain />],
  ['desbordamiento', 'Se desborda el rio', <Waves />],
  ['grieta_ahora', 'Se agrieto ahora', <Zap />],
];

export function WhatsappView() {
  const { sendReport, sendSignal, events, alertSpeechText } = useStore();
  const [report, setReport] = useState<ReporteVigilancia | null>(null);
  const [sentEmergency, setSentEmergency] = useState('');
  const latestEvent = events.find((item) => item.sector_id === 'monte-sinai');

  const submitReport = (tipo: ReporteVigilancia['tipo']) => setReport(sendReport('whatsapp', tipo));
  const submitSignal = (tipo: SenalEmergencia['tipo']) => {
    sendSignal(tipo, 'whatsapp');
    setSentEmergency('Senal enviada por WhatsApp. Este canal requiere conectividad.');
  };

  return (
    <main className="whatsapp-phone">
      <div className="wa-header">
        <div>
          <strong>TESTIGO Bot</strong>
          <span>Simulacion del bot de WhatsApp</span>
        </div>
      </div>
      <div className="wa-chat">
        <p className="bubble bot">Que quieres reportar?</p>
        <div className="quick-grid">
          {tipos.map(([tipo, label]) => (
            <Button key={tipo} variant="outline" size="sm" onClick={() => submitReport(tipo)}>{label}</Button>
          ))}
        </div>
        <p className="bubble bot">Tambien puedes reportar una emergencia con conectividad.</p>
        <div className="quick-grid">
          {emergencias.map(([tipo, label, icon]) => (
            <Button key={tipo} variant="secondary" size="sm" icon={icon} onClick={() => submitSignal(tipo)}>{label}</Button>
          ))}
        </div>
        {report && (
          <>
            <p className="bubble user"><Send size={16} /> Foto sembrada enviada</p>
            <p className="bubble user"><MapPin size={16} /> Ubicacion compartida: Monte Sinai Alto</p>
            <div className="bubble bot receipt">
              <strong>{report.id}</strong>
              <span>Fecha: 05/09/2026 11:35</span>
              <span>Ubicacion: -2.091, -79.988</span>
              <span>9 vecinos independientes reportaron algo equivalente.</span>
              <span>Dias sin respuesta del GAD: 47</span>
              <span>Este reporte quedo guardado. Es tuyo.</span>
            </div>
          </>
        )}
        {sentEmergency && <p className="bubble bot">{sentEmergency}</p>}
        {latestEvent && (latestEvent.nivel === 'naranja' || latestEvent.nivel === 'rojo') && (
          <div className="bubble bot community-bubble">
            <strong>Mensaje enviado al grupo comunitario</strong>
            <span>{latestEvent.nivel === 'rojo' ? 'ALERTA GENERAL' : 'ALERTA DEL SECTOR'} · Monte Sinai Alto</span>
            <span>{latestEvent.senales.length || 1} senales independientes cerca de MS-P07.</span>
            <span>{alertSpeechText || 'Mantente atento y avisa a tus vecinos cercanos.'}</span>
          </div>
        )}
      </div>
    </main>
  );
}
