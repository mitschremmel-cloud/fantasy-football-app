'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  ComposedChart,
  Line,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { KickerPerformanceMetrics } from '@/app/utils/nflverse/statsAnalysisKicker';


export interface KickerScoringWeights {
  fg0_19: number; miss0_19: number;
  fg20_29: number; miss20_29: number;
  fg30_39: number; miss30_39: number;
  fg40_49: number; miss40_49: number;
  fg50_59: number; miss50_59: number;
  fg60plus: number; miss60plus: number;
  fg_inc: number;
  pat: number; patMiss: number;
}

interface AnalysisChartsProps {
  data: KickerPerformanceMetrics[];
  historicalData: KickerPerformanceMetrics[];
  onLoadHistorical: () => void;
  loadingHistorical: boolean;
}

export function KickerAnalysisCharts({ data, historicalData = [], onLoadHistorical, loadingHistorical }: any) {
  if (!data || !Array.isArray(data)) return <div className="p-4 text-slate-400">Keine Daten verfügbar.</div>;

  // Daten vorbereiten...
  const vectorData = data.slice(0, 20).map((d: any) => ({
    name: d.name, avgStd: d.avgStandard, avgSim: d.avgSimulated, cvStd: d.cvStandard, cvSim: d.cvSimulated
  }));

  const historicalVectorData = historicalData.map((d: any) => ({
    name: d.name, avgSim: d.avgSimulated, cvSim: d.cvSimulated, avgStd: d.avgStandard, cvStd: d.cvStandard
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
        <div className="bg-white p-2 border border-gray-300 rounded shadow text-sm text-black">
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

      {/* 1. Aktuelles Jahr */}
      <div className="bg-white p-4 rounded-lg shadow">

        <h3 className="text-lg font-semibold mb-4">Stabilitäts-Vektor: {new Date().getFullYear()}</h3>
        <div className="h-96">
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis type="number" dataKey="avg" domain={[minXCurrent, maxXCurrent]} ticks={ticksCurrent} />
              <YAxis type="number" dataKey="cv" />
              <Tooltip content={tooltipContent} />
              <Legend />
              <Scatter name="Simuliert" data={vectorData.map(d => ({ avg: d.avgSim, cv: d.cvSim, name: d.name }))} fill="#8884d8" />
              <Scatter name="Standard" data={vectorData.map(d => ({ avg: d.avgStd, cv: d.cvStd, name: d.name }))} fill="#f59e0b" />
              <Line data={fitStd} dataKey="cv" stroke="#f59e0b" strokeWidth={2} dot={false} name="Trend Standard" />
              <Line data={fitSim} dataKey="cv" stroke="#8884d8" strokeWidth={2} dot={false} name="Trend Simuliert" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Button zum Laden der historischen Daten */}
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
            <p className="text-xs text-slate-200">
              Hinweis: Das Laden und Simulieren der historischen Daten kann einige Zeit in Anspruch nehmen.
            </p>
          </>
        ) : (
          <p className="text-green-400 font-semibold">Historische Daten geladen.</p>
      )}
    </div>

      {/* 2. Varianz-Graph: Historisch (erscheint nach Klick) */}
      {historicalData.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Historisch Simuliert vs. Standard</h3>
          <div className="h-96">
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis type="number" dataKey="avg" domain={[minXCombined, maxXCombined]} ticks={ticksCombined} />
                <YAxis type="number" dataKey="cv" />

                <Tooltip content={tooltipContent} />
                <Legend verticalAlign="top" height={36} />

                <Scatter
                  name="Hist. Simuliert"
                  data={historicalVectorData.map((d: any) => ({ avg: d.avgSim, cv: d.cvSim, name: d.name }))}
                  fill="#8884d8"
                />
                <Scatter
                  name="Hist. Standard"
                  data={historicalVectorData.map((d: any) => ({ avg: d.avgStd, cv: d.cvStd, name: d.name }))}
                  fill="#82ca9d"
                />
                <Line data={fitHistStd} dataKey="cv" stroke="#f59e0b" strokeWidth={2} dot={false} name="Trend Hist. Std" />
                <Line data={fitHistSim} dataKey="cv" stroke="#8884d8" strokeWidth={2} dot={false} name="Trend Hist. Sim" />
              </ComposedChart>
            </ResponsiveContainer>
    </div>
        </div>
      )}
    </div>
  );
}

