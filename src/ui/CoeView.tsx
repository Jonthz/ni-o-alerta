import { useMemo, useState } from 'react';
import { badgeFor, useStore } from '../store';
import type { Sector } from '../types';
import { Button } from './components/Button';
import { SectorMap } from './Map';

export function CoeView({ embedded = false, mobileFrame = false }: { embedded?: boolean; mobileFrame?: boolean }) {
  const { sectors, reports, signals, events, confirmations, deescalate, alertSpeechText, replayAlert } = useStore();
  const [selected, setSelected] = useState<Sector>(sectors.find((item) => item.id === 'flor-bastion') ?? sectors[0]);
  const [satellite, setSatellite] = useState(false);
  const timeline = selected.id === 'monte-sinai' ? reports.filter((item) => item.punto_id === 'MS-P07') : [];
  const latest = events[events.length - 1];

  const queue = useMemo(() => {
    const reportRows = reports.map((report) => ({
      id: report.id,
      ts: report.ts,
      label: 'Reporte de vigilancia',
      origin: badgeFor(report.origen, report.sincronizado),
      sector: sectors.find((sector) => sector.id === report.sector_id)?.nombre ?? report.sector_id,
      meta: `${report.tipo} · score ${report.score} · ${report.estado}`,
      actor: report.autor_id,
      synced: report.sincronizado,
      syncTs: report.ts_sincronizacion,
      foto: report.foto_url,
    }));
    const signalRows = signals.map((signal) => ({
      id: signal.id,
      ts: signal.ts,
      label: 'Senal de emergencia',
      origin: badgeFor(signal.origen, signal.sincronizado),
      sector: 'Monte Sinai Alto',
      meta: signal.tipo,
      actor: signal.dispositivo_id,
      synced: signal.sincronizado,
      syncTs: signal.ts_sincronizacion,
      foto: '',
    }));
    const confirmationRows = confirmations.map((item) => ({
      id: item.id,
      ts: item.ts,
      label: 'Confirmacion de campo',
      origin: 'PROMOTOR',
      sector: 'Monte Sinai Alto',
      meta: item.detalle,
      actor: item.autor_id,
      synced: true,
      syncTs: item.ts,
      foto: '',
    }));
    return [...reportRows, ...signalRows, ...confirmationRows].sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());
  }, [confirmations, reports, sectors, signals]);

  return (
    <main className={`${embedded ? 'coe coe-embedded' : 'coe'} ${mobileFrame ? 'coe-mobile-frame' : ''}`.trim()}>
      <section className="map-wrap">
        <SectorMap sectors={sectors} reports={reports} events={events} dark satellite={satellite} onSectorClick={setSelected} />
        <div className="satellite-control">
          <label>
            <input type="checkbox" checked={satellite} onChange={(event) => setSatellite(event.target.checked)} />
            Deformacion Sentinel-1 - DEMO
          </label>
          <span>Precomputado · actualizado 04/09/2026 · mm/anio</span>
          <div className="legend"><b className="nodata" /> sin datos <b className="mid" /> 3-8 <b className="high" /> &gt;8</div>
        </div>
      </section>
      <aside className="ops-panel">
        <h1>COE Guayaquil</h1>
        <p className="principle">El satelite indica donde mirar. Los vecinos muestran que esta cambiando. El promotor confirma en campo. El COE decide la accion.</p>
        {latest?.sector_id === 'monte-sinai' && selected.id !== 'monte-sinai' && (
          <Button variant="warning" className="full-width attention" onClick={() => setSelected(sectors.find((item) => item.id === 'monte-sinai') ?? selected)}>
            Ver evento Monte Sinai
          </Button>
        )}
        <div className={`level ${selected.nivel}`}>{selected.nombre} · {selected.nivel.toUpperCase()}</div>
        <dl className="facts">
          <div><dt>Poblacion</dt><dd>{selected.poblacion}</dd></div>
          <div><dt>Viviendas</dt><dd>{selected.viviendas}</dd></div>
          <div><dt>Sentinel-1</dt><dd>{selected.deformacion_mm_anio <= 1.5 ? 'sin datos' : `${selected.deformacion_mm_anio} mm/anio`}</dd></div>
          <div><dt>Ultimo reporte</dt><dd>{selected.ultimo_reporte_ts ? new Date(selected.ultimo_reporte_ts).toLocaleDateString() : '0 reportes en 90 dias'}</dd></div>
          <div><dt>Sin respuesta GAD</dt><dd>{selected.dias_sin_respuesta_gad} dias</dd></div>
        </dl>

        <h2>Cola unificada</h2>
        <div className="queue">
          {queue.slice(0, 8).map((item) => (
            <article className="queue-item" key={item.id}>
              <span className={`origin-badge ${item.origin.toLowerCase().replace(/\s+/g, '-')}`}>{item.origin}</span>
              <strong>{item.label}</strong>
              <span>{item.sector} · {item.meta}</span>
              <span>Captura: {new Date(item.ts).toLocaleTimeString()} · Sync: {item.syncTs ? new Date(item.syncTs).toLocaleTimeString() : 'pendiente'}</span>
              <span>{item.synced ? 'Sincronizado' : 'Pendiente'} · {item.actor}</span>
              {item.foto && <img src={item.foto} alt="Evidencia" />}
            </article>
          ))}
        </div>

        {latest && (
          <div className="event-card">
            <strong>{latest.senales.length || 1} senales · {latest.radio_m} m · {latest.ventana_s} s · dispositivos distintos</strong>
            <span>Nivel interno: {latest.nivel}{latest.confirmado_por_promotor ? ' · confirmado por promotor' : ''}</span>
          </div>
        )}

        {alertSpeechText && (
          <div className="tts-card">
            <strong>TTS</strong>
            <p>{alertSpeechText}</p>
            <Button variant="destructive" size="sm" onClick={replayAlert}>Reproducir voz</Button>
          </div>
        )}

        {selected.id === 'monte-sinai' && (
          <>
            <h2>Linea fotografica MS-P07</h2>
            <div className="timeline">
              {timeline.map((item) => (
                <figure key={item.id}>
                  <img src={item.foto_url} alt={`Grieta ${item.id}`} />
                  <figcaption>{new Date(item.ts).toLocaleDateString('es-EC', { day: '2-digit', month: 'short' })}</figcaption>
                </figure>
              ))}
            </div>
          </>
        )}
        <Button variant="secondary" className="full-width" onClick={() => deescalate(selected.id)}>Desescalar manualmente</Button>
      </aside>
    </main>
  );
}
