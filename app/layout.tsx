// app/layout.tsx
import './globals.css';
import { Menu } from 'lucide-react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className="flex flex-col h-screen bg-slate-900">
        
        {/* Mobile Header / Desktop Sidebar */}
        <header className="bg-gray-900 text-white p-4 flex justify-between items-center md:hidden z-50">
          <a href="/" className="font-bold">Dashboard</a>

          <details className="relative">
            <summary className="list-none p-2 cursor-pointer">
              <Menu className="w-6 h-6" />
            </summary>
            <nav className="absolute right-0 top-10 w-48 bg-gray-800 rounded-lg shadow-xl p-2 z-50">
              <a href="/ligabetrieb" className="block p-2 hover:bg-gray-700">Ligabetrieb</a>
              <a href="/neuigkeiten" className="block p-2 hover:bg-gray-700">Neuigkeiten</a>
              <a href="/rechner" className="block p-2 hover:bg-gray-700">Rechner Hub</a>
              <a href="/simulatoren" className="block p-2 hover:bg-gray-700">Simulatoren Hub</a>
            </nav>
          </details>
        </header>

        {/* Desktop Sidebar */}
        <nav className="hidden md:flex md:w-64 md:h-full bg-gray-900 text-white md:flex-col p-4 fixed left-0 top-0">
          <a href="/" className="p-2 mb-4 font-bold">Dashboard</a>
          <a href="/neuigkeiten" className="p-2">Neuigkeiten</a>
          <a href="/ligabetrieb" className="p-2">Ligabetrieb</a>
          <a href="/rechner" className="p-2">Rechner Hub</a>
          <a href="/simulatoren" className="p-2">Simulatoren Hub</a>
        </nav>

        {/* Hauptinhalt */}
        <main className="flex-1 overflow-y-auto p-4 md:ml-64 bg-slate-900">
          {children}
        </main>
      </body>
    </html>
  );
}