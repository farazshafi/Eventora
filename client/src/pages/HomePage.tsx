import { motion } from 'framer-motion';
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Heart,
  MapPin,
  Search,
  Sparkles,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useFeaturedServices } from '../hooks/useServices';
import { categoryLabels } from '../utils/format';
import type { ServiceCategory } from '../types/service.types';
import {
  BenefitsSection,
  CategorySection,
  FeaturedServicesSection,
  HowItWorksSection,
  LandingCallToAction,
} from '../components/landing/LandingSections';

export default function HomePage() {
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const navigate = useNavigate();
  const featured = useFeaturedServices();
  function submit(event: React.FormEvent) {
    event.preventDefault();
    const query = new URLSearchParams();
    if (search.trim()) query.set('search', search.trim());
    if (location.trim()) query.set('location', location.trim());
    navigate(`/services?${query}`);
  }
  return (
    <main>
      <section className="hero-shell relative min-h-[calc(100svh-76px)] overflow-hidden">
        <div className="hero-grain absolute inset-0" />
        <div className="pointer-events-none absolute -right-32 top-12 size-[30rem] rounded-full bg-[#d9e5d7]/55 blur-[90px]" />
        <div className="pointer-events-none absolute -left-24 bottom-0 size-80 rounded-full bg-[#f3e9d4]/55 blur-[85px]" />
        <div className="relative mx-auto grid min-h-[calc(100svh-126px)] max-w-7xl items-center gap-8 px-5 py-6 sm:px-8 sm:py-8 lg:grid-cols-[1.02fr_.98fr] lg:gap-8 lg:py-10">
          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#d8e4da] bg-white/75 px-3.5 py-2 text-xs font-semibold text-[#40634f]"
            >
              <Sparkles size={14} />
              Make every moment special
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.08 }}
              className="max-w-[650px] font-display text-[clamp(3.3rem,7.1vw,6.4rem)] font-extrabold leading-[.98] tracking-[-.075em] text-[#1d352a]"
            >
              Plan Your Perfect <span className="relative inline-block text-[#718c76]">Event.</span>{' '}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.2 }}
              className="mt-6 max-w-lg text-base leading-7 text-[#6c7970] sm:text-lg sm:leading-8"
            >
              Discover and book the best wedding venues, photographers, decorators, caterers, and event professionals. Everything you need to create unforgettable celebrations, all in one place.
            </motion.p>
            <motion.form
              onSubmit={submit}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.3 }}
              className="mt-9 flex max-w-[610px] flex-col gap-2 rounded-[24px] border border-white bg-white p-2.5 shadow-[0_20px_65px_-35px_rgba(30,62,43,.28)] sm:flex-row sm:items-center sm:rounded-full sm:pl-5"
            >
              <label className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2 sm:px-0">
                <Search size={18} className="shrink-0 text-[#789281]" />
                <span className="min-w-0 flex-1">
                  <span className="sr-only">What are you looking for?</span>
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="What are you dreaming up?"
                    className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-slate-400"
                  />
                </span>
              </label>
              <span className="hidden h-8 w-px bg-slate-200 sm:block" />
              <label className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2 sm:px-0">
                <MapPin size={17} className="shrink-0 text-[#789281]" />
                <span className="min-w-0 flex-1">
                  <span className="sr-only">Location</span>
                  <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City or location"
                    className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-slate-400"
                  />
                </span>
              </label>
              <Button type="submit" className="h-12 shrink-0 rounded-full px-6">
                Find your people <ArrowRight size={16} />
              </Button>
            </motion.form>
            <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="mr-1 font-semibold text-slate-400">Popular:</span>
              {(['MARRIAGE_VENUE', 'PHOTOGRAPHER', 'CATERER'] as ServiceCategory[]).map((cat) => (
                <Link
                  key={cat}
                  className="rounded-full border border-[#e4e9e3] bg-white/60 px-3 py-1.5 transition hover:border-[#9fb5a2] hover:text-[#355d48]"
                  to={`/services?category=${cat}`}
                >
                  {categoryLabels[cat]}
                </Link>
              ))}
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.97, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.75, delay: 0.15 }}
            className="relative mx-auto w-full max-w-[590px] lg:ml-auto"
          >
            <div
              className="hero-photo relative aspect-[.92] overflow-hidden rounded-[38px] bg-[#c5d2c6] sm:aspect-[1.04]"
              role="img"
              aria-label="Abstract illustration in soft garden tones"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#dfe8dd] via-[#c9d4c9] to-[#aebfac]" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_75%_22%,rgba(255,244,212,.8),transparent_40%),radial-gradient(ellipse_at_15%_85%,rgba(89,117,87,.45),transparent_55%)]" />
              <div className="hero-abstract absolute inset-0 opacity-70" />
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#172c21]/45 to-transparent" />
              <div className="absolute bottom-7 left-7 right-7 flex items-end justify-between text-white sm:bottom-9 sm:left-9 sm:right-9">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-[.18em] text-white/75">
                    Made for your moment
                  </span>
                  <p className="mt-2 font-display text-2xl font-bold sm:text-3xl">
                    Gather beautifully.
                  </p>
                </div>
                <span className="flex size-12 items-center justify-center rounded-full border border-white/40 bg-white/15 backdrop-blur">
                  <ArrowUpRight size={19} />
                </span>
              </div>
            </div>
            <div className="float-card absolute -left-5 top-[16%] flex items-center gap-3 rounded-2xl border border-white/80 bg-white/90 p-3.5 shadow-xl shadow-slate-800/10 backdrop-blur sm:-left-10">
              <span className="flex size-10 items-center justify-center rounded-xl bg-[#e8f0e9] text-[#557765]">
                <CalendarDays size={19} />
              </span>
              <span>
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  One place
                </span>
                <span className="mt-0.5 block text-sm font-bold text-[#274536]">
                  Handpicked Services for You
                </span>
              </span>
            </div>
            <div className="float-card absolute -right-2 top-[55%] rounded-2xl border border-white/80 bg-white/90 p-3.5 shadow-xl shadow-slate-800/10 backdrop-blur sm:-right-7">
              <div className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-full bg-[#f2e9d8] text-[#947443]">
                  <Heart size={15} fill="currentColor" />
                </span>
                <span className="text-xs font-bold text-[#274536]">Your day, your way</span>
              </div>
              <div className="mt-2.5 h-1.5 w-36 overflow-hidden rounded-full bg-[#e8eee8]">
                <div className="h-full w-3/4 rounded-full bg-[#849f87]" />
              </div>
            </div>
          </motion.div>
        </div>
        <div className="relative mx-auto max-w-7xl px-5 pb-4 sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#dfe6de] pt-5 text-xs font-medium text-[#819087]">
            <span>Thoughtfully gathered in one place</span>
            <span className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-[#87a38d]" />
              An easier way to plan together
            </span>
          </div>
        </div>
      </section>

      <CategorySection />

      <FeaturedServicesSection query={featured} />

      <HowItWorksSection />

      <BenefitsSection />

      <LandingCallToAction />
    </main>
  );
}
