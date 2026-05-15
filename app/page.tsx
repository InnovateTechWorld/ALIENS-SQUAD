import Link from 'next/link'
import {
  Recycle,
  QrCode,
  Wallet,
  ArrowRight,
  CheckCircle,
  Leaf,
  Coins,
  ScanLine,
  Zap,
} from 'lucide-react'
import AnimateOnScroll from '@/components/AnimateOnScroll'
import PayoutToast from '@/components/PayoutToast'

export default function Home() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* ─── NAVBAR ─────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="p-2 bg-green-600 rounded-lg">
              <Recycle className="text-white" size={20} />
            </div>
            <span className="text-xl font-bold text-gray-900">RecyclePay</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-gray-500 hover:text-gray-900 font-medium transition-colors text-sm">
              How It Works
            </a>
            <a href="#impact" className="text-gray-500 hover:text-gray-900 font-medium transition-colors text-sm">
              Impact
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/auth" className="text-gray-600 font-medium hover:text-gray-900 transition-colors text-sm">
              Sign In
            </Link>
            <Link
              href="/auth"
              className="bg-green-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-green-700 transition-colors text-sm"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── HERO (load animations — fire on page load) ─────────── */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left: copy */}
            <div>
              

              <h1 className="anim-fade-up delay-100 text-5xl md:text-6xl font-extrabold text-gray-900 leading-[1.1] mb-6">
                Turn your recyclables into{' '}
                <span className="text-green-600">instant cash.</span>
              </h1>

              <p className="anim-fade-up delay-200 text-xl text-gray-500 mb-10 leading-relaxed max-w-lg">
                Scan, drop, and withdraw your rewards directly to your bank.
                Earn ₦100 for every bottle you recycle.
              </p>

              <div className="anim-fade-up delay-300 flex flex-wrap gap-4 mb-10">
                <Link
                  href="/auth"
                  className="inline-flex items-center gap-2 bg-green-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-green-700 hover:scale-[1.02] active:scale-100 transition-all shadow-lg shadow-green-100"
                >
                  Start Earning
                  <ArrowRight size={20} />
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center gap-2 bg-gray-100 text-gray-800 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-200 hover:scale-[1.02] active:scale-100 transition-all"
                >
                  Find a Bin
                </a>
              </div>

              <div className="anim-fade-in delay-500 flex flex-wrap gap-6">
                {['AI-Verified Detection', 'Instant Bank Withdrawal', '100% Free to Use'].map((label) => (
                  <div key={label} className="flex items-center gap-2 text-gray-600">
                    <CheckCircle className="text-green-500 shrink-0" size={17} />
                    <span className="text-sm font-medium">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Photo collage — desktop */}
            <div className="relative h-[520px] hidden lg:block">

              {/* Payout toast — anchored inside the hero collage */}
              <PayoutToast />

              {/* Eco badge */}
              <div className="anim-fade-in delay-400 anim-float-slow absolute top-2 right-0 z-20 flex items-center gap-2 bg-green-600 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg">
                <Leaf size={13} />
                Eco-Verified
              </div>

              {/* Large main photo */}
              <div className="anim-fade-right delay-200 absolute right-0 top-10 w-[88%] h-[355px] rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&h=500"
                  alt="Happy community recycling volunteers"
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>

              {/* Secondary photo — local asset */}
              <div className="anim-scale-in delay-400 absolute left-0 bottom-2 w-[43%] h-[210px] rounded-3xl overflow-hidden shadow-xl border-4 border-white z-10">
                <img
                  src="/image-smiling.jpg"
                  alt="Person using RecyclePay app"
                  className="w-full h-full object-cover object-top transition-transform duration-700 hover:scale-105"
                />
              </div>

              {/* Floating earnings card */}
              <div className="anim-scale-in delay-600 anim-float absolute right-4 bottom-6 z-20 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 w-48">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center">
                    <Coins className="text-green-600" size={16} />
                  </div>
                  <span className="text-xs font-bold text-gray-700">Today&apos;s Earnings</span>
                </div>
                <p className="text-2xl font-extrabold text-gray-900">₦5,340</p>
                <p className="text-xs text-gray-400 mt-0.5">across 234 users</p>
                <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full w-3/4 bg-green-500 rounded-full" />
                </div>
              </div>
            </div>

            {/* Mobile: single image */}
            <div className="anim-fade-in lg:hidden rounded-3xl overflow-hidden shadow-xl h-64">
              <img
                src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&h=400"
                alt="Happy community recycling volunteers"
                className="w-full h-full object-cover"
              />
            </div>

          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS (scroll-triggered) ────────────────────── */}
      <section id="how-it-works" className="py-24 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">

          <div className="text-center mb-16">
            <AnimateOnScroll animation="anim-fade-up" as="span"
              className="inline-block text-green-600 font-bold text-sm tracking-widest uppercase"
            >
              Simple Process
            </AnimateOnScroll>
            <AnimateOnScroll animation="anim-fade-up" delay="delay-100" as="h2"
              className="text-4xl md:text-5xl font-bold text-gray-900 mt-3 mb-4"
            >
              How It Works
            </AnimateOnScroll>
            <AnimateOnScroll animation="anim-fade-up" delay="delay-200" as="p"
              className="text-gray-500 text-lg max-w-md mx-auto"
            >
              Three steps to turn your plastic into money.
            </AnimateOnScroll>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            <AnimateOnScroll animation="anim-fade-up" delay="delay-200"
              className="group bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1.5 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="w-9 h-9 bg-green-600 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0">1</div>
                <div className="h-px flex-1 bg-gray-100 group-hover:bg-green-100 transition-colors" />
              </div>
              <div className="w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <QrCode className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Scan &amp; Unlock</h3>
              <p className="text-gray-500 leading-relaxed text-sm">
                Open the app and scan the QR code on any RecyclePay bin to unlock it instantly.
              </p>
            </AnimateOnScroll>

            <AnimateOnScroll animation="anim-fade-up" delay="delay-300"
              className="group bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1.5 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="w-9 h-9 bg-green-600 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0">2</div>
                <div className="h-px flex-1 bg-gray-100 group-hover:bg-green-100 transition-colors" />
              </div>
              <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <ScanLine className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Deposit &amp; Detect</h3>
              <p className="text-gray-500 leading-relaxed text-sm">
                Drop your items. Our smart hardware verifies the recyclables instantly using AI vision.
              </p>
            </AnimateOnScroll>

            <AnimateOnScroll animation="anim-fade-up" delay="delay-400"
              className="group bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1.5 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="w-9 h-9 bg-green-600 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0">3</div>
                <div className="h-px flex-1 bg-gray-100 group-hover:bg-green-100 transition-colors" />
              </div>
              <div className="w-14 h-14 bg-yellow-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Wallet className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Earn &amp; Withdraw</h3>
              <p className="text-gray-500 leading-relaxed text-sm">
                Watch your balance grow and cash out instantly to your Nigerian bank account.
              </p>
            </AnimateOnScroll>

          </div>
        </div>
      </section>

      {/* ─── IMPACT (scroll-triggered) ───────────────────────────── */}
      <section id="impact" className="py-24 px-6 bg-gray-950 overflow-hidden">
        <div className="max-w-6xl mx-auto">

          <div className="text-center mb-16">
            <AnimateOnScroll animation="anim-fade-up" as="span"
              className="inline-block text-green-400 font-bold text-sm tracking-widest uppercase"
            >
              Our Impact
            </AnimateOnScroll>
            <AnimateOnScroll animation="anim-fade-up" delay="delay-100" as="h2"
              className="text-4xl md:text-5xl font-bold text-white mt-3"
            >
              Numbers that matter.
            </AnimateOnScroll>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            <AnimateOnScroll animation="anim-scale-in" delay="delay-200"
              className="text-center p-10 bg-gray-900 rounded-3xl border border-gray-800 hover:border-green-800 hover:-translate-y-1 transition-all duration-300"
            >
              <Recycle className="text-green-400 mx-auto mb-5 anim-float" size={36} />
              <div className="text-5xl font-bold text-white mb-2">10,000+</div>
              <div className="text-gray-400 font-medium">Bottles Recycled</div>
            </AnimateOnScroll>

            <AnimateOnScroll animation="anim-scale-in" delay="delay-300"
              className="text-center p-10 bg-green-600 rounded-3xl hover:-translate-y-1 transition-all duration-300"
            >
              <Coins className="text-white mx-auto mb-5 anim-float" size={36} />
              <div className="text-5xl font-bold text-white mb-2">₦100K+</div>
              <div className="text-green-100 font-medium">Paid to Users</div>
            </AnimateOnScroll>

            <AnimateOnScroll animation="anim-scale-in" delay="delay-400"
              className="text-center p-10 bg-gray-900 rounded-3xl border border-gray-800 hover:border-green-800 hover:-translate-y-1 transition-all duration-300"
            >
              <Leaf className="text-green-400 mx-auto mb-5 anim-float" size={36} />
              <div className="text-5xl font-bold text-white mb-2">5 Tons</div>
              <div className="text-gray-400 font-medium">Plastic Diverted</div>
            </AnimateOnScroll>

          </div>
        </div>
      </section>

      {/* ─── CALL TO ACTION (scroll-triggered) ──────────────────── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <AnimateOnScroll animation="anim-fade-up" as="h2"
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight"
          >
            Ready to start{' '}
            <span className="text-green-600">earning?</span>
          </AnimateOnScroll>
          <AnimateOnScroll animation="anim-fade-up" delay="delay-100" as="p"
            className="text-xl text-gray-500 mb-10 leading-relaxed"
          >
            Join thousands of Nigerians turning plastic into real money.
            It&apos;s free, instant, and good for the planet.
          </AnimateOnScroll>
          <AnimateOnScroll animation="anim-fade-up" delay="delay-200">
            <Link
              href="/auth"
              className="inline-flex items-center gap-3 bg-green-600 text-white px-10 py-5 rounded-xl font-bold text-xl hover:bg-green-700 hover:scale-[1.03] active:scale-100 transition-all shadow-2xl shadow-green-100"
            >
              Get Started — It&apos;s Free
              <ArrowRight size={22} />
            </Link>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ─── FOOTER ─────────────────────────────────────────────── */}
      <footer className="bg-gray-950 text-gray-500 py-12 px-6">
        <AnimateOnScroll animation="anim-fade-in"
          className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <Link href="/" className="flex items-center gap-2.5">
            <div className="p-2 bg-green-600 rounded-lg">
              <Recycle className="text-white" size={16} />
            </div>
            <span className="text-white font-bold">RecyclePay</span>
          </Link>
          <p className="text-sm">© 2026 RecyclePay. Built for a greener Nigeria.</p>
          <div className="flex gap-6 text-sm">
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#impact" className="hover:text-white transition-colors">Impact</a>
            <Link href="/auth" className="hover:text-white transition-colors">Sign In</Link>
          </div>
        </AnimateOnScroll>
      </footer>

    </div>
  )
}
