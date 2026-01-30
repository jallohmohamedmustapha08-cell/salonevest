import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-32 px-4 text-center overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-900 via-emerald-900 to-slate-900 -z-20"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=2938&auto=format&fit=crop')] bg-cover bg-center opacity-20 -z-10 mix-blend-overlay"></div>

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-green-500/20 border border-green-500/30 text-green-300 font-medium text-sm">
            🌱 Bridging Borders for Growth
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-8 tracking-tight text-white leading-tight">
            Invest in <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-200">Sierra Leone's</span> Future
          </h1>
          <p className="text-xl md:text-2xl mb-10 text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Connect with local agricultural enterprises. Secure, transparent, and impactful investing powered by Blockchain and AI.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/explore"
              className="bg-green-600 hover:bg-green-500 text-white font-bold py-4 px-10 rounded-full transition duration-300 shadow-lg shadow-green-900/40 text-lg flex items-center justify-center gap-2"
            >
              Start Investing 🚀
            </Link>
            <Link
              href="/marketplace"
              className="bg-orange-600 hover:bg-orange-500 text-white font-bold py-4 px-10 rounded-full transition duration-300 shadow-lg shadow-orange-900/40 text-lg flex items-center justify-center gap-2"
            >
              Marketplace 🛒
            </Link>
            <Link
              href="/farmers"
              className="glass hover:bg-white/10 text-white font-bold py-4 px-10 rounded-full transition duration-300 border border-white/20 text-lg flex items-center justify-center gap-2"
            >
              For Farmers 🌾
            </Link>
          </div>

          <div className="mt-16 pt-8 border-t border-white/10 flex justify-center gap-12 grayscale opacity-50 hover:opacity-100 transition duration-500">
            {/* Simple Logos or Placeholders for Partners could go here */}
            <div className="text-sm font-semibold tracking-widest uppercase text-gray-500">Trusted By Communities</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Why Choose SaloneVest?</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">We combine cutting-edge technology with on-the-ground agents to ensure your investment is safe and impactful.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass p-8 rounded-3xl border border-white/10 hover:-translate-y-2 transition duration-300">
              <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center text-3xl mb-6 text-blue-400">
                🔒
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Smart Escrow</h3>
              <p className="text-gray-400 leading-relaxed">
                Funds are held securely and only released in milestones. Visual proof of work is required before every payout.
              </p>
            </div>
            <div className="glass p-8 rounded-3xl border border-white/10 hover:-translate-y-2 transition duration-300">
              <div className="w-14 h-14 bg-purple-500/20 rounded-2xl flex items-center justify-center text-3xl mb-6 text-purple-400">
                🧠
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">AI Risk Scoring</h3>
              <p className="text-gray-400 leading-relaxed">
                Our AI analyzes rainfall patterns, soil quality, and market prices to generate a simple Trust Score for every project.
              </p>
            </div>
            <div className="glass p-8 rounded-3xl border border-white/10 hover:-translate-y-2 transition duration-300">
              <div className="w-14 h-14 bg-green-500/20 rounded-2xl flex items-center justify-center text-3xl mb-6 text-green-400">
                📱
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Easy Management</h3>
              <p className="text-gray-400 leading-relaxed">
                Track your portfolio in real-time. Chat directly with farmers and field agents through our secure messaging platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4 bg-slate-900/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">How It Works</h2>
            <p className="text-gray-400">Simple steps to start your investment journey.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-12">
              <div className="flex gap-6 group">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-600 text-white font-bold text-xl flex items-center justify-center ring-4 ring-green-900 shadow-lg group-hover:scale-110 transition">1</div>
                <div>
                  <h4 className="text-xl font-bold text-white mb-2 group-hover:text-green-400 transition">Farmer Uploads Project</h4>
                  <p className="text-gray-400">Farmers verify their identity and submit land size, crop type, and location details.</p>
                </div>
              </div>
              <div className="flex gap-6 group">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-600 text-white font-bold text-xl flex items-center justify-center ring-4 ring-green-900 shadow-lg group-hover:scale-110 transition">2</div>
                <div>
                  <h4 className="text-xl font-bold text-white mb-2 group-hover:text-green-400 transition">AI Verification</h4>
                  <p className="text-gray-400">Our system calculates a Trust Score using satellite data and historical crop yields.</p>
                </div>
              </div>
              <div className="flex gap-6 group">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-600 text-white font-bold text-xl flex items-center justify-center ring-4 ring-green-900 shadow-lg group-hover:scale-110 transition">3</div>
                <div>
                  <h4 className="text-xl font-bold text-white mb-2 group-hover:text-green-400 transition">You Invest</h4>
                  <p className="text-gray-400">Browse high-potential projects and fund them securely using USDC or Local Bank Transfer.</p>
                </div>
              </div>
              <div className="flex gap-6 group">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-600 text-white font-bold text-xl flex items-center justify-center ring-4 ring-green-900 shadow-lg group-hover:scale-110 transition">4</div>
                <div>
                  <h4 className="text-xl font-bold text-white mb-2 group-hover:text-green-400 transition">Milestone Tracking</h4>
                  <p className="text-gray-400">Watch your investment grow. Funds are released only when progress is verified.</p>
                </div>
              </div>
            </div>

            {/* Visual/Image for How it Works */}
            <div className="hidden md:block relative h-full min-h-[400px] rounded-3xl overflow-hidden glass border border-white/10 p-2">
              <div className="absolute inset-2 bg-slate-800 rounded-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
                {/* Abstract representation of the app interface or a nice stock photo */}
                <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1605000797499-95a51c5269ae?q=80&w=2671&auto=format&fit=crop')] bg-cover bg-center"></div>
                <div className="absolute bottom-6 left-6 right-6 z-20">
                  <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-green-500"></div>
                      <div className="h-2 w-24 bg-white/20 rounded-full"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-2 w-full bg-white/10 rounded-full"></div>
                      <div className="h-2 w-2/3 bg-white/10 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
