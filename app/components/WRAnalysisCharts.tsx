'use client';

import React from 'react';
import {
  ComposedChart,
  Line,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface AnalysisChartsProps {
  data: any[];
  historicalData?: any[];
  onLoadHistorical?: () => void;
  loadingHistorical?: boolean;
}

export function WRAnalysisCharts({ data, historicalData = [], onLoadHistorical, loadingHistorical }: AnalysisChartsProps) {
  if (!data || !Array.isArray(data)) return <div className="p-4 text-slate-400">Keine Daten verfügbar.</div>;

  const vectorData = data.slice(0, 40).map((d: any) => ({
    name: d.name, avgStd: d.standardPointsPerGame, avgSim: d.pointsPerGame, cvStd: d.cvStandard || 0, cvSim: d.cvSimulated || 0
  }));

  const historicalVectorData = historicalData.map((d: any) => ({
    name: d.name, avgSim: d.pointsPerGame, cvSim: d.cvSimulated || 0, avgStd: d.standardPointsPerGame, cvStd: d.cvStandard || 0
  }));

  const allAvgsCurrent = [...vectorData.map(d => d.avgStd), ...vectorData.map(d => d.avgSim)];
  const minXCurrent = Math.floor(Math.min(...allAvgsCurrent) * 10) / 10;
  const maxXCurrent = Math.ceil(Math.max(...allAvgsCurrent) * 10) / 10;
  const ticksCurrent = Array.from({ length: 10 }, (_, i) => Number((minXCurrent + i * ((maxXCurrent - minXCurrent) / 9)).toFixed(1)));

  const allAvgsCombined = Array.from({ length: 10 }, (_, i) => Number((minXCurrent + i * ((maxXCurrent - minXCurrent) / 9)).toFixed(2)));
  const allAvgsCombinedActual = [...allAvgsCombined, ...historicalVectorData.map((d: any) => d.avgSim)];

  const minXCombined = Math.floor(Math.min(...allAvgsCombinedActual) * 10) / 10;
  const maxXCombined = Math.ceil(Math.max(...allAvgsCombinedActual) * 10) / 10;
  const ticksCombined = Array.from({ length: 10 }, (_, i) => Number((minXCombined + i * ((maxXCombined - minXCombined) / 9)).toFixed(1)));

  const getLinearFit = (points: { avg: number; cv: number }[], xMin: number, xMax: number) => {
    const n = points.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    points.forEach(p => { sumX += p.avg; sumY += p.cv; sumXY += p.avg * p.cv; sumXX += p.avg * p.avg; });
    const m = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const b = (sumY - m * sumX) / n;
    return [{ avg: xMin, cv: m * xMin + b }, { avg: xMax, cv: m * xMax + b }];
  };

  const fitStd = getLinearFit(vectorData.map((d: any) => ({ avg: d.avgStd, cv: d.cvStd })), minXCurrent, maxXCurrent);
  const fitSim = getLinearFit(vectorData.map((d: any) => ({ avg: d.avgSim, cv: d.cvSim })), minXCurrent, maxXCurrent);

  const fitHistStd = getLinearFit(historicalVectorData.map((d: any) => ({ avg: d.avgStd, cv: d.cvStd })), minXCombined, maxXCombined);
  const fitHistSim = getLinearFit(historicalVectorData.map((d: any) => ({ avg: d.avgSim, cv: d.cvSim })), minXCombined, maxXCombined);

  const tooltipContent = (props: any) => {
    if (props.active && props.payload && props.payload.length) {
      const data = props.payload[0].payload;
      return (
        <div className="bg-slate-800 p-2 border border-slate-700 rounded shadow text-sm text-white">
          <p className="font-bold">{data.name}</p>
          <p>Ø Punkte: {Number(data.avg || data.avgSim || 0).toFixed(2)}</p>
          <p>Varianz: {Number(data.cv || data.cvSim || 0).toFixed(2)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 p-4">
      <div className="bg-slate-800 p-4 rounded-lg shadow border border-slate-700">
        <h3 className="text-lg font-semibold mb-4 text-white">Stabilitäts-Vektor: {new Date().getFullYear()}</h3>
        <div className="h-96">
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" dataKey="avg" domain={[minXCurrent, maxXCurrent]} ticks={ticksCurrent} stroke="#94a3b8" />
              <YAxis type="number" dataKey="cv" stroke="#94a3b8" />
              <Tooltip content={tooltipContent} />
              <Legend />
              <Scatter name="Simuliert" data={vectorData.map(d => ({ avg: d.avgSim, cv: d.cvSim, name: d.name }))} fill="#6366f1" />
              <Scatter name="Standard" data={vectorData.map(d => ({ avg: d.avgStd, cv: d.cvStd, name: d.name }))} fill="#f59e0b" />
              <Line data={fitStd} dataKey="cv" stroke="#f59e0b" strokeWidth={2} dot={false} name="Trend Standard" />
              <Line data={fitSim} dataKey="cv" stroke="#6366f1" strokeWidth={2} dot={false} name="Trend Simuliert" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="p-4 bg-slate-900 border border-slate-700 rounded-lg text-center space-y-2">
        {historicalData.length === 0 ? (
          <>
            <button
            onClick={onLoadHistorical}
            disabled={loadingHistorical}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition disabled:opacity-50"
          >
            {loadingHistorical ? 'Lade Daten...' : 'Historische Daten (2022-2025) laden'}
          </button>
            <p className="text-xs text-slate-400">Hinweis: Das Laden und Simulieren kann etwas dauern.</p>
          </>
        ) : (
          <p className="text-green-400 font-semibold">Historische Daten geladen.</p>
      )}
    </div>

      {historicalData.length > 0 && (
        <div className="bg-slate-800 p-4 rounded-lg shadow border border-slate-700">
          <h3 className="text-lg font-semibold mb-4 text-white">Historisch Simuliert vs. Standard</h3>
          <div className="h-96">
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" dataKey="avg" domain={[minXCombined, maxXCombined]} ticks={ticksCombined} stroke="#94a3b8" />
                <YAxis type="number" dataKey="cv" stroke="#94a3b8" />
                <Tooltip content={tooltipContent} />
                <Legend verticalAlign="top" height={36} />
                <Scatter name="Hist. Simuliert" data={historicalVectorData.map((d: any) => ({ avg: d.avgSim, cv: d.cvSim, name: d.name }))} fill="#6366f1" />
                <Scatter name="Hist. Standard" fill="#f59e0b" data={historicalVectorData.map((d: any) => ({ avg: d.avgStd, cv: d.cvStd, name: d.name }))} />
                <Line data={fitHistStd} dataKey="cv" stroke="#f59e0b" strokeWidth={2} dot={false} name="Trend Hist. Std" />
                <Line data={fitHistSim} dataKey="cv" stroke="#6366f1" strokeWidth={2} dot={false} name="Trend Hist. Sim" />
              </ComposedChart>
            </ResponsiveContainer>
    </div>
        </div>
      )}
    </div>
  );
}