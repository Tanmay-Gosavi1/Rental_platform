import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Hero from '../../components/landing/Hero'
import axiosInstance from '../../utils/axiosInstance'

/* ── smooth scroll helper (shared across sections) ── */
const scrollTo = (id, e) => {
    e?.preventDefault()
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
import {
    Shield, Clock, CreditCard, Headphones,
    MapPin, Star, Users, Fuel, ChevronRight,
    Facebook, Twitter, Instagram, Youtube,
    LoaderPinwheel, Mail, Phone, ArrowRight,
    CheckCircle, Zap, Award
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

/* ─────────────────── Brand Strip ─────────────────── */
const brands = [
    { name: 'Toyota', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Toyota_carlogo.svg' },
    { name: 'Honda', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Honda_Logo.svg' },
    { name: 'BMW', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/44/BMW.svg' },
    { name: 'Mercedes', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/90/Mercedes-Logo.svg' },
    { name: 'Audi', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/92/Audi-Logo_2016.svg' },
    { name: 'Hyundai', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a3/Hyundai_Motor_Company_logo.svg' },
    { name: 'Kia', logo: 'https://upload.wikimedia.org/wikipedia/commons/1/13/Kia-logo.svg' },
    { name: 'Ford', logo: 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Ford_logo_flat.svg' },
    { name: 'Suzuki', logo: 'https://upload.wikimedia.org/wikipedia/commons/1/12/Suzuki_logo_2.svg' },
    { name: 'Mahindra', logo: 'https://upload.wikimedia.org/wikipedia/commons/e/eb/Mahindra_Logo.svg' },
]
const allBrands = [...brands, ...brands]

const BrandStrip = () => (
    <section id="brands-section" className="py-14 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 mb-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-gray-400">Trusted brands in our fleet</p>
        </div>
        <div className="relative">
            <motion.div
                className="flex items-center gap-16"
                animate={{ x: ['0%', '-50%'] }}
                transition={{ repeat: Infinity, duration: 22, ease: 'linear' }}
                style={{ width: 'max-content' }}
            >
                {allBrands.map((brand, i) => (
                    <div key={i} className="flex items-center justify-center w-28 h-14 grayscale hover:grayscale-0 transition-all duration-300 opacity-50 hover:opacity-100 flex-shrink-0">
                        <img
                            src={brand.logo}
                            alt={brand.name}
                            className="max-h-10 max-w-full object-contain"
                            onError={(e) => {
                                e.target.style.display = 'none'
                                e.target.nextSibling.style.display = 'flex'
                            }}
                        />
                        <span style={{ display: 'none' }} className="text-sm font-bold text-gray-500 items-center justify-center">{brand.name}</span>
                    </div>
                ))}
            </motion.div>
            {/* Fade edges */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-gray-50 to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-gray-50 to-transparent" />
        </div>
    </section>
)

/* ─────────────────── Featured Vehicles ─────────────────── */
const VehicleCard = ({ vehicle }) => {
    const navigate = useNavigate()
    const { isAuthenticated } = useAuth()

    const formatCurrency = (n) =>
        new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

    const handleClick = () => {
        if (isAuthenticated) navigate(`/vehicles/${vehicle.vehicle_id}`)
        else navigate('/login')
    }

    return (
        <motion.div
            whileHover={{ y: -6 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden cursor-pointer group"
            onClick={handleClick}
        >
            <div className="relative h-48 overflow-hidden">
                <img
                    src={vehicle.image_url || 'https://via.placeholder.com/400x250?text=No+Image'}
                    alt={vehicle.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className={`absolute top-3 right-3 px-2 py-0.5 text-xs font-semibold rounded-full ${vehicle.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {vehicle.is_available ? 'Available' : 'Unavailable'}
                </span>
                <span className="absolute top-3 left-3 px-2 py-0.5 text-xs font-semibold bg-black/70 text-white rounded-full capitalize">
                    {vehicle.type}
                </span>
            </div>
            <div className="p-5">
                <h3 className="font-bold text-lg leading-tight">{vehicle.name}</h3>
                <p className="text-gray-400 text-sm">{vehicle.brand} · {vehicle.model}</p>

                <div className="flex items-center gap-3 mt-3 text-gray-500 text-sm">
                    <span className="flex items-center gap-1"><Users size={13} />{vehicle.seats}</span>
                    <span className="flex items-center gap-1"><Fuel size={13} />{vehicle.fuel_type}</span>
                    <span className="flex items-center gap-1"><MapPin size={13} />{vehicle.location}</span>
                </div>

                {vehicle.rating > 0 && (
                    <div className="flex items-center gap-1 mt-2">
                        <Star size={13} className="fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{vehicle.rating}</span>
                        <span className="text-gray-400 text-xs">({vehicle.total_trips} trips)</span>
                    </div>
                )}

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <div>
                        <span className="text-xl font-bold">{formatCurrency(vehicle.price_per_day)}</span>
                        <span className="text-gray-400 text-xs"> /day</span>
                    </div>
                    <button className="flex items-center gap-1 text-sm font-semibold bg-black text-white px-4 py-2 rounded-xl hover:bg-gray-800 transition-colors">
                        Book <ArrowRight size={14} />
                    </button>
                </div>
            </div>
        </motion.div>
    )
}

const FeaturedVehicles = () => {
    const [vehicles, setVehicles] = useState([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()
    const { isAuthenticated } = useAuth()

    useEffect(() => {
        axiosInstance.get('/vehicles?limit=6')
            .then(r => { if (r.data.success) setVehicles(r.data.data.slice(0, 6)) })
            .catch(() => {})
            .finally(() => setLoading(false))
    }, [])

    return (
        <section id="vehicles" className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex items-end justify-between mb-12">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-2">Our Fleet</p>
                        <h2 className="text-4xl font-black">Featured Vehicles</h2>
                        <p className="text-gray-500 mt-2 max-w-md">Handpicked premium vehicles for every occasion — business, leisure, or adventure.</p>
                    </div>
                    <button
                        onClick={() => navigate(isAuthenticated ? '/vehicles' : '/login')}
                        className="hidden md:flex items-center gap-2 px-6 py-3 border-2 border-black rounded-xl font-semibold hover:bg-black hover:text-white transition-all"
                    >
                        View All <ChevronRight size={18} />
                    </button>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="h-72 bg-gray-100 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : vehicles.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {vehicles.map(v => <VehicleCard key={v.vehicle_id} vehicle={v} />)}
                    </div>
                ) : (
                    <div className="text-center py-16 text-gray-400">
                        <p>No vehicles available yet. Check back soon!</p>
                    </div>
                )}

                <div className="mt-10 flex justify-center md:hidden">
                    <button
                        onClick={() => navigate(isAuthenticated ? '/vehicles' : '/login')}
                        className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-xl font-semibold"
                    >
                        View All Vehicles <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        </section>
    )
}

/* ─────────────────── Features Section ─────────────────── */
const features = [
    {
        icon: Shield,
        title: 'Fully Insured',
        desc: 'Every vehicle in our fleet is fully insured so you can drive with complete peace of mind.',
        color: 'bg-blue-50 text-blue-600'
    },
    {
        icon: Zap,
        title: 'Instant Booking',
        desc: 'Book in under 2 minutes. Confirm your dates, pay online, and hit the road.',
        color: 'bg-yellow-50 text-yellow-600'
    },
    {
        icon: CreditCard,
        title: 'Secure Payments',
        desc: 'Powered by Razorpay — UPI, cards, net banking, all accepted with bank-grade security.',
        color: 'bg-green-50 text-green-600'
    },
    {
        icon: Clock,
        title: 'Flexible Hours',
        desc: 'Rent by the day or week. Our flexible plans fit your schedule perfectly.',
        color: 'bg-purple-50 text-purple-600'
    },
    {
        icon: Headphones,
        title: '24/7 Support',
        desc: 'Our support team is always available to assist you before, during, and after your trip.',
        color: 'bg-red-50 text-red-600'
    },
    {
        icon: Award,
        title: 'Top Rated',
        desc: 'Consistently rated 4.8/5 by thousands of happy customers across Bangalore.',
        color: 'bg-orange-50 text-orange-600'
    },
]

const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } }
}
const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
}

const Features = () => {
    const ref = useRef(null)
    const [inView, setInView] = useState(false)

    useEffect(() => {
        const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true) }, { threshold: 0.15 })
        if (ref.current) obs.observe(ref.current)
        return () => obs.disconnect()
    }, [])

    return (
        <section id="features" className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-14">
                    <p className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-2">Why Rentify</p>
                    <h2 className="text-4xl font-black">Everything you need for a<br />perfect rental experience</h2>
                </div>

                <motion.div
                    ref={ref}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    variants={containerVariants}
                    initial="hidden"
                    animate={inView ? 'visible' : 'hidden'}
                >
                    {features.map((f, i) => (
                        <motion.div key={i} variants={itemVariants} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                                <f.icon size={22} />
                            </div>
                            <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}

/* ─────────────────── Stats Banner ─────────────────── */
const stats = [
    { value: '500+', label: 'Vehicles Available' },
    { value: '10K+', label: 'Happy Customers' },
    { value: '4.8★', label: 'Average Rating' },
    { value: '24/7', label: 'Customer Support' },
]

const StatsBanner = () => (
    <section className="py-16 bg-black text-white">
        <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                {stats.map((s, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <p className="text-4xl font-black mb-1">{s.value}</p>
                        <p className="text-gray-400 text-sm">{s.label}</p>
                    </motion.div>
                ))}
            </div>
        </div>
    </section>
)

/* ─────────────────── How It Works ─────────────────── */
const steps = [
    { step: '01', title: 'Choose a Vehicle', desc: 'Browse our fleet and pick the perfect car, bike, or scooty for your trip.' },
    { step: '02', title: 'Book Your Dates', desc: 'Select pickup date, time, and location in just a few clicks.' },
    { step: '03', title: 'Pay Securely', desc: 'Complete payment via UPI, card, or net banking using Razorpay.' },
    { step: '04', title: 'Hit the Road', desc: 'Collect your vehicle and enjoy the ride. Return anytime within your booking window.' },
]

const HowItWorks = () => (
    <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-14">
                <p className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-2">Simple Process</p>
                <h2 className="text-4xl font-black">How it works</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {steps.map((s, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.15 }}
                        className="relative"
                    >
                        {i < steps.length - 1 && (
                            <div className="hidden lg:block absolute top-7 left-[calc(50%+2rem)] w-full h-px border-t-2 border-dashed border-gray-200" />
                        )}
                        <div className="flex flex-col items-center text-center">
                            <div className="w-14 h-14 rounded-2xl bg-black text-white flex items-center justify-center text-xl font-black mb-4 relative z-10">
                                {s.step}
                            </div>
                            <h3 className="text-lg font-bold mb-2">{s.title}</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    </section>
)

/* ─────────────────── CTA Section ─────────────────── */
const CTA = () => {
    const navigate = useNavigate()
    const { isAuthenticated } = useAuth()

    return (
        <section className="py-20 bg-gray-50">
            <div className="max-w-3xl mx-auto px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="bg-black text-white rounded-3xl p-12 md:p-16"
                >
                    <h2 className="text-4xl md:text-5xl font-black mb-4">Ready to hit the road?</h2>
                    <p className="text-gray-300 text-lg mb-8">Join thousands of happy customers. Sign up and get your first rental discount.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => navigate(isAuthenticated ? '/vehicles' : '/login')}
                            className="px-8 py-4 bg-white text-black rounded-xl font-bold hover:bg-gray-100 transition-colors"
                        >
                            {isAuthenticated ? 'Browse Vehicles' : 'Get Started — It\'s Free'}
                        </button>
                        <a href="#features" onClick={(e) => scrollTo('features', e)} className="px-8 py-4 border border-white/30 text-white rounded-xl font-bold hover:bg-white/10 transition-colors">
                            Learn More
                        </a>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}

/* ─────────────────── Footer ─────────────────── */
const Footer = () => {
    const navigate = useNavigate()
    const { isAuthenticated, isAdmin } = useAuth()

    return (
        <footer id="help" className="bg-black text-white pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">
                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <LoaderPinwheel className="h-7 w-7" />
                            <span className="text-xl font-bold">Rentify</span>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed mb-5">
                            Premium vehicle rentals in Bangalore. Drive your dream car today.
                        </p>
                        <div className="flex gap-3">
                            {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                                <a key={i} href="#" className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                                    <Icon size={16} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-bold mb-4">Quick Links</h4>
                        <ul className="space-y-2 text-gray-400 text-sm">
                            <li><a href="#vehicles" onClick={(e) => scrollTo('vehicles', e)} className="hover:text-white transition-colors">Our Fleet</a></li>
                            <li><a href="#features" onClick={(e) => scrollTo('features', e)} className="hover:text-white transition-colors">Features</a></li>
                            <li><a href="#about" onClick={(e) => scrollTo('about', e)} className="hover:text-white transition-colors">How It Works</a></li>
                            <li>
                                <button onClick={() => navigate(isAuthenticated ? (isAdmin ? '/admin' : '/dashboard') : '/login')} className="hover:text-white transition-colors">
                                    {isAuthenticated ? 'My Dashboard' : 'Login / Sign Up'}
                                </button>
                            </li>
                        </ul>
                    </div>

                    {/* Vehicle Types */}
                    <div>
                        <h4 className="font-bold mb-4">Vehicle Types</h4>
                        <ul className="space-y-2 text-gray-400 text-sm">
                            {['Sedan Cars', 'SUVs', 'Luxury Cars', 'Motorcycles', 'Scooters', 'Electric Vehicles'].map((t, i) => (
                                <li key={i}>
                                    <a href="#vehicles" className="hover:text-white transition-colors">{t}</a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-bold mb-4">Contact Us</h4>
                        <ul className="space-y-3 text-gray-400 text-sm">
                            <li className="flex items-center gap-2">
                                <Mail size={15} />
                                <span>support@rentify.in</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Phone size={15} />
                                <span>+91 98765 43210</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <MapPin size={15} className="mt-0.5 flex-shrink-0" />
                                <span>100 Feet Road, Indiranagar,<br />Bangalore — 560038</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-gray-500 text-sm">
                    <p>© {new Date().getFullYear()} Rentify. All rights reserved.</p>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                        <a href="#" className="hover:text-white transition-colors">Refund Policy</a>
                    </div>
                </div>
            </div>
        </footer>
    )
}

/* ─────────────────── Landing Page ─────────────────── */
const Landing = () => {
    return (
        <div className="min-h-screen bg-white">
            <Hero />
            <BrandStrip />
            <FeaturedVehicles />
            <StatsBanner />
            <HowItWorks />
            <Features />
            <CTA />
            <Footer />
        </div>
    )
}

export default Landing