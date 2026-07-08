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
import { calculateKickerSimulation } from '@/app/utils/nflverse/kickerLogic';

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
    avg: d.avgSimulated,
    cvStd: d.cvStandard,
    cvSim: d.cvSimulated
  }));

  // Dynamische Achsen für den Varianz-Plot
  const minCV = Math.min(...vectorData.map(d => Math.min(d.cvStd, d.cvSim))) * 0.9;
  const maxCV = Math.max(...vectorData.map(d => Math.max(d.cvStd, d.cvSim))) * 1.1;

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
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={vectorData} margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" dataKey="avg" name="Ø Pts" label={{ value: 'Ø Punkte/Spiel', position: 'bottom', offset: 20 }} />
              <YAxis
                type="number"
                name="CV"
                label={{ value: 'Varianzkoeffizient', angle: -90, position: 'insideLeft', offset: 10 }}
              />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} formatter={(value: any) => (typeof value === 'number' ? value.toFixed(1) : value)} />
              <Legend verticalAlign="top" height={36} />

              {/* Verbindungslinie als "Richtung" */}
              {vectorData.map((entry, index) => (
              <Line
                  key={`line-${index}`}
                  data={[
                    { avg: entry.avg, cv: entry.cvStd },
                    { avg: entry.avg, cv: entry.cvSim }
                  ]}
                  dataKey="cv"
                  stroke="#64748b"
                  strokeWidth={1.5}
                  dot={false}
                  legendType="none"
              />
              ))}

              {/* Startpunkt (Standard) als Kreis */}
              <Scatter name="Standard" dataKey="cvStd" fill="#82ca9d" shape="circle" />
              {/* Endpunkt (Simuliert) als Kreis */}
              <Scatter name="Simuliert" dataKey="cvSim" fill="#8884d8" shape="circle" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

