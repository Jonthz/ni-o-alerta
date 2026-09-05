import { MapPinned } from 'lucide-react';
import { useStore } from '../store';
import { SectorMap } from './Map';
import { Button } from './components/Button';

const priorityPoints = [
  {
    id: 'MS-P07',
    nombre: 'MS-P07',
    lat: -2.091,
    lon: -79.9881,
    detalle: 'Prioridad alta por deformacion acumulada Sentinel-1',
  },
  {
    id: 'MS-Ladera-02',
    nombre: 'Ladera norte',
    lat: -2.0899,
    lon: -79.9874,
    detalle: 'Punto rojo de vigilancia satelital',
  },
  {
    id: 'MS-Canal-03',
    nombre: 'Canal de agua',
    lat: -2.0922,
    lon: -79.989,
    detalle: 'Cambio observado cerca de viviendas',
  },
];

export function PromotorView({ compact = false }: { compact?: boolean }) {
  const { sectors, forceRed } = useStore();
  return (
    <main className={compact ? 'promotor shell compact-view' : 'promotor shell'}>
      <header className="topbar">
        <div>
          <span className="eyebrow">Delegado comunitario</span>
          <h1>Puntos por revisar</h1>
        </div>
        <strong className="offline-badge">MODO OFFLINE — datos cacheados el 04/09</strong>
      </header>

      <section className="sentinel-card simple-sentinel">
        <span>Dato satelital precomputado para demostracion</span>
        <h2><MapPinned size={22} /> 3 puntos rojos para mirar primero</h2>
        <p>El satelite no predice. Solo marca donde conviene que la comunidad revise.</p>
      </section>

      <div className="promotor-grid">
        <SectorMap sectors={sectors.filter((item) => item.id === 'monte-sinai')} priorityPoints={priorityPoints} satellite />
        <aside className="house-list simple-list">
          <Button variant="destructive" size="lg" onClick={forceRed}>Confirmar alerta</Button>
          {priorityPoints.map((point, index) => (
            <article className="priority-row" key={point.id}>
              <strong>{index + 1}. {point.nombre}</strong>
              <span>{point.detalle}</span>
            </article>
          ))}
        </aside>
      </div>
    </main>
  );
}
