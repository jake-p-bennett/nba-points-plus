import { getLeaderboard, getDistribution, getMetadata } from "@/lib/data";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Leaderboard from "@/components/Leaderboard";
import SearchBar from "@/components/SearchBar";
import DistributionChart from "@/components/DistributionChart";

export default function Home() {
  const players = getLeaderboard();
  const distribution = getDistribution();
  const metadata = getMetadata();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
        {/* Hero section */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-2">
            Points<span className="text-amber-500">+</span> Leaderboard
          </h2>
          <p className="text-slate-400 text-sm max-w-lg mx-auto">
            Scoring volume relative to league average (100), adjusted for opponent
            defensive strength and game pace. Data as of {metadata.asOfDate}.
          </p>
        </div>

        {/* Search */}
        <div className="mb-8 flex justify-center">
          <SearchBar players={players} />
        </div>

        {/* Distribution chart */}
        <div className="mb-8">
          <DistributionChart data={distribution} players={players} />
        </div>

        {/* Leaderboard */}
        <Leaderboard players={players} />
      </main>

      <Footer asOfDate={metadata.asOfDate} />
    </div>
  );
}
