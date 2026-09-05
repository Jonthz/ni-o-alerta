import { PISO_REPUTACION, REPUTACION_DEFAULT, UMBRAL_INSAR_ALTO, UMBRAL_INSAR_MEDIO, VENTANA_CORROBORACION_H } from '../constants';
import type { Autor, ReporteVigilancia, Sector } from '../types';

export const scoreReport = (report: ReporteVigilancia, reports: ReporteVigilancia[], sectors: Sector[], authors: Autor[]) => {
  const author = authors.find((item) => item.id === report.autor_id);
  const reputation = Math.max(PISO_REPUTACION, author?.reportes_previos ? author.reportes_confirmados / author.reportes_previos : REPUTACION_DEFAULT);
  const start = new Date(report.ts).getTime() - VENTANA_CORROBORACION_H * 60 * 60 * 1000;
  const reportTime = new Date(report.ts).getTime();
  const independent = new Set(
    reports
      .filter((item) => {
        const itemTime = new Date(item.ts).getTime();
        return item.sector_id === report.sector_id && itemTime >= start && itemTime <= reportTime && item.id !== report.id;
      })
      .map((item) => item.autor_id),
  ).size;
  const corroboration = Math.min(1, independent / 3);
  const deformation = sectors.find((item) => item.id === report.sector_id)?.deformacion_mm_anio ?? 0;
  const insar = deformation > UMBRAL_INSAR_ALTO ? 1 : deformation >= UMBRAL_INSAR_MEDIO ? 0.5 : 0;
  const score = 0.4 * reputation + 0.35 * corroboration + 0.25 * insar;
  return Number(score.toFixed(2));
};

export const stateForScore = (score: number): ReporteVigilancia['estado'] => {
  if (score >= 0.3) return 'corroborado';
  return 'sin_verificar';
};
