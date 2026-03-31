import { CryptoTicker } from '@/components/crypto-ticker';

export default function Page() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-background py-12 overflow-hidden">
      <CryptoTicker />
    </main>
  );
}
