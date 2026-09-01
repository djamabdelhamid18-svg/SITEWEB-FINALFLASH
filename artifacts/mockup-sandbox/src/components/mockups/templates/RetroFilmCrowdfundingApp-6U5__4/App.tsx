import { useState, useEffect } from 'react';
import {
  Film, Star, Heart, Users, Clock, MapPin, CheckCircle2, Circle,
  ArrowUpRight, Clapperboard, Camera, Mic2, Truck, Popcorn, Ticket
} from 'lucide-react';
import { motion } from 'framer-motion';
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip, Cell } from 'recharts';

const HEADLINE = "Movies made by people who actually show up.";

const pledgeData = [
  { d: 'M', v: 2140 }, { d: 'T', v: 3320 }, { d: 'W', v: 1890 }, { d: 'T', v: 4475 },
  { d: 'F', v: 5230 }, { d: 'S', v: 7910 }, { d: 'S', v: 6480 }, { d: 'M', v: 3105 },
  { d: 'T', v: 4870 }, { d: 'W', v: 5640 }, { d: 'T', v: 8220 }, { d: 'F', v: 9105 },
  { d: 'S', v: 11430 }, { d: 'S', v: 9870 },
];

const tiers = [
  { name: 'The Usher', amt: 15, perk: 'Digital copy + name in the thank-you crawl', backers: 612, left: null },
  { name: 'The Regular', amt: 45, perk: 'Signed poster, BTS photo zine, early stream', backers: 884, left: null },
  { name: 'The Neighbor', amt: 120, perk: 'Premiere ticket + diner breakfast with the crew', backers: 341, left: 59 },
  { name: 'The Producer Next Door', amt: 500, perk: 'Associate Producer credit, set visit, wrap party', backers: 47, left: 3 },
];

const feed = [
  { name: 'Marisol G.', city: 'Tucson, AZ', amt: 45, ago: '2m' },
  { name: 'Dale & Rhonda P.', city: 'Akron, OH', amt: 120, ago: '11m' },
  { name: 'Kev the mailman', city: 'Boise, ID', amt: 15, ago: '24m' },
  { name: 'Priya N.', city: 'Fresno, CA', amt: 500, ago: '38m' },
  { name: 'Tom (3rd film backed)', city: 'Duluth, MN', amt: 45, ago: '52m' },
];

const milestones = [
  { label: 'Script locked — draft 9', done: true },
  { label: 'Cast attached (all 6 of them)', done: true },
  { label: 'Locations: 2 diners, 1 motel, 400 mi of road', done: true },
  { label: 'Camera package booked — Oct 14', done: false },
  { label: '21-day shoot, New Mexico', done: false },
  { label: 'Festival submissions, Spring 2025', done: false },
];

const stretch = [
  { goal: '$150K', label: 'The film gets made. Period.', pct: 100 },
  { goal: '$165K', label: 'Original score by a real string quartet', pct: 84 },
  { goal: '$180K', label: '35mm prints for 10 hometown screenings', pct: 71 },
  { goal: '$200K', label: 'Everyone on crew gets a raise', pct: 64 },
];

const otherFilms = [
  { title: 'Night Shift at the Lucky Penny', status: 'DELIVERED 2023', img: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=260&fit=crop', note: '1,204 backers · streaming now' },
  { title: 'The County Fair Tapes', status: 'DELIVERED 2022', img: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&h=260&fit=crop', note: '893 backers · 14 festivals' },
];

export default function App() {
  const [typed, setTyped] = useState('');
  const [selectedTier, setSelectedTier] = useState(1);

  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      i++;
      setTyped(HEADLINE.slice(0, i));
      if (i >= HEADLINE.length) clearInterval(t);
    }, 42);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen bg-[#EFE3CF] text-[#2C231C] relative overflow-hidden" style={{ fontFamily: "'Archivo', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,900&family=Archivo:wght@400;500;600;700&family=Chivo+Mono:wght@400;500;700&display=swap" rel="stylesheet" />
      <style dangerouslySetInnerHTML={{ __html: `
        .grain::after {
          content: ''; position: fixed; inset: 0; pointer-events: none; z-index: 50; opacity: 0.5;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E");
        }
        .display { font-family: 'Fraunces', serif; }
        .mono { font-family: 'Chivo Mono', monospace; }
        @keyframes blink { 0%,49% {opacity:1} 50%,100% {opacity:0} }
        .cursor { animation: blink 0.9s step-end infinite; }
        @keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }
        .marquee-track { animation: marquee 28s linear infinite; }
        .hard-shadow { box-shadow: 4px 4px 0 #2C231C; }
        .hard-shadow-sm { box-shadow: 3px 3px 0 #2C231C; }
        .tile { border: 2px solid #2C231C; }
        .stripes { background: repeating-linear-gradient(135deg, #C75B39 0 14px, #D9A441 14px 28px, #8E9C77 28px 42px, #EFE3CF 42px 56px); }
        ::selection { background: #C75B39; color: #F4ECDD; }
      `}} />
      <div className="grain" />

      <div className="max-w-[1440px] mx-auto px-4 py-4 relative z-10">

        {/* APP STORE HEADER STRIP */}
        <div className="tile hard-shadow bg-[#F4ECDD] flex items-center gap-4 px-4 py-3 mb-3">
          <div className="w-14 h-14 tile bg-[#C75B39] flex items-center justify-center shrink-0" style={{ borderRadius: '14px' }}>
            <Clapperboard className="text-[#F4ECDD]" size={28} strokeWidth={2.2} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-3 flex-wrap">
              <h1 className="display font-black text-xl leading-none">BACKLOT</h1>
              <span className="mono text-[11px] uppercase tracking-widest text-[#7C5A3A]">by Dirt Road Pictures · Crowdfunding for honest movies</span>
            </div>
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <span className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => <Star key={i} size={12} className={i < 5 ? 'fill-[#D9A441] text-[#2C231C]' : 'text-[#2C231C]'} strokeWidth={2} />)}
              </span>
              <span className="mono text-[11px]">4.8 · 12,440 ratings</span>
              <span className="mono text-[11px] bg-[#8E9C77] text-[#F4ECDD] px-2 py-0.5">#3 ENTERTAINMENT</span>
              <span className="mono text-[11px] bg-[#2C231C] text-[#F4ECDD] px-2 py-0.5">FREE · NO ADS · NO ALGORITHM</span>
            </div>
          </div>
          <button className="tile hard-shadow-sm bg-[#D9A441] hover:bg-[#C75B39] hover:text-[#F4ECDD] transition-colors mono font-bold text-sm px-6 py-2 uppercase tracking-wider">Get</button>
        </div>

        {/* HERO TYPED HEADLINE + STRIPE */}
        <div className="grid grid-cols-12 gap-3 mb-3">
          <div className="col-span-12 lg:col-span-9 tile hard-shadow bg-[#C75B39] px-6 py-6 flex flex-col justify-center">
            <p className="mono text-[11px] uppercase tracking-[0.3em] text-[#F4D9C8] mb-3">★ Now funding · Campaign No. 07 ★</p>
            <h2 className="display font-black text-[#F4ECDD] leading-[1.02] text-4xl md:text-5xl xl:text-[56px] min-h-[2.1em]">
              {typed}<span className="cursor inline-block w-[0.5ch] -mb-1 border-b-[6px] border-[#D9A441]">&nbsp;</span>
            </h2>
            <p className="mt-4 text-[#F4D9C8] text-sm max-w-2xl leading-relaxed">
              No studio. No streamer money. Just 2,418 regular folks chipping in for a road movie about a father, a daughter, and a pickup that barely runs. Every dollar lands on screen — we publish the budget line by line.
            </p>
          </div>
          <div className="hidden lg:flex col-span-3 flex-col gap-3">
            <div className="tile hard-shadow stripes flex-1 min-h-[60px]" />
            <div className="tile hard-shadow bg-[#2C231C] text-[#F4ECDD] px-4 py-4 flex flex-col justify-center">
              <span className="mono text-[10px] uppercase tracking-widest text-[#D9A441]">App Store screenshot 2 of 6</span>
              <span className="display font-semibold text-2xl mt-1">Back the next one.</span>
              <span className="mono text-[11px] mt-1.5 text-[#B9A98F]">Shot on location · Edited at the kitchen table</span>
            </div>
          </div>
        </div>

        {/* MAIN DENSE GRID */}
        <div className="grid grid-cols-12 gap-3">

          {/* FEATURED CAMPAIGN */}
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="col-span-12 md:col-span-6 lg:col-span-5 tile hard-shadow bg-[#F4ECDD] flex flex-col">
            <div className="relative">
              <img src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=900&h=420&fit=crop" alt="Dust on the Dashboard" className="w-full h-44 object-cover border-b-2 border-[#2C231C]" style={{ filter: 'sepia(0.35) saturate(1.1) contrast(1.05)' }} />
              <span className="absolute top-2 left-2 mono text-[10px] uppercase tracking-widest bg-[#D9A441] tile px-2 py-1">Feature film · Drama · 96 min</span>
              <span className="absolute bottom-2 right-2 mono text-[10px] bg-[#2C231C] text-[#F4ECDD] px-2 py-1">DIR. CARLA YBARRA</span>
            </div>
            <div className="px-4 py-3 flex-1 flex flex-col">
              <h3 className="display font-black text-2xl leading-tight">Dust on the Dashboard</h3>
              <p className="text-[13px] mt-1 text-[#5A4A3A] leading-snug">A laid-off machinist drives his estranged daughter 1,400 miles to a wedding neither of them wants to attend.</p>
              <div className="mt-3">
                <div className="flex justify-between mono text-[11px] mb-1">
                  <span className="font-bold text-[#C75B39]">85% FUNDED</span>
                  <span>$150,000 GOAL</span>
                </div>
                <div className="h-5 tile bg-[#E3D4BA] overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: '85%' }} transition={{ delay: 0.5, duration: 1.1, ease: 'easeOut' }} className="h-full bg-[#C75B39]" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent 0 8px, rgba(0,0,0,0.12) 8px 16px)' }} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3">
                {[
                  { icon: Heart, big: '$127,430', small: 'pledged' },
                  { icon: Users, big: '2,418', small: 'backers' },
                  { icon: Clock, big: '11 days', small: 'to go' },
                ].map((s, i) => (
                  <div key={i} className="tile bg-[#EFE3CF] px-2 py-2">
                    <s.icon size={14} className="text-[#C75B39] mb-1" />
                    <div className="mono font-bold text-base leading-none">{s.big}</div>
                    <div className="mono text-[10px] uppercase tracking-wider text-[#7C5A3A] mt-1">{s.small}</div>
                  </div>
                ))}
              </div>
              <button className="mt-3 tile hard-shadow-sm bg-[#8E9C77] hover:bg-[#2C231C] text-[#F4ECDD] transition-colors mono font-bold text-sm py-2.5 uppercase tracking-widest flex items-center justify-center gap-2">
                Back this film <ArrowUpRight size={16} />
              </button>
            </div>
          </motion.div>

          {/* PLEDGE CHART + STATS */}
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="col-span-12 md:col-span-6 lg:col-span-3 flex flex-col gap-3">
            <div className="tile hard-shadow bg-[#F4ECDD] px-3 py-3 flex-1">
              <div className="flex items-baseline justify-between">
                <span className="mono text-[10px] uppercase tracking-widest text-[#7C5A3A]">Daily pledges · 14 days</span>
                <span className="mono text-[11px] font-bold text-[#8E9C77]">▲ 31%</span>
              </div>
              <div className="display font-black text-2xl mt-0.5">$11,430 <span className="text-sm font-semibold text-[#7C5A3A]">best day yet</span></div>
              <div className="h-28 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pledgeData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                    <XAxis dataKey="d" tick={{ fontSize: 9, fontFamily: 'Chivo Mono', fill: '#7C5A3A' }} axisLine={{ stroke: '#2C231C', strokeWidth: 2 }} tickLine={false} />
                    <Tooltip cursor={{ fill: 'rgba(44,35,28,0.06)' }} contentStyle={{ background: '#2C231C', border: 'none', fontFamily: 'Chivo Mono', fontSize: 11, color: '#F4ECDD' }} formatter={(v) => [`$${v.toLocaleString()}`, 'pledged']} labelFormatter={() => ''} />
                    <Bar dataKey="v" radius={[2, 2, 0, 0]}>
                      {pledgeData.map((e, i) => <Cell key={i} fill={i === 12 ? '#C75B39' : '#8E9C77'} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="tile hard-shadow bg-[#D9A441] px-3 py-3">
                <div className="mono text-[10px] uppercase tracking-widest">Avg pledge</div>
                <div className="display font-black text-2xl leading-none mt-1">$52.70</div>
                <div className="mono text-[10px] mt-1.5">about a tank of gas</div>
              </div>
              <div className="tile hard-shadow bg-[#8E9C77] text-[#F4ECDD] px-3 py-3">
                <div className="mono text-[10px] uppercase tracking-widest">Repeat backers</div>
                <div className="display font-black text-2xl leading-none mt-1">61%</div>
                <div className="mono text-[10px] mt-1.5">they keep coming back</div>
              </div>
            </div>
          </motion.div>

          {/* REWARD TIERS */}
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="col-span-12 lg:col-span-4 tile hard-shadow bg-[#F4ECDD] px-3 py-3 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="mono text-[10px] uppercase tracking-widest text-[#7C5A3A] flex items-center gap-1.5"><Ticket size={12} /> Reward tiers — pick your seat</span>
              <span className="mono text-[10px] bg-[#2C231C] text-[#F4ECDD] px-1.5 py-0.5">TAP TO SELECT</span>
            </div>
            <div className="flex flex-col gap-2 flex-1">
              {tiers.map((t, i) => (
                <button key={i} onClick={() => setSelectedTier(i)}
                  className={`tile text-left px-3 py-2.5 transition-all ${selectedTier === i ? 'bg-[#C75B39] text-[#F4ECDD] hard-shadow-sm -translate-y-0.5' : 'bg-[#EFE3CF] hover:bg-[#E8DAC2]'}`}>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="display font-semibold text-base">{t.name}</span>
                    <span className="mono font-bold text-lg">${t.amt}</span>
                  </div>
                  <p className={`text-[12px] leading-snug mt-0.5 ${selectedTier === i ? 'text-[#F4D9C8]' : 'text-[#5A4A3A]'}`}>{t.perk}</p>
                  <div className="flex items-center gap-2 mt-1.5 mono text-[10px] uppercase tracking-wider">
                    <span className={selectedTier === i ? 'text-[#F4D9C8]' : 'text-[#7C5A3A]'}>{t.backers} backers</span>
                    {t.left && <span className={`px-1.5 py-0.5 ${selectedTier === i ? 'bg-[#F4ECDD] text-[#C75B39]' : 'bg-[#D9A441]'}`}>only {t.left} left</span>}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>

          {/* LIVE BACKER FEED */}
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="col-span-12 sm:col-span-6 lg:col-span-3 tile hard-shadow bg-[#2C231C] text-[#F4ECDD] px-3 py-3">
            <div className="flex items-center justify-between mb-2">
              <span className="mono text-[10px] uppercase tracking-widest text-[#D9A441]">Live backer feed</span>
              <span className="w-2 h-2 rounded-full bg-[#C75B39] animate-pulse" />
            </div>
            <div className="flex flex-col">
              {feed.map((f, i) => (
                <div key={i} className={`py-2 flex items-start justify-between gap-2 ${i !== feed.length - 1 ? 'border-b border-[#4A3D32]' : ''}`}>
                  <div>
                    <div className="text-[13px] font-semibold leading-tight">{f.name}</div>
                    <div className="mono text-[10px] text-[#B9A98F] flex items-center gap-1 mt-0.5"><MapPin size={9} /> {f.city} · {f.ago} ago</div>
                  </div>
                  <span className="mono font-bold text-sm text-[#D9A441] shrink-0">${f.amt}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* PRODUCTION MILESTONES */}
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} className="col-span-12 sm:col-span-6 lg:col-span-3 tile hard-shadow bg-[#F4ECDD] px-3 py-3">
            <span className="mono text-[10px] uppercase tracking-widest text-[#7C5A3A] flex items-center gap-1.5"><Camera size={12} /> Where the money goes</span>
            <div className="flex flex-col mt-2">
              {milestones.map((m, i) => (
                <div key={i} className={`flex items-center gap-2 py-1.5 ${i !== milestones.length - 1 ? 'border-b border-dashed border-[#C7B59A]' : ''}`}>
                  {m.done ? <CheckCircle2 size={15} className="text-[#8E9C77] shrink-0" /> : <Circle size={15} className="text-[#C7B59A] shrink-0" />}
                  <span className={`text-[12.5px] leading-tight ${m.done ? '' : 'text-[#7C5A3A]'}`}>{m.label}</span>
                </div>
              ))}
            </div>
            <div className="mt-2.5 tile bg-[#D9A441] mono text-[10px] uppercase tracking-wider px-2 py-1.5 text-center">Full budget PDF posted in-app — every receipt</div>
          </motion.div>

          {/* STRETCH GOALS */}
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="col-span-12 sm:col-span-6 lg:col-span-3 tile hard-shadow bg-[#8E9C77] text-[#2C231C] px-3 py-3">
            <span className="mono text-[10px] uppercase tracking-widest text-[#F4ECDD] flex items-center gap-1.5"><Truck size={12} /> Stretch goals</span>
            <div className="flex flex-col gap-2.5 mt-2">
              {stretch.map((s, i) => (
                <div key={i}>
                  <div className="flex justify-between items-baseline">
                    <span className="mono font-bold text-[13px]">{s.goal}</span>
                    <span className="mono text-[10px]">{s.pct}%</span>
                  </div>
                  <p className="text-[12px] leading-tight mb-1">{s.label}</p>
                  <div className="h-2.5 bg-[#F4ECDD] border border-[#2C231C]">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${s.pct}%` }} transition={{ delay: 0.8 + i * 0.15, duration: 0.8 }} className="h-full bg-[#C75B39]" />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* TRACK RECORD */}
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }} className="col-span-12 sm:col-span-6 lg:col-span-3 grid grid-cols-2 gap-3">
            {[
              { icon: Film, big: '6', small: 'films delivered, all of them finished', bg: 'bg-[#F4ECDD]' },
              { icon: Popcorn, big: '142', small: 'community screenings hosted', bg: 'bg-[#D9A441]' },
              { icon: Mic2, big: '100%', small: 'crew paid before the director', bg: 'bg-[#C75B39] text-[#F4ECDD]' },
              { icon: Users, big: '9,212', small: 'backers across 48 states', bg: 'bg-[#F4ECDD]' },
            ].map((s, i) => (
              <div key={i} className={`tile hard-shadow ${s.bg} px-3 py-3 flex flex-col justify-between`}>
                <s.icon size={16} className={s.bg.includes('C75B39') ? 'text-[#F4D9C8]' : 'text-[#C75B39]'} />
                <div>
                  <div className="display font-black text-2xl leading-none">{s.big}</div>
                  <div className="mono text-[9.5px] uppercase tracking-wide leading-tight mt-1 opacity-80">{s.small}</div>
                </div>
              </div>
            ))}
          </motion.div>

          {/* PAST FILMS */}
          {otherFilms.map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 + i * 0.05 }} className="col-span-12 sm:col-span-6 lg:col-span-4 tile hard-shadow bg-[#F4ECDD] flex">
              <img src={f.img} alt={f.title} className="w-32 object-cover border-r-2 border-[#2C231C]" style={{ filter: 'sepia(0.4) saturate(1.05)' }} />
              <div className="px-3 py-3 flex flex-col justify-center">
                <span className="mono text-[9px] uppercase tracking-widest bg-[#8E9C77] text-[#F4ECDD] px-1.5 py-0.5 self-start">{f.status}</span>
                <h4 className="display font-semibold text-lg leading-tight mt-1.5">{f.title}</h4>
                <span className="mono text-[10.5px] text-[#7C5A3A] mt-1">{f.note}</span>
              </div>
            </motion.div>
          ))}

          {/* COMMUNITY QUOTE */}
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="col-span-12 lg:col-span-4 tile hard-shadow bg-[#C75B39] text-[#F4ECDD] px-4 py-3 flex flex-col justify-center">
            <p className="display text-xl leading-snug">"I drive a forklift. Now my name's in the credits of a movie my kids watched twice. That's the whole pitch."</p>
            <div className="flex items-center justify-between mt-2.5">
              <span className="mono text-[10.5px] uppercase tracking-widest text-[#F4D9C8]">— Denny W., backer since 2021</span>
              <span className="flex gap-0.5">{[...Array(5)].map((_, i) => <Star key={i} size={11} className="fill-[#D9A441] text-[#D9A441]" />)}</span>
            </div>
          </motion.div>
        </div>

        {/* MARQUEE FOOTER */}
        <div className="tile hard-shadow bg-[#2C231C] mt-3 overflow-hidden py-2.5">
          <div className="marquee-track whitespace-nowrap flex gap-0 mono text-[12px] uppercase tracking-[0.25em] text-[#F4ECDD]">
            {[...Array(2)].map((_, k) => (
              <span key={k} className="shrink-0">
                {['Every dollar on screen', 'No studio notes', 'Backers see dailies first', 'Crew fed three meals a day', 'Your name in the crawl', 'Real places, real faces'].map((t, i) => (
                  <span key={i} className="mx-6">{t} <span className="text-[#D9A441] mx-2">✶</span></span>
                ))}
              </span>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}