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
}

export function KickerAnalysisCharts({ data }: AnalysisChartsProps) {
  // Wir nutzen exakt die Daten, die wir bekommen, sortiert nach Leistung
  const sortedData = [...data]
    .sort((a, b) => (b.avgSimulated || 0) - (a.avgSimulated || 0));
  const barData = sortedData.slice(0, 10).map(k => ({
    name: k.name,
    avgStandard: Number(k.avgStandard.toFixed(1)),
    avgSimulated: Number(k.avgSimulated.toFixed(1))
    }));

  const vectorData = sortedData.slice(0, 20).map(d => ({
    name: d.name,
    avgStd: d.avgStandard,
    avgSim: d.avgSimulated,
    cvStd: d.cvStandard,
    cvSim: d.cvSimulated
  }));

  // Dynamische Achsen für den Varianz-Plot
  const allAvgs = [...vectorData.map(d => d.avgStd), ...vectorData.map(d => d.avgSim)];
  const minX = Math.floor(Math.min(...allAvgs) * 10) / 10;
  const maxX = Math.ceil(Math.max(...allAvgs) * 10) / 10;

  // Berechne 10 gleichmäßige Ticks über den gesamten Bereich
  const tickCount = 10;
  const tickStep = (maxX - minX) / (tickCount - 1);
  const ticks = Array.from({ length: tickCount }, (_, i) =>
    Number((minX + i * tickStep).toFixed(1))
  );

  const minY = Math.min(...vectorData.map(d => Math.min(d.cvStd, d.cvSim))) * 0.9;
  const maxY = Math.max(...vectorData.map(d => Math.max(d.cvStd, d.cvSim))) * 1.1;

  const stdSim = Math.sqrt(vectorData.map((d: any) => Math.pow((d.avg || 0) - d.avg, 2)).reduce((a:number, b:number) => a + b, 0) / vectorData.length);

  return (
    <div className="space-y-8 p-4">
      {/* 1. Vergleich: Standard vs Simuliert (JETZT OBEN) */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Top 10 Kicker: Standard vs. Simulation</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" label={{ value: 'Spieler', position: 'insideBottom', offset: -25 }} />
              <YAxis label={{ value: 'Ø Punkte', angle: -90, position: 'insideLeft', offset: 10 }} />
              <Tooltip formatter={(value: any) => (typeof value === 'number' ? value.toFixed(1) : value)} />
              <Legend verticalAlign="top" height={36} />
              <Bar dataKey="avgStandard" name="Standard Avg" fill="#82ca9d" />
              <Bar dataKey="avgSimulated" name="Simulated Avg" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Stabilitäts-Vektor (ComposedChart) */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Stabilitäts-Vektor (Top 20)</h3>
        <div className="h-96">
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={vectorData} margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                dataKey="avg"
                name="Ø Pts"
                domain={[minX, maxX]}
                ticks={ticks}
                tickFormatter={(val) => val.toFixed(1)}
                label={{ value: 'Ø Punkte/Spiel', position: 'bottom', offset: 20 }}
              />
              <YAxis
                type="number"
                dataKey="cv"
                name="CV"
                label={{ value: 'Varianzkoeffizient', angle: -90, position: 'insideLeft', offset: 10 }}
              />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    // Da wir im Scatter-Plot sind, ist payload[0] meist der Punkt, auf dem wir sind.
                    // Wir durchsuchen das payload-Array nach dem Objekt, das 'name' besitzt.
                    const data = payload[0].payload;
                    console.log('Detailed Payload Data:', data);

                    return (
                      <div className="bg-white p-2 border border-gray-300 rounded shadow text-sm text-black">
                        <p className="font-bold">{data.name || 'Unbekannt'}</p>
                        <p>Ø Punkte: {Number(data.avg || 0).toFixed(2)}</p>
                        <p>Varianzkoeffizient: {Number(data.cv || 0).toFixed(2)}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend verticalAlign="top" height={36} />
              {/* Wir mappen die Daten so, dass sie direkt dem X/Y-Schema des Charts entsprechen */}
              {vectorData.map((entry, index) => (
              <Line
                  key={`line-${index}`}
                  data={[
                    { avg: entry.avgStd, cv: entry.cvStd, name: entry.name },
                    { avg: entry.avgSim, cv: entry.cvSim, name: entry.name }
                  ]}
                  dataKey="cv"
                  stroke="#64748b"
                  strokeWidth={1}
                  dot={false}
                  legendType="none"
              />
              ))}

              <Scatter
                name="Standard"
                data={vectorData.map(d => ({ avg: d.avgStd, cv: d.cvStd, name: d.name }))}
                fill="#82ca9d"
              />
              <Scatter
                name="Simulated"
                data={vectorData.map(d => ({ avg: d.avgSim, cv: d.cvSim, name: d.name }))}
                fill="#8884d8"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

