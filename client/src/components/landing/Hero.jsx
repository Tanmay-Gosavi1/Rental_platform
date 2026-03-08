import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    LoaderPinwheel, ChevronDown, ArrowRight,
    Star, Shield, Zap, Menu, X
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'

/* ── smooth-scroll helper ── */
const scrollTo = (id, e) => {
    e?.preventDefault()
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const NAV_LINKS = [
    { label: 'About', id: 'about' },
    { label: 'Fleet', id: 'vehicles' },
    { label: 'Features', id: 'features' },
    { label: 'Help', id: 'help' },
]

/* ═══════════════════════════ NAVBAR ═══════════════════════════ */
const Navbar = () => {
    const navigate = useNavigate()
    const { user, isAuthenticated, isAdmin, logout } = useAuth()
    const [scrolled, setScrolled] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)
    const [userDropOpen, setUserDropOpen] = useState(false)

    useEffect(() => {
        const handler = () => setScrolled(window.scrollY > 20)
        window.addEventListener('scroll', handler)
        return () => window.removeEventListener('scroll', handler)
    }, [])

    useEffect(() => {
        const handler = (e) => {
            if (!e.target.closest('#user-drop-btn')) setUserDropOpen(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
            scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100' : 'bg-transparent'
        }`}>
            <div className="max-w-7xl mx-auto px-5 sm:px-8">
                <div className="flex items-center justify-between h-16 sm:h-[4.5rem]">

                    {/* Logo */}
                    <button onClick={() => scrollTo('hero-top')} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <LoaderPinwheel className="h-6 w-6 sm:h-7 sm:w-7" />
                        <span className="text-xl sm:text-2xl font-bold tracking-tight">Rentify</span>
                    </button>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-8">
                        {NAV_LINKS.map((l) => (
                            <a key={l.id} href={`#${l.id}`} onClick={(e) => scrollTo(l.id, e)}
                                className="text-sm font-semibold text-gray-700 hover:text-black transition-colors relative group">
                                {l.label}
                                <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-black group-hover:w-full transition-all duration-300 rounded-full" />
                            </a>
                        ))}
                    </nav>

                    {/* Auth */}
                    <div className="hidden md:flex items-center gap-3">
                        {!isAuthenticated ? (
                            <button onClick={() => navigate('/login')}
                                className="px-5 py-2.5 bg-black text-white text-sm font-semibold rounded-full hover:bg-gray-800 transition-all hover:scale-105 active:scale-95">
                                Get Started
                            </button>
                        ) : (
                            <div className="relative" id="user-drop-btn">
                                <button onClick={() => setUserDropOpen((v) => !v)}
                                    className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
                                    <div className="w-8 h-8 rounded-lg bg-black text-white text-sm font-bold flex items-center justify-center">
                                        {user?.username?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="text-left hidden sm:block">
                                        <p className="text-sm font-semibold leading-none">{user?.username}</p>
                                        <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[120px]">{user?.email}</p>
                                    </div>
                                    <ChevronDown size={14} className={`text-gray-500 transition-transform ${userDropOpen ? 'rotate-180' : ''}`} />
                                </button>
                                <AnimatePresence>
                                    {userDropOpen && (
                                        <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 8, scale: 0.95 }} transition={{ duration: 0.15 }}
                                            className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden z-50">
                                            <button onClick={() => { navigate(isAdmin ? '/admin' : '/dashboard'); setUserDropOpen(false) }}
                                                className="w-full px-4 py-3 text-sm font-medium text-left hover:bg-gray-50 transition-colors">Dashboard</button>
                                            <button onClick={() => { navigate('/profile'); setUserDropOpen(false) }}
                                                className="w-full px-4 py-3 text-sm font-medium text-left hover:bg-gray-50 transition-colors">My Profile</button>
                                            <div className="border-t border-gray-100" />
                                            <button onClick={() => { logout(); setUserDropOpen(false) }}
                                                className="w-full px-4 py-3 text-sm font-medium text-left text-red-600 hover:bg-red-50 transition-colors">Logout</button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>

                    {/* Mobile hamburger */}
                    <button className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        onClick={() => setMenuOpen((v) => !v)} aria-label="Toggle menu">
                        {menuOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}
                        className="md:hidden bg-white border-t border-gray-100 overflow-hidden shadow-lg">
                        <div className="px-5 py-4 flex flex-col gap-1">
                            {NAV_LINKS.map((l) => (
                                <a key={l.id} href={`#${l.id}`} onClick={(e) => { scrollTo(l.id, e); setMenuOpen(false) }}
                                    className="py-3 px-3 text-sm font-semibold text-gray-700 hover:text-black hover:bg-gray-50 rounded-lg transition-colors">
                                    {l.label}
                                </a>
                            ))}
                            <div className="pt-3 border-t border-gray-100 mt-2">
                                {!isAuthenticated ? (
                                    <button onClick={() => { navigate('/login'); setMenuOpen(false) }}
                                        className="w-full py-3 bg-black text-white text-sm font-semibold rounded-xl">Get Started</button>
                                ) : (
                                    <div className="space-y-1">
                                        <button onClick={() => { navigate(isAdmin ? '/admin' : '/dashboard'); setMenuOpen(false) }}
                                            className="w-full py-3 px-3 text-sm font-semibold text-left hover:bg-gray-50 rounded-lg">Dashboard</button>
                                        <button onClick={() => { logout(); setMenuOpen(false) }}
                                            className="w-full py-3 px-3 text-sm font-semibold text-left text-red-600 hover:bg-red-50 rounded-lg">Logout</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    )
}

/* ═══════════════════════════ HERO ═══════════════════════════ */
const Hero = () => {
    const navigate = useNavigate()
    const { isAuthenticated, isAdmin } = useAuth()
    const handleCTA = () => navigate(isAuthenticated ? (isAdmin ? '/admin' : '/vehicles') : '/login')

    return (
        <>
            <Navbar />
            <section id="hero-top" className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-white pt-16">

                {/* Background decorations */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-gray-100 opacity-60 blur-3xl" />
                    <div className="absolute bottom-0 -left-32 w-[450px] h-[450px] rounded-full bg-gray-50 opacity-80 blur-3xl" />
                    <svg className="absolute inset-0 w-full h-full opacity-[0.035]" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="dp" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
                                <circle cx="1.5" cy="1.5" r="1.5" fill="#000" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#dp)" />
                    </svg>
                </div>

                <div className="relative max-w-7xl mx-auto px-5 sm:px-8 w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-center py-20 lg:py-0 min-h-[calc(100vh-4rem)]">

                        {/* ── Left ── */}
                        <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.7, ease: 'easeOut' }}
                            className="flex flex-col gap-7 order-2 lg:order-1">

                            {/* Live badge */}
                            <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-white shadow-sm w-fit">
                                <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-xs font-semibold text-gray-700 tracking-wide">India's #1 Vehicle Rental Platform</span>
                            </motion.div>

                            {/* Headline */}
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3, duration: 0.6 }}
                                className="space-y-1">
                                <h1 className="text-5xl sm:text-6xl xl:text-[4.5rem] font-black leading-[1.05] tracking-tight text-gray-900">
                                    Drive Your
                                </h1>
                                <h1 className="text-5xl sm:text-6xl xl:text-[4.5rem] font-black leading-[1.05] tracking-tight text-gray-900 relative inline-block">
                                    Dream Car
                                    <motion.svg initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                                        transition={{ delay: 0.9, duration: 0.7, ease: 'easeOut' }}
                                        className="absolute -bottom-2 left-0 w-full overflow-visible"
                                        viewBox="0 0 300 10" fill="none" preserveAspectRatio="none" style={{ height: '10px' }}>
                                        <motion.path d="M2 7 C70 2, 150 9, 230 5 C270 2, 290 6, 298 4"
                                            stroke="#000" strokeWidth="3" strokeLinecap="round"
                                            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                                            transition={{ delay: 0.9, duration: 0.7 }} />
                                    </motion.svg>
                                </h1>
                                <h1 className="text-5xl sm:text-6xl xl:text-[4.5rem] font-black leading-[1.05] tracking-tight text-gray-300">
                                    Today.
                                </h1>
                            </motion.div>

                            {/* Subtitle */}
                            <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5, duration: 0.5 }}
                                className="text-base sm:text-lg text-gray-500 leading-relaxed max-w-[420px]">
                                Browse 500+ premium vehicles in Bangalore — sedans, SUVs, bikes & more.
                                Book in minutes, pay securely, hit the road.
                            </motion.p>

                            {/* CTAs */}
                            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6, duration: 0.5 }}
                                className="flex flex-wrap items-center gap-3">
                                <button onClick={handleCTA}
                                    className="flex items-center gap-2 px-7 py-3.5 bg-black text-white text-sm font-bold rounded-full hover:bg-gray-800 active:scale-95 transition-all duration-200 shadow-lg shadow-black/20">
                                    Explore Fleet <ArrowRight size={16} />
                                </button>
                                <a href="#about" onClick={(e) => scrollTo('about', e)}
                                    className="flex items-center gap-2 px-7 py-3.5 border-2 border-gray-200 text-sm font-bold rounded-full hover:border-black hover:bg-gray-50 active:scale-95 transition-all duration-200">
                                    How It Works
                                </a>
                            </motion.div>

                            {/* Trust row */}
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                transition={{ delay: 0.75, duration: 0.5 }}
                                className="flex flex-wrap items-center gap-5 pt-1">
                                <div className="flex items-center gap-2.5">
                                    <div className="flex -space-x-2">
                                        {['#6366f1','#ec4899','#f59e0b','#10b981'].map((c, i) => (
                                            <div key={i} className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                                                style={{ backgroundColor: c }}>
                                                {['A','R','S','K'][i]}
                                            </div>
                                        ))}
                                    </div>
                                    <span className="text-sm text-gray-500 font-medium">10K+ happy riders</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    {[1,2,3,4,5].map(s => <Star key={s} size={13} className="fill-yellow-400 text-yellow-400" />)}
                                    <span className="text-sm font-bold">4.8</span>
                                    <span className="text-sm text-gray-400">(2.3K reviews)</span>
                                </div>
                            </motion.div>

                            {/* Feature pills */}
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                transition={{ delay: 0.9, duration: 0.5 }}
                                className="flex flex-wrap gap-2">
                                {[
                                    { icon: Shield, label: 'Fully Insured' },
                                    { icon: Zap, label: 'Instant Booking' },
                                    { icon: ArrowRight, label: 'Free Cancellation' },
                                ].map(({ icon: Icon, label }) => (
                                    <span key={label}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-700 rounded-full">
                                        <Icon size={12} className="text-black" />{label}
                                    </span>
                                ))}
                            </motion.div>
                        </motion.div>

                        {/* ── Right: Car + floating cards ── */}
                        <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                            className="relative flex items-center justify-center order-1 lg:order-2">

                            <div className="absolute inset-4 rounded-[3rem] bg-gradient-to-br from-gray-100 to-gray-200 opacity-60 blur-2xl" />

                            <div className="relative w-full max-w-xl mx-auto">
                                <div className="relative rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-200 shadow-2xl shadow-black/10 aspect-[4/3]">
                                    <img src="/car.png" alt="Premium car"
                                        className="w-full h-full object-cover object-center scale-105"
                                        onError={(e) => {
                                            e.target.src = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&auto=format&fit=crop&q=80'
                                        }} />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent" />
                                </div>

                                {/* Float: Rating */}
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1.0, duration: 0.5 }}
                                    className="absolute -top-5 -left-3 sm:-left-10 bg-white rounded-2xl shadow-xl border border-gray-100 px-4 py-3 flex items-center gap-3 z-10">
                                    <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center flex-shrink-0">
                                        <Star size={20} className="fill-yellow-400 text-yellow-400" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] text-gray-400 font-medium">Avg. Rating</p>
                                        <p className="text-base font-black leading-none">4.8 / 5</p>
                                    </div>
                                </motion.div>

                                {/* Float: Booking speed */}
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1.1, duration: 0.5 }}
                                    className="absolute -bottom-5 -left-3 sm:-left-10 bg-white rounded-2xl shadow-xl border border-gray-100 px-4 py-3 flex items-center gap-3 z-10">
                                    <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                                        <Zap size={20} className="text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] text-gray-400 font-medium">Booking</p>
                                        <p className="text-sm font-black leading-none">Under 2 mins</p>
                                    </div>
                                </motion.div>

                                {/* Float: Fleet */}
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1.2, duration: 0.5 }}
                                    className="absolute -top-5 -right-3 sm:-right-10 bg-black text-white rounded-2xl shadow-xl px-4 py-3 z-10">
                                    <p className="text-[11px] text-gray-400 font-medium">Fleet Size</p>
                                    <p className="text-base font-black leading-none">500+ Cars</p>
                                </motion.div>

                                {/* Float: Insured */}
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1.3, duration: 0.5 }}
                                    className="absolute -bottom-5 -right-3 sm:-right-10 bg-white rounded-2xl shadow-xl border border-gray-100 px-4 py-3 flex items-center gap-2.5 z-10">
                                    <Shield size={18} className="text-blue-600 flex-shrink-0" />
                                    <div>
                                        <p className="text-[11px] text-gray-400">100%</p>
                                        <p className="text-sm font-black leading-none">Insured</p>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Scroll hint */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 cursor-pointer"
                    onClick={() => scrollTo('brands-section')}>
                    <span className="text-[10px] font-semibold text-gray-400 tracking-[0.2em] uppercase">Scroll</span>
                    <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}>
                        <ChevronDown size={18} className="text-gray-400" />
                    </motion.div>
                </motion.div>
            </section>
        </>
    )
}

export default Hero