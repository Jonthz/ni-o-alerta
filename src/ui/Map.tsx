import { Circle, GeoJSON, MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import type { Evento, ReporteVigilancia, Sector, Vivienda } from '../types';

const colors = { verde: '#16a34a', amarillo: '#eab308', naranja: '#ea580c', rojo: '#dc2626' };

const marker = new L.DivIcon({ className: 'dot-marker', html: '<span></span>', iconSize: [16, 16] });
const homeMarker = new L.DivIcon({ className: 'home-marker', html: '<span></span>', iconSize: [14, 14] });
const priorityMarker = new L.DivIcon({ className: 'priority-marker', html: '<span></span>', iconSize: [30, 30] });

export function SectorMap({ sectors, reports = [], events = [], viviendas = [], priorityPoints = [], dark = false, satellite = false, onSectorClick }: {
  sectors: Sector[];
  reports?: ReporteVigilancia[];
  events?: Evento[];
  viviendas?: Vivienda[];
  priorityPoints?: Array<{ id: string; nombre: string; lat: number; lon: number; detalle: string }>;
  dark?: boolean;
  satellite?: boolean;
  onSectorClick?: (sector: Sector) => void;
}) {
  return (
    <MapContainer center={[-2.096, -79.965]} zoom={12} scrollWheelZoom className={dark ? 'map dark-map' : 'map'}>
      <TileLayer
        attribution="&copy; OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {sectors.map((sector) => (
        <GeoJSON
          key={`${sector.id}-${sector.nivel}-${satellite ? 'sat' : 'base'}`}
          data={sector.geometry}
          eventHandlers={{ click: () => onSectorClick?.(sector) }}
          style={{
            color: satellite ? deformationColor(sector.deformacion_mm_anio) : colors[sector.nivel],
            fillColor: satellite ? deformationColor(sector.deformacion_mm_anio) : colors[sector.nivel],
            fillOpacity: satellite ? 0.5 : dark ? 0.36 : 0.22,
            weight: 2,
          }}
        />
      ))}
      {sectors.map((sector) => {
        const [lon, lat] = sector.geometry.coordinates[0][0];
        return (
          <Marker key={`label-${sector.id}`} position={[lat + 0.004, lon + 0.004]} icon={labelIcon(sector.nombre)}>
            <Popup>{sector.nombre}</Popup>
          </Marker>
        );
      })}
      {reports.map((report) => (
        <Marker key={report.id} position={[report.lat, report.lon]} icon={marker} opacity={0.35 + report.score * 0.65}>
          <Popup>{report.id} · score {report.score}</Popup>
        </Marker>
      ))}
      {viviendas.map((home) => (
        <Marker key={home.id} position={[home.lat, home.lon]} icon={homeMarker}>
          <Popup>{home.id} · {home.personas} personas · {home.estado}</Popup>
        </Marker>
      ))}
      {priorityPoints.map((point) => (
        <Marker key={point.id} position={[point.lat, point.lon]} icon={priorityMarker}>
          <Popup><strong>{point.nombre}</strong><br />{point.detalle}</Popup>
        </Marker>
      ))}
      {events.map((event) => (
        <Circle key={event.id} center={[event.centroide.lat, event.centroide.lon]} radius={event.radio_m} pathOptions={{ color: colors[event.nivel], fillColor: colors[event.nivel], fillOpacity: 0.22 }} />
      ))}
    </MapContainer>
  );
}

const deformationColor = (value: number) => {
  if (value <= 1.5) return '#6b7280';
  if (value > 8) return '#dc2626';
  if (value >= 3) return '#ea580c';
  return '#eab308';
};

const labelIcon = (name: string) => new L.DivIcon({
  className: 'sector-label',
  html: `<span>${name}</span>`,
  iconSize: [120, 24],
});
