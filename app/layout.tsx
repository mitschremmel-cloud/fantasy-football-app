// app/layout.tsx
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className="flex flex-col md:flex-row h-screen overflow-hidden bg-slate-900">
        
        {/* Desktop Sidebar / Mobile Bottom Nav */}
        <nav className="fixed bottom-0 w-full md:w-64 md:h-full md:relative bg-gray-900 text-white flex md:flex-col justify-around md:justify-start p-4 z-50">
          <a href="/" className="p-2">Dashboard</a>
          <a href="/spielplan" className="p-2">Spielplan</a>
          <a href="/historie" className="p-2">Draft-Historie</a>
          <a href="/regelbacklog" className="p-2">Regel-Backlog</a>
          <a href="/tools/keeper" className="p-2">Keeper</a>
        </nav>

        {/* Hauptinhalt */}
        <main className="flex-1 overflow-y-auto p-4 mb-16 md:mb-0 bg-slate-900">
          {children}
        </main>
      </body>
    </html>
  );
}