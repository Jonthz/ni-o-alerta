import { useStore } from '../store';
import { SectorMap } from './Map';
import type { Vivienda } from '../types';
import { Button } from './components/Button';

const states: Vivienda['estado'][] = ['sin_dato', 'evacuado', 'sin_contacto', 'afectado'];

export function PromotorView({ compact = false }: { compact?: boolean }) {
  const { sectors, viviendas, forceRed, updateHouse } = useStore();
  return (
    <main className={compact ? 'promotor shell compact-view' : 'promotor shell'}>
      <header className="topbar">
        <div>
          <span className="eyebrow">Promotor comunitario</span>
          <h1>Monte Sinai Alto</h1>
        </div>
        <strong className="offline-badge">MODO OFFLINE — datos cacheados el 04/09</strong>
      </header>
      <section className="sentinel-card">
        <span>Dato satelital precomputado para demostracion</span>
        <h2>PRIORIDAD ALTA DE INSPECCION</h2>
        <ul>
          <li>Deformacion Sentinel-1: 11,2 mm/anio.</li>
          <li>Tendencia: movimiento elevado.</li>
          <li>Reportes vecinales recientes: 9.</li>
          <li>Punto prioritario: MS-P07.</li>
          <li>Ultima actualizacion satelital: 04/09/2026.</li>
          <li>Calidad/confianza del dato: alta.</li>
          <li>Accion sugerida: inspeccionar MS-P07 y contactar las viviendas cercanas.</li>
        </ul>
        <ol>
          <li>MS-P07 - prioridad alta.</li>
          <li>Viviendas cercanas sin contacto.</li>
          <li>Otros puntos con reportes recientes.</li>
        </ol>
      </section>
      <div className="promotor-grid">
        <SectorMap sectors={sectors.filter((item) => item.id === 'monte-sinai')} viviendas={viviendas} />
        <aside className="house-list">
          <Button variant="destructive" size="lg" onClick={forceRed}>Confirmar alerta</Button>
          {viviendas.map((home) => (
            <label key={home.id}>
              <span>{home.id} · {home.personas} personas</span>
              <select value={home.estado} onChange={(event) => updateHouse(home.id, event.target.value as Vivienda['estado'])}>
                {states.map((state) => <option key={state}>{state}</option>)}
              </select>
            </label>
          ))}
        </aside>
      </div>
    </main>
  );
}
