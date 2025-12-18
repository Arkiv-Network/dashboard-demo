import { BlockSearchCard } from "@/features/blocks/components/BlockSearchCard";
import { LatestBlocksCard } from "@/features/blocks/components/LatestBlocksCard";
import { GasPriceHeatmapCard } from "@/features/gas-price/components/GasPriceHeatmapCard";
import { GasPriceTrendCard } from "@/features/gas-price/components/GasPriceTrendCard";
import { GlmTransferCard } from "@/features/glm-transfers/components/GlmTransferCard";
import { TransactionHeatmapCard } from "@/features/transactions/components/TransactionHeatmapCard";
import { TransactionHistoryCard } from "@/features/transactions/components/TransactionHistoryCard";
import { LatestBlockHighlight } from "./features/blocks/components/LatestBlockHighlight";
import AverageGasPriceHighlight from "./features/gas-price/components/AverageGasPriceHighlight";
import CurrentGasPriceHighlight from "./features/gas-price/components/CurrentGasPriceHighlight";
import AverageTransactionsHighlight from "./features/transactions/components/AverageTransactionsHighlight";

function App() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Background image - top right */}
      <img
        src={`${import.meta.env.BASE_URL}blocks.webp`}
        alt=""
        className="pointer-events-none absolute right-0 top-0 z-0 h-[500px] xl:h-[600px] 2xl:h-[750px] select-none"
      />
      <header className="relative overflow-hidden bg-transparent pb-40 pt-12 text-grey-900">
        <div className="relative z-10 mx-auto max-w-[1600px] px-3 sm:px-10">
          <div className="flex flex-col gap-10 ">
            <div className="space-y-6 rounded-2xl bg-background/80 backdrop-blur-sm p-6 sm:p-8 lg:max-w-[75%] xl:max-w-[50%]">
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl text-balance">
                Ethereum Dashboard powered by{" "}
                <a
                  className="text-orange-600 hover:scale-105 inline-block transition-all"
                  href="https://arkiv.network"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  [ARKIV]
                </a>
              </h1>
              <p className="text-base text-grey-600 sm:text-lg">
                Monitor Ethereum&apos;s latest blocks, transaction flow, and gas
                price shifts through Arkiv&apos;s real-time data snapshots.
              </p>
            </div>

            <div className="grid gap-4 grid-cols-2 lg:grid-cols-[repeat(4,minmax(0,250px))] md:pl-8">
              <LatestBlockHighlight />
              <AverageTransactionsHighlight />
              <AverageGasPriceHighlight />
              <CurrentGasPriceHighlight />
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-20 -mt-24 pb-20">
        <div className="mx-auto w-full max-w-[1600px] space-y-16 px-3 text-foreground sm:px-10 lg:px-16 xl:space-y-20">
          <main className="grid gap-12 xl:gap-14" id="overview">
            <section className="grid gap-6 xl:grid-cols-12" id="blocks">
              <LatestBlocksCard className="xl:col-span-8" />
              <BlockSearchCard className="xl:col-span-4" />
            </section>

            <section className="grid gap-6 xl:grid-cols-12" id="glm-transfers">
              <GlmTransferCard className="xl:col-span-12" />
            </section>

            <section className="grid gap-6 xl:grid-cols-12" id="transactions">
              <TransactionHistoryCard className="xl:col-span-7" />
              <GasPriceTrendCard className="xl:col-span-5" />
            </section>

            <section className="grid gap-6 xl:grid-cols-12" id="gas">
              <TransactionHeatmapCard className="xl:col-span-6" />
              <GasPriceHeatmapCard className="xl:col-span-6" />
            </section>
          </main>
        </div>
      </div>

      <footer className="bg-blue-500 py-8">
        <div className="mx-auto max-w-[1600px] px-3 sm:px-10 lg:px-16">
          <p className="text-center text-sm text-white">
            Built with{" "}
            <a
              href="https://arkiv.network"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-white underline-offset-4 hover:underline"
            >
              [ARKIV]
            </a>{" "}
            ·{" "}
            <a
              href="https://github.com/arkiv-network/dashboard-demo"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-white underline-offset-4 hover:underline"
            >
              View on GitHub
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
