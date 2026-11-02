import { motion } from 'framer-motion';
import {
  ArrowRight,
  ArrowUpRight,
  CalendarCheck2,
  Camera,
  ChefHat,
  Heart,
  Music2,
  Search,
  Sparkles,
  Store,
  WandSparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { UseQueryResult } from '@tanstack/react-query';
import type { ServicePage } from '../../types/service.types';
import { serviceCategories } from '../../types/service.types';
import { categoryLabels } from '../../utils/format';
import { ErrorNotice, LoadingCards } from '../common/States';
import { ServiceCard } from '../service/ServiceCard';
import { ButtonLink } from '../ui/Button';

const categoryIcons = [Heart, Store, ChefHat, Camera, Camera, Music2, WandSparkles];

export function CategorySection() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Find your kind of magic</p>
          <h2 className="section-title mt-3">
            A little something for <span>every occasion.</span>
          </h2>
        </div>
        <Link
          to="/services"
          className="group hidden items-center gap-2 text-sm font-bold text-[#486b55] sm:flex"
        >
          Explore all services{' '}
          <ArrowRight size={16} className="transition group-hover:translate-x-1" />
        </Link>
      </div>
      <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-7">
        {serviceCategories.map((category, index) => {
          const Icon = categoryIcons[index] ?? WandSparkles;
          return (
            <Link
              key={category}
              to={`/services?category=${category}`}
              className="category-tile group rounded-[22px] border border-[#e9ede8] bg-white px-4 py-5 transition duration-300 hover:-translate-y-1 hover:border-[#cad8cb] hover:shadow-lg hover:shadow-[#244531]/5 sm:px-5 sm:py-6"
            >
              <span className="flex size-11 items-center justify-center rounded-[15px] bg-[#edf3ed] text-[#597966] transition group-hover:bg-[#dce9dd]">
                <Icon size={19} />
              </span>
              <span className="mt-4 block text-sm font-bold leading-5 text-[#304639]">
                {categoryLabels[category]}
              </span>
              <span className="mt-1 block text-xs text-slate-400">
                Explore options{' '}
                <ArrowRight
                  size={12}
                  className="ml-1 inline transition group-hover:translate-x-1"
                />
              </span>
            </Link>
          );
        })}
      </div>
      <Link
        to="/services"
        className="mt-5 flex items-center justify-center gap-2 text-sm font-bold text-[#486b55] sm:hidden"
      >
        Explore all services <ArrowRight size={16} />
      </Link>
    </section>
  );
}

