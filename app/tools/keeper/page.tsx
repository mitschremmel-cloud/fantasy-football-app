// app/tools/keeper/page.tsx

// Ändere diese Zeile:
import KeeperCalculator from '../../components/KeeperCalculator';

export default function KeeperPage() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold text-white mb-6">Keeper Calculator</h1>
      <KeeperCalculator />
    </main>
  );
}