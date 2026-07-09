import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, 
  Calendar, 
  Phone, 
  Mail, 
  ShieldAlert, 
  ArrowRight, 
  Award, 
  BookOpen, 
  Gift, 
  Activity as ActIcon,
  ChevronRight,
  Info,
  Clock,
  Instagram,
  Facebook,
  Twitter,
  ExternalLink,
  Lock,
  Sprout,
  User,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { SarthakLogo, SarthakIntro } from './components/SarthakLogo';
import { ActivityCard } from './components/ActivityCard';
import { JoinModal, ContactModal } from './components/FormModals';
import { AdminPortal } from './components/AdminPortal';
import { subscribeActivities, seedDatabaseIfEmpty, Activity } from './lib/firebase';

export default function App() {
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }, []);

  const [introCompleted, setIntroCompleted] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [showAllActivities, setShowAllActivities] = useState(false);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [sarthakClickCount, setSarthakClickCount] = useState(0);

  // Secret Admin Portal Trigger
  const handleSarthakClick = () => {
    setSarthakClickCount(prev => {
      const next = prev + 1;
      if (next >= 3) {
        setShowAdmin(true);
        return 0; // reset
      }
      return next;
    });
  };

  // Modal Triggers
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);

  // Initialize and subscribe to activities real-time
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    
    async function initDb() {
      setLoadingActivities(true);
      try {
        await seedDatabaseIfEmpty();
      } catch (err) {
        console.error("Error seeding activities: ", err);
      } finally {
        setLoadingActivities(false);
      }
    }
    
    initDb();

    unsubscribe = subscribeActivities((data) => {
      setActivities(data);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []); // Keeps itself perfectly in sync in real-time

  // Categories list derived from activities
  const categories = ['All', 'Education', 'Food Relief', 'Healthcare', 'Livelihood'];

  // Filtered activities list
  const filteredActivities = activeFilter === 'All'
    ? activities
    : activities.filter(act => act.category === activeFilter);

  // Scroll to helper
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-800 flex flex-col font-sans selection:bg-pink-100 selection:text-rose-900 transition-colors duration-300">
      
      {/* 1. INTRO SPLASH ANIMATION */}
      <AnimatePresence>
        {!introCompleted && (
          <SarthakIntro onComplete={() => setIntroCompleted(true)} />
        )}
      </AnimatePresence>

      {/* Render Main App once Intro finishes */}
      {introCompleted && (
        <AnimatePresence mode="wait">
          
          {/* 2. ADMIN PORTAL VIEW */}
          {showAdmin ? (
            <motion.div
              key="admin"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <AdminPortal onBackToSite={() => setShowAdmin(false)} activities={activities} />
            </motion.div>
          ) : (
            
            // 3. MAIN PUBLIC WEBSITE
            <motion.div
              key="website"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col min-h-screen"
            >
              {/* STICKY GLASSMORPHIC HEADER */}
              <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 py-3.5 px-6 transition-all">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                  
                  {/* Brand Logo & Name */}
                  <div 
                    className="flex items-center gap-3 cursor-pointer select-none" 
                    onClick={() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                      handleSarthakClick();
                    }}
                  >
                    <SarthakLogo className="w-10 h-10 flex items-center justify-center shrink-0 p-0 bg-transparent" />
                    <div>
                      <h1 className="font-serif text-xl font-black tracking-widest text-gray-900 flex items-center gap-1.5">
                        SARTHAK
                        <span className="text-[10px] bg-rose-50 text-rose-600 font-mono font-bold tracking-normal px-2 py-0.5 rounded-full uppercase">NGO</span>
                      </h1>
                      <p className="font-sans text-[9px] uppercase tracking-wider text-gray-400 font-bold">Give a hand, Change a life</p>
                    </div>
                  </div>

                  {/* Nav links */}
                  <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-600">
                    <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-rose-600 cursor-pointer transition-colors">Home</button>
                    <button onClick={() => scrollToSection('goal')} className="hover:text-rose-600 cursor-pointer transition-colors">Our Goal</button>
                    <button onClick={() => scrollToSection('activities')} className="hover:text-rose-600 cursor-pointer transition-colors">Activities</button>
                    <button onClick={() => setIsContactOpen(true)} className="hover:text-rose-600 cursor-pointer transition-colors">Contact Us</button>
                  </nav>

                  {/* Header Actions */}
                  <div className="flex items-center gap-3">
                    <button
                      id="btn-nav-join"
                      onClick={() => setIsJoinOpen(true)}
                      className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-pink-150 hover:shadow-none transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      Join With Us
                    </button>
                  </div>
                </div>
              </header>

              {/* 3.1 HERO SECTION WITH LOGO EXPOSURE */}
              <section className="relative overflow-hidden bg-gradient-to-b from-pink-50/40 via-white to-white py-16 md:py-24 px-6">
                
                {/* Decorative background orbs */}
                <div className="absolute top-10 left-10 w-80 h-80 bg-rose-100 rounded-full blur-3xl opacity-40 -z-10" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-100 rounded-full blur-3xl opacity-30 -z-10" />

                <div className="max-w-4xl mx-auto text-center space-y-8 py-8">
                  
                  {/* Centered Text details */}
                  <div className="space-y-6">
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="inline-flex items-center gap-2 bg-pink-50 border border-pink-100 text-rose-700 px-4 py-1.5 rounded-full text-xs font-semibold"
                    >
                      <Award className="w-3.5 h-3.5 text-rose-600" />
                      <span>Dedicated to Social Empowerment since 2025</span>
                    </motion.div>

                    <motion.h2
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="font-serif text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight"
                    >
                      Give a <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-500">Hand</span>,<br />
                      Change a <span className="text-gray-900">Life</span>.
                    </motion.h2>

                    <motion.p
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="font-sans text-base md:text-lg text-gray-650 leading-relaxed max-w-2xl mx-auto"
                    >
                      SARTHAK is a grassroots non-profit organization striving to construct self-reliant, dignity-filled futures. We support underserved communities with food drives, primary education, healthcare camps, and professional skill certifications.
                    </motion.p>

                    {/* CTAs */}
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="flex flex-wrap items-center justify-center gap-4 pt-4"
                    >
                      <button
                        id="btn-hero-join"
                        onClick={() => setIsJoinOpen(true)}
                        className="px-8 py-4 bg-rose-600 hover:bg-rose-700 text-white font-sans text-sm font-bold rounded-2xl cursor-pointer shadow-lg shadow-pink-150 hover:shadow-none hover:translate-y-0.5 transition-all flex items-center gap-2"
                      >
                        Join Our Mission
                      </button>
                      
                      <button
                        id="btn-hero-contact"
                        onClick={() => setIsContactOpen(true)}
                        className="px-8 py-4 bg-white hover:bg-gray-50 text-gray-800 font-sans text-sm font-bold rounded-2xl cursor-pointer border border-gray-200 hover:border-gray-300 hover:translate-y-0.5 transition-all flex items-center gap-2"
                      >
                        Contact & Support
                        <ArrowRight className="w-4 h-4 text-rose-500" />
                      </button>
                    </motion.div>
                  </div>

                </div>
              </section>

              {/* 3.2 OUR GOAL / PILLARS SECTION */}
              <section id="goal" className="py-20 px-6 bg-gray-50 border-y border-gray-100">
                <div className="max-w-7xl mx-auto space-y-12">
                  
                  {/* Section Title */}
                  <div className="text-center max-w-2xl mx-auto space-y-3">
                    <span className="font-mono text-xs uppercase tracking-widest text-rose-600 font-extrabold">Primary Vision</span>
                    <h3 className="font-serif text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">Our Goal & Central Pillars</h3>
                    <p className="font-sans text-sm text-gray-500 leading-relaxed">
                      We operate across four cohesive domains to address local marginalization comprehensively, making a structural difference.
                    </p>
                  </div>

                  {/* Pillars Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Pillar 1 */}
                    <div className="bg-white p-6.5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center mb-5 border border-pink-100">
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <h4 className="font-sans text-lg font-bold text-gray-900 mb-2">Student Education & Mentorship</h4>
                      <p className="font-sans text-xs text-gray-500 leading-relaxed">
                        Supporting the educational journeys of students from economically weaker backgrounds. We provide academic guidance, quality learning materials, and mentorship to help them build a self-reliant future.
                      </p>
                    </div>

                    {/* Pillar 2 */}
                    <div className="bg-white p-6.5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center mb-5 border border-pink-100">
                        <Gift className="w-6 h-6" />
                      </div>
                      <h4 className="font-sans text-lg font-bold text-gray-900 mb-2">Nutritional Relief</h4>
                      <p className="font-sans text-xs text-gray-500 leading-relaxed">
                        No individual should go to sleep hungry. We serve hot nutritious meals and fresh rations to slums and marginalized communities.
                      </p>
                    </div>

                    {/* Pillar 3 */}
                    <div className="bg-white p-6.5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center mb-5 border border-pink-100">
                        <Sprout className="w-6 h-6" />
                      </div>
                      <h4 className="font-sans text-lg font-bold text-gray-900 mb-2">Tree Plantation Drives</h4>
                      <p className="font-sans text-xs text-gray-500 leading-relaxed">
                        Caring for nature starts with action. We bring students and neighbors together to plant trees in our local areas to keep our community green and healthy. To make it personal, we also encourage every member to plant a tree on their birthday as a meaningful gift to the Earth.
                      </p>
                    </div>

                    {/* Pillar 4 */}
                    <div className="bg-white p-6.5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center mb-5 border border-pink-100">
                        <ActIcon className="w-6 h-6" />
                      </div>
                      <h4 className="font-sans text-lg font-bold text-gray-900 mb-2">Primary Healthcare</h4>
                      <p className="font-sans text-xs text-gray-500 leading-relaxed">
                        Bringing free general screening camps, dental reviews, basic eye testing, and distributed diagnostic medicines to nearby villages.
                      </p>
                    </div>
                  </div>

                </div>
              </section>

              {/* 3.3 ACTIVITIES SECTION WITH FILTERS */}
              <section id="activities" className="py-20 px-6 bg-white">
                <div className="max-w-7xl mx-auto space-y-10">
                  
                  {/* Section Title */}
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-100">
                    <div className="space-y-2">
                      <span className="font-mono text-xs uppercase tracking-widest text-rose-600 font-extrabold">Our Footprint</span>
                      <h3 className="font-serif text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">Active Social Work</h3>
                      <p className="font-sans text-sm text-gray-500 max-w-xl">
                        See how we support communities. Click 'Read More' on any activity to view detail diaries, coordinates, and statistics.
                      </p>
                    </div>
                  </div>

                  {/* Activities Cards Grid */}
                  {loadingActivities ? (
                    <div className="h-64 flex flex-col items-center justify-center text-gray-400">
                      <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                      <p className="text-xs font-mono uppercase tracking-widest">Loading activities...</p>
                    </div>
                  ) : activities.length === 0 ? (
                    <div className="bg-gray-50 p-16 text-center rounded-2xl text-gray-400 border border-gray-100">
                      No activities recorded yet. Registered administrators can add entries dynamically.
                    </div>
                  ) : (
                    <div className="space-y-12">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {(showAllActivities ? activities : activities.slice(0, 4)).map((act) => (
                          <ActivityCard key={act.id} activity={act} />
                        ))}
                      </div>

                      {activities.length > 4 && (
                        <div className="flex justify-center pt-2">
                          <button
                            id="btn-see-more-activities"
                            onClick={() => setShowAllActivities(!showAllActivities)}
                            className="inline-flex items-center gap-2 px-6 py-3.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-sans text-sm font-bold border border-rose-150 rounded-2xl cursor-pointer shadow-sm hover:shadow-md transition-all active:scale-95"
                          >
                            {showAllActivities ? (
                              <>
                                <span>Show Less Activities</span>
                                <ChevronUp className="w-4 h-4" />
                              </>
                            ) : (
                              <>
                                <span>See More Activities</span>
                                <ChevronDown className="w-4 h-4" />
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              </section>

              {/* 3.4 JOIN CTAs SECTION */}
              <section className="py-20 px-6 bg-gradient-to-t from-pink-50/40 via-white to-white border-t border-gray-150">
                <div className="max-w-4xl mx-auto bg-gray-900 rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden shadow-2xl border">
                  
                  {/* Decorative ambient background bird light inside card */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-pink-600 rounded-full blur-3xl opacity-20 -z-0" />
                  
                  <div className="relative z-10 space-y-6">
                    <Award className="w-12 h-12 text-rose-500 mx-auto" />
                    
                    <h3 className="font-serif text-3xl sm:text-4xl font-extrabold tracking-tight">Become a Pillar of Change</h3>
                    <p className="font-sans text-sm text-gray-300 max-w-xl mx-auto leading-relaxed">
                      Your skills, guidance, and passion can directly empower families and children. Submit your credentials, and let us co-create futures together.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-center pt-4">
                      <button
                        id="btn-bottom-join"
                        onClick={() => setIsJoinOpen(true)}
                        className="w-full sm:w-auto px-8 py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-sans text-sm font-bold rounded-xl cursor-pointer shadow-md transition-all flex items-center justify-center gap-2"
                      >
                        Join as a Volunteer
                      </button>

                      <button
                        id="btn-bottom-contact"
                        onClick={() => setIsContactOpen(true)}
                        className="w-full sm:w-auto px-8 py-3.5 bg-gray-850 hover:bg-gray-700 text-white font-sans text-sm font-bold rounded-xl cursor-pointer border border-gray-700 transition-all flex items-center justify-center gap-2"
                      >
                        Inquire & Contact
                        <ArrowRight className="w-4 h-4 text-rose-500" />
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* 3.5 FOOTER */}
              <footer className="bg-gray-950 text-gray-400 px-6 py-12 border-t border-gray-900 font-sans">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
                  
                  {/* Col 1 Brand details */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 bg-rose-500 rounded-full shrink-0" />
                      <h4 className="font-serif text-lg font-black text-white tracking-widest">SARTHAK</h4>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      SARTHAK is a registered Non-Governmental Organization (NGO) delivering targeted humanitarian upliftment projects. Our mission is built around core transparency, trust, and proactive local intervention.
                    </p>
                    <div className="flex items-center gap-3 pt-2">
                      <a href="#" className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center hover:bg-rose-950/45 hover:text-rose-400 transition-colors"><Facebook className="w-4 h-4" /></a>
                      <a href="#" className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center hover:bg-rose-950/45 hover:text-rose-400 transition-colors"><Twitter className="w-4 h-4" /></a>
                      <a href="#" className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center hover:bg-rose-950/45 hover:text-rose-400 transition-colors"><Instagram className="w-4 h-4" /></a>
                    </div>
                  </div>

                  {/* Col 2 Quick Links */}
                  <div className="space-y-4">
                    <h5 className="font-sans text-xs font-extrabold text-white uppercase tracking-widest">Explore</h5>
                    <ul className="space-y-2 text-xs">
                      <li><button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-rose-500 transition-colors">Return to Top</button></li>
                      <li><button onClick={() => scrollToSection('goal')} className="hover:text-rose-500 transition-colors">Our Goal & Mission</button></li>
                      <li><button onClick={() => scrollToSection('activities')} className="hover:text-rose-500 transition-colors">Activities History</button></li>
                      <li><button onClick={() => setIsJoinOpen(true)} className="hover:text-rose-500 transition-colors">Apply as Volunteer</button></li>
                    </ul>
                  </div>

                  {/* Col 3 Contact details */}
                  <div className="space-y-4">
                    <h5 className="font-sans text-xs font-extrabold text-white uppercase tracking-widest">Contact Office</h5>
                    <ul className="space-y-2 text-xs text-gray-500">
                      <li className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 shrink-0 text-rose-500" />
                        <span>Pathsala, Bajali, Assam</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Phone className="w-4 h-4 shrink-0 text-rose-500" />
                        <span>8486404182, 9365017343</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Mail className="w-4 h-4 shrink-0 text-rose-500" />
                        <span>sarthakofficial.org@gmail.com</span>
                      </li>
                    </ul>
                  </div>

                </div>

                <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-gray-900 text-center text-[10px] text-gray-600 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p>© 2026 SARTHAK NGO Foundation. All Rights Reserved. Designed with care.</p>
                  <div className="flex items-center gap-4">
                    <a href="#" className="hover:underline">Privacy Policy</a>
                    <a href="#" className="hover:underline">Terms of Use</a>
                  </div>
                </div>
              </footer>

              {/* FLOATING ACTION MODALS */}
              <JoinModal isOpen={isJoinOpen} onClose={() => setIsJoinOpen(false)} />
              <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />

            </motion.div>
          )}

        </AnimatePresence>
      )}

    </div>
  );
}
