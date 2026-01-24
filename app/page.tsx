import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-900 to-blue-900 text-white py-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold mb-6">
            Invest in Sierra Leone's Future
          </h1>
          <p className="text-xl mb-8 text-gray-200">
            Bridge the gap between Diaspora capital and local youth-led agricultural enterprises.
            Secure, transparent, and impactful investing powered by Blockchain and AI.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/explore"
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-full transition duration-300"
            >
              Start Investing
            </Link>
            <Link
              href="/farmers"
              className="bg-transparent border-2 border-white hover:bg-white hover:text-green-900 text-white font-bold py-3 px-8 rounded-full transition duration-300"
            >
              For Farmers
            </Link>
            <Link
              href="/marketplace"
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-full transition duration-300 shadow-lg"
            >
              Marketplace
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-gray-900">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          <div className="bg-gray-800 p-8 rounded-xl border border-gray-700">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-2xl font-bold mb-4 text-white">Trust Layer</h3>
            <p className="text-gray-400">
              Blockchain-backed escrow ensures your funds are only released when milestones are met.
              Powered by Celo and USDC.
            </p>
          </div>
          <div className="bg-gray-800 p-8 rounded-xl border border-gray-700">
            <div className="text-4xl mb-4">🧠</div>
            <h3 className="text-2xl font-bold mb-4 text-white">Intelligence Layer</h3>
            <p className="text-gray-400">
              AI-driven credit scoring analyzes rainfall, crop risk, and farmer experience to
              assess investment viability.
            </p>
          </div>
          <div className="bg-gray-800 p-8 rounded-xl border border-gray-700">
            <div className="text-4xl mb-4">📱</div>
            <h3 className="text-2xl font-bold mb-4 text-white">Experience Layer</h3>
            <p className="text-gray-400">
              Seamless mobile experience for farmers and investors.
              Real-time updates and transparent tracking.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12 text-white">How It Works</h2>
          <div className="space-y-8 text-left">
            <div className="flex items-start gap-4">
              <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold">1</div>
              <div>
                <h4 className="text-xl font-bold text-white">Farmer Uploads Project</h4>
                <p className="text-gray-400">Farmers submit their land size, crop type, and location details.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold">2</div>
              <div>
                <h4 className="text-xl font-bold text-white">AI Risk Assessment</h4>
                <p className="text-gray-400">Our AI engine calculates a Trust Score based on environmental and historical data.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold">3</div>
              <div>
                <h4 className="text-xl font-bold text-white">Investor Funds Project</h4>
                <p className="text-gray-400">Investors browse high-score projects and fund them using USDC.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold">4</div>
              <div>
                <h4 className="text-xl font-bold text-white">Smart Escrow Release</h4>
                <p className="text-gray-400">Funds are released in milestones as the farmer proves progress.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
