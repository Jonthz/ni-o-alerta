import { useState } from 'react';
import { Mountain, TriangleAlert, Waves, Zap } from 'lucide-react';
import { useStore } from '../store';
import type { ReporteVigilancia, SenalEmergencia } from '../types';
import { Button } from './components/Button';

const buttons: Array<[SenalEmergencia['tipo'], string, React.ReactNode, 'destructive' | 'emergency' | 'warning']> = [
  ['deslave', 'SE CAE UN CERRO', <><Mountain /><TriangleAlert /></>, 'destructive'],
  ['desbordamiento', 'SE DESBORDA EL RIO', <Waves />, 'emergency'],
  ['grieta_ahora', 'SE AGRIETO AHORA', <Zap />, 'warning'],
];

export function VecinoView({ demoControls = false }: { demoControls?: boolean }) {
  const { online, setOnline, sendSignal, sendReport, sendDemoSecondDeviceSignal, pending, lastAck, reports, sectors, events, alertSpeechText, replayAlert } = useStore();
  const [confirmation, setConfirmation] = useState<ReporteVigilancia | null>(null);
  const sector = sectors.find((item) => item.id === 'monte-sinai')!;
  const sameSector = reports.filter((item) => item.sector_id === 'monte-sinai').length;
  const latestEvent = events.find((item) => item.sector_id === 'monte-sinai');
  const communityNotice = latestEvent && (latestEvent.nivel === 'naranja' || latestEvent.nivel === 'rojo');

  return (
    <main className="vecino shell">
      <header className="topbar">
        <div>
          <span className="eyebrow">Monte Sinai Alto</span>
          <h1>Alerta comunitaria</h1>
        </div>
        <Button variant={online ? 'outline' : 'destructive'} onClick={() => setOnline(!online)}>
          MODO AVION
        </Button>
      </header>

      {communityNotice && (
        <section className={`community-notice ${latestEvent.nivel}`}>
          <span>Mensaje comunitario recibido</span>
          <h2>{latestEvent.nivel === 'rojo' ? 'ALERTA GENERAL' : 'ALERTA DEL SECTOR'}</h2>
          <p>
            Monte Sinai Alto: {latestEvent.senales.length || 1} senales independientes cerca de MS-P07.
            {latestEvent.nivel === 'rojo' ? ' Sal de tu casa ahora si es seguro hacerlo.' : ' Mantente atento y avisa a tus vecinos cercanos.'}
          </p>
          {alertSpeechText && <Button variant="destructive" size="sm" onClick={replayAlert}>Escuchar mensaje</Button>}
        </section>
      )}

      <section className="emergency">
        <h2>Emergencia</h2>
        {alertSpeechText && (
          <div className="voice-alert">
            <strong>Mensaje de voz</strong>
            <p>{alertSpeechText}</p>
            <Button variant="destructive" size="sm" onClick={replayAlert}>Reproducir alerta</Button>
          </div>
        )}
        <div className="panic-grid">
          {buttons.map(([type, label, icon, variant]) => (
            <Button key={type} variant={variant} size="xl" className="panic" icon={icon} onClick={() => sendSignal(type)}>
              {label}
            </Button>
          ))}
        </div>
        <p className="status">{lastAck || 'Listo para enviar senales'} · {pending.length} senal pendiente</p>
      </section>

      {demoControls && (
        <section className="demo-controls">
          <h2>Controles del demo</h2>
          <p>Simula el segundo dispositivo del escenario. No es parte de la interfaz del vecino.</p>
          <Button variant="secondary" size="lg" className="full-width" onClick={sendDemoSecondDeviceSignal}>Segunda senal · otro dispositivo</Button>
        </section>
      )}

      <section className="report-box">
        <h2>Reportar cambio lento</h2>
        <div className="fake-upload">Foto de grieta seleccionada</div>
        <select aria-label="Tipo de reporte">
          <option>Grieta</option>
          <option>Poste inclinado</option>
          <option>Manantial nuevo</option>
          <option>Agua turbia</option>
        </select>
        <Button size="lg" className="full-width" onClick={() => setConfirmation(sendReport())}>Enviar reporte</Button>
      </section>

      {confirmation && (
        <section className="confirmation">
          <span className="folio">{confirmation.id}</span>
          <h2>Tu reporte quedo guardado</h2>
          <p>{sameSector} vecinos reportaron lo mismo en tu sector.</p>
          <p>Dias sin respuesta del GAD: {sector.dias_sin_respuesta_gad}</p>
          <p>Este reporte quedo guardado con fecha y ubicacion. Es tuyo.</p>
        </section>
      )}
    </main>
  );
}
