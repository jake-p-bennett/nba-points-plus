import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getMetadata } from "@/lib/data";

export default function AboutPage() {
  const metadata = getMetadata();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Leaderboard
        </Link>

        <h1 className="text-3xl font-bold text-white mb-2">
          About Points<span className="text-amber-500">+</span>
        </h1>
        <p className="text-slate-400 text-sm mb-8">
          Methodology and calculation details
        </p>

        <div className="space-y-8 text-slate-300 leading-relaxed">
          {/* What is Points+ */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">What is Points+?</h2>
            <p>
              Points+ is a context-adjusted scoring metric for NBA players, inspired by
              stats like <strong className="text-white">OPS+</strong> and{" "}
              <strong className="text-white">wRC+</strong> in baseball. It measures how
              a player&apos;s scoring output compares to the league average after accounting
              for the difficulty of their opponents.
            </p>
            <p className="mt-3">
              A Points+ of <strong className="text-white">100</strong> means a player
              scores exactly at the league average rate. A Points+ of{" "}
              <strong className="text-white">130</strong> means a player scores 30% above
              average, while <strong className="text-white">80</strong> means 20% below.
            </p>
          </section>

          {/* Why adjust? */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Why adjust raw scoring?</h2>
            <p>
              Raw points per game doesn&apos;t tell the whole story. A player who scores
              28 PPG against elite defenses is arguably more impressive than one who
              scores 28 PPG against the league&apos;s weakest teams. Similarly, a player
              on a fast-paced team will have more possessions (and therefore more
              opportunities to score) than one on a slow-paced team.
            </p>
            <p className="mt-3">
              Points+ adjusts for both of these factors to give a fairer comparison
              across all players.
            </p>
          </section>

          {/* The Formula */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">The Formula</h2>
            <p className="mb-4">Points+ is calculated in three steps:</p>

            <div className="rounded-lg border border-slate-800 bg-slate-900 p-5 space-y-5">
              {/* Step 1 */}
              <div>
                <h3 className="text-sm font-medium text-amber-500 uppercase tracking-wider mb-2">
                  Step 1: Adjust each game
                </h3>
                <code className="block bg-slate-950 rounded px-4 py-3 text-sm text-emerald-400 overflow-x-auto">
                  adjusted_pts = raw_pts &times; (league_avg_def_rating / opp_def_rating) &times; (league_avg_pace / opp_pace)
                </code>
                <ul className="mt-3 space-y-1.5 text-sm text-slate-400">
                  <li>
                    <strong className="text-slate-300">Opponent Defense:</strong> If the
                    opponent has a lower (better) defensive rating than league average,
                    the player&apos;s points are scaled up to credit them for scoring
                    against a tough defense.
                  </li>
                  <li>
                    <strong className="text-slate-300">Pace:</strong> If the opponent
                    plays at a faster pace than average, points are scaled down since
                    more possessions means more scoring opportunities.
                  </li>
                </ul>
              </div>

              {/* Step 2 */}
              <div>
                <h3 className="text-sm font-medium text-amber-500 uppercase tracking-wider mb-2">
                  Step 2: Compute adjusted PPG
                </h3>
                <code className="block bg-slate-950 rounded px-4 py-3 text-sm text-emerald-400 overflow-x-auto">
                  adjusted_ppg = sum(adjusted_pts) / games_played
                </code>
                <p className="mt-2 text-sm text-slate-400">
                  Each player&apos;s adjusted points are summed across all their games and
                  divided by games played to get their adjusted points per game.
                </p>
              </div>

              {/* Step 3 */}
              <div>
                <h3 className="text-sm font-medium text-amber-500 uppercase tracking-wider mb-2">
                  Step 3: Scale to league average = 100
                </h3>
                <code className="block bg-slate-950 rounded px-4 py-3 text-sm text-emerald-400 overflow-x-auto">
                  Points+ = (player_adjusted_ppg / league_avg_adjusted_ppg) &times; 100
                </code>
                <p className="mt-2 text-sm text-slate-400">
                  The final Points+ value is the player&apos;s adjusted PPG divided by the
                  league average adjusted PPG, scaled so that 100 represents the average
                  qualifying player.
                </p>
              </div>
            </div>
          </section>

          {/* Key Inputs */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Key Inputs</h2>
            <div className="rounded-lg border border-slate-800 bg-slate-900 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="px-4 py-2.5 text-left text-xs font-medium uppercase text-slate-400">Input</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium uppercase text-slate-400">Source</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium uppercase text-slate-400">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  <tr>
                    <td className="px-4 py-2.5 text-white font-medium">DEF_RATING</td>
                    <td className="px-4 py-2.5 text-slate-400">Team Advanced Stats</td>
                    <td className="px-4 py-2.5 text-slate-400">Points allowed per 100 possessions. Lower = better defense.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 text-white font-medium">PACE</td>
                    <td className="px-4 py-2.5 text-slate-400">Team Advanced Stats</td>
                    <td className="px-4 py-2.5 text-slate-400">Possessions per 48 minutes. Higher = faster game tempo.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 text-white font-medium">PTS</td>
                    <td className="px-4 py-2.5 text-slate-400">Player Game Logs</td>
                    <td className="px-4 py-2.5 text-slate-400">Raw points scored in each individual game.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 text-white font-medium">MATCHUP</td>
                    <td className="px-4 py-2.5 text-slate-400">Player Game Logs</td>
                    <td className="px-4 py-2.5 text-slate-400">Used to identify the opponent for each game.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Qualifying Criteria */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Qualifying Criteria</h2>
            <p>To appear on the leaderboard, a player must meet both of these thresholds:</p>
            <ul className="mt-3 space-y-2">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                <span>
                  <strong className="text-white">Minimum {metadata.qualifyingCriteria.minGames} games played</strong> — filters
                  out players with small sample sizes
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                <span>
                  <strong className="text-white">Minimum {metadata.qualifyingCriteria.minMpg} minutes per game</strong> — ensures
                  players have meaningful playing time
                </span>
              </li>
            </ul>
            <p className="mt-3 text-sm text-slate-400">
              This yields {metadata.totalQualifyingPlayers} qualifying players for the {metadata.season} season.
            </p>
          </section>

          {/* Color Scale */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Color Scale</h2>
            <p className="mb-4">Points+ values are color-coded for quick visual reference:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <ColorScaleItem color="bg-amber-500 text-black" range="150+" label="Elite" />
              <ColorScaleItem color="bg-emerald-500 text-white" range="130-149" label="Excellent" />
              <ColorScaleItem color="bg-teal-500 text-white" range="110-129" label="Above Average" />
              <ColorScaleItem color="bg-slate-500 text-white" range="90-109" label="Average" />
              <ColorScaleItem color="bg-orange-500 text-white" range="70-89" label="Below Average" />
              <ColorScaleItem color="bg-red-500 text-white" range="Below 70" label="Well Below Average" />
            </div>
          </section>

          {/* Limitations */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Limitations</h2>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-500 shrink-0" />
                <span>
                  Opponent defensive rating and pace are season-level averages, not
                  per-game values. A team&apos;s defense may vary game-to-game due to
                  injuries, rest, or matchup strategy.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-500 shrink-0" />
                <span>
                  The metric does not account for a player&apos;s own team context — a
                  primary option on a bad team may have inflated volume compared to a
                  secondary scorer on a great team.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-500 shrink-0" />
                <span>
                  Points+ only measures scoring output. It does not capture playmaking,
                  defense, rebounding, or other contributions.
                </span>
              </li>
            </ul>
          </section>

          {/* Data Source */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Data Source</h2>
            <p>
              All data is sourced from the official NBA stats API via the{" "}
              <strong className="text-white">nba_api</strong> Python package. The data
              pipeline fetches player game logs, team advanced statistics, and player
              biographical information for the {metadata.season} regular season.
            </p>
            <p className="mt-3 text-sm text-slate-400">
              Data last updated: {metadata.asOfDate}
            </p>
          </section>
        </div>
      </main>

      <Footer asOfDate={metadata.asOfDate} />
    </div>
  );
}

function ColorScaleItem({ color, range, label }: { color: string; range: string; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2">
      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${color}`}>
        {range}
      </span>
      <span className="text-sm text-slate-400">{label}</span>
    </div>
  );
}