export function FeaturedServicesSection({ query }: { query: UseQueryResult<ServicePage, Error> }) {
  return (
    <section className="bg-[#f0f3ed] py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Good finds, all in one place</p>
            <h2 className="section-title mt-3">
              Meet your <span>dream team.</span>
            </h2>
          </div>
          <ButtonLink to="/services" variant="secondary" className="hidden sm:inline-flex">
            Browse services <ArrowUpRight size={16} />
          </ButtonLink>
        </div>
        <div className="mt-10">
          {query.isLoading ? (
            <LoadingCards />
          ) : query.isError ? (
            <ErrorNotice
              message="We couldn’t load services just now."
              retry={() => void query.refetch()}
            />
          ) : query.data?.services.length ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {query.data.services.map((service, index) => (
                <ServiceCard key={service.id} service={service} index={index} />
              ))}
            </div>
          ) : (
            <div className="rounded-[26px] border border-dashed border-[#cfdacf] bg-white/70 px-6 py-12 text-center">
              <p className="font-display text-xl font-bold text-[#304639]">
                Something lovely is on its way.
              </p>
              <p className="mt-2 text-sm text-slate-500">
                There aren’t any services listed yet. Check back soon.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export function HowItWorksSection() {
  const steps = [
    {
      number: '01',
      icon: Search,
      title: 'Find your fit',
      body: 'Explore venues and event pros that suit your vision, dates, and budget.',
    },
    {
      number: '02',
      icon: CalendarCheck2,
      title: 'Pick your details',
      body: 'Choose your dates and see the booking details clearly before you request.',
    },
    {
      number: '03',
      icon: Heart,
      title: 'Make it yours',
      body: 'Send your booking request and get one step closer to the day you imagined.',
    },
  ];
  return (
    <section id="how-it-works" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <p className="eyebrow">Simple as it should be</p>
        <h2 className="section-title mt-3">
          From “what if” to <span>“that was perfect.”</span>
        </h2>
        <p className="mt-4 text-sm leading-6 text-slate-500">
          A few thoughtful steps to bring your plans together.
        </p>
      </div>
      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {steps.map((step) => (
          <motion.div
            key={step.number}
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 18 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.45 }}
            className="rounded-[26px] border border-[#e8ece7] bg-white p-7"
          >
            <div className="flex items-center justify-between">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-[#eaf1eb] text-[#54745f]">
                <step.icon size={20} />
              </span>
              <span className="font-display text-sm font-bold tracking-[.12em] text-[#aab9ac]">
                {step.number}
              </span>
            </div>
            <h3 className="mt-7 font-display text-xl font-bold text-[#253a2d]">{step.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">{step.body}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export function BenefitsSection() {
  const benefits = [
    {
      icon: Search,
      title: 'Everything in one place',
      body: 'Explore event services and compare the details that matter to you.',
    },
    {
      icon: CalendarCheck2,
      title: 'A clearer way to plan',
      body: 'Check availability and understand your booking total up front.',
    },
    {
      icon: Heart,
      title: 'Made for real moments',
      body: 'Less time chasing details. More time looking forward to the day.',
    },
  ];
  return (
    <section
      id="why-eventora"
      className="mx-auto grid max-w-7xl gap-12 px-5 pb-20 sm:px-8 sm:pb-24 lg:grid-cols-[.9fr_1.1fr] lg:items-center"
    >
      <div className="relative min-h-[360px] overflow-hidden rounded-[32px] bg-[#d9e3d7] p-8 sm:min-h-[430px] sm:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_65%_35%,rgba(249,241,220,.8),transparent_35%),linear-gradient(140deg,#dce8dd,#a9bea9)]" />
        <div className="absolute bottom-7 left-7 right-7 rounded-2xl border border-white/70 bg-white/75 p-5 backdrop-blur sm:bottom-9 sm:left-9 sm:right-9">
          <span className="text-[10px] font-bold uppercase tracking-[.18em] text-[#789180]">
            A calmer kind of planning
          </span>
          <p className="mt-2 font-display text-2xl font-bold leading-tight text-[#274333] sm:text-3xl">
            The day is yours.
            <br />
            The details feel easy.
          </p>
        </div>
        <div className="absolute right-8 top-8 flex size-14 items-center justify-center rounded-full bg-white/70 text-[#54745f] shadow-lg backdrop-blur">
          <Sparkles size={22} />
        </div>
      </div>
      <div>
        <p className="eyebrow">A little more thoughtful</p>
        <h2 className="section-title mt-3">
          Planning should feel like <span>part of the joy.</span>
        </h2>
        <p className="mt-5 max-w-xl text-sm leading-7 text-slate-500">
          Your celebration is personal. Finding the right venue and people should be, too. Eventora
          gives you one clear place to explore, compare, and bring the pieces together.
        </p>
        <div className="mt-8 space-y-5">
          {benefits.map((benefit) => (
            <div key={benefit.title} className="flex gap-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#eaf1eb] text-[#54745f]">
                <benefit.icon size={18} />
              </span>
              <div>
                <h3 className="text-sm font-bold text-[#304639]">{benefit.title}</h3>
                <p className="mt-1 text-sm leading-5 text-slate-500">{benefit.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LandingCallToAction() {
  return (
    <section className="px-5 pb-20 sm:px-8 sm:pb-24">
      <div className="cta-panel mx-auto flex max-w-7xl flex-col items-start justify-between gap-7 overflow-hidden rounded-[32px] px-7 py-10 text-white sm:flex-row sm:items-center sm:px-12 sm:py-12">
        <div className="relative z-10">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-white/60">
            Your next chapter starts here
          </p>
          <h2 className="mt-3 max-w-xl font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            Let’s make a little <span className="italic text-[#c8dec9]">magic.</span>
          </h2>
          <p className="mt-3 max-w-lg text-sm leading-6 text-white/70">
            Explore the people and places that will make your gathering yours.
          </p>
        </div>
        <ButtonLink
          to="/services"
          variant="secondary"
          className="relative z-10 shrink-0 bg-white text-[#173d33] hover:bg-[#edf4ed]"
        >
          Start exploring <ArrowRight size={16} />
        </ButtonLink>
      </div>
    </section>
  );
}
