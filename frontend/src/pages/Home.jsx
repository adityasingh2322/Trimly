import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Star, Shield, Clock, ArrowRight, CheckCircle2, Scissors } from 'lucide-react';
import { motion } from 'framer-motion';

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
};

const Home = () => {
  return (
    <div className="flex flex-col gap-24 py-12 overflow-hidden">
      {/* 1. Hero Section */}
      <section className="relative flex flex-col md:flex-row items-center justify-between mt-10 mb-10 min-h-[70vh]">
        <motion.div 
          className="md:w-1/2 flex flex-col items-start text-left z-10"
          initial="hidden" animate="visible" variants={staggerContainer}
        >
          <motion.div variants={fadeInUp} className="inline-block py-1.5 px-4 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-6 tracking-wide uppercase shadow-[0_0_10px_rgba(207,181,59,0.2)]">
            Elevate Your Style
          </motion.div>
          <motion.h1 variants={fadeInUp} className="text-6xl md:text-8xl font-black tracking-tighter mb-6 leading-[1.1]">
            Master YOUR <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-yellow-200 to-yellow-600 drop-shadow-lg">Legacy.</span>
          </motion.h1>
          <motion.p variants={fadeInUp} className="text-lg md:text-xl text-gray-400 mb-10 max-w-lg leading-relaxed">
            Experience world-class grooming tailored to the modern gentleman. Precision cuts, hot towel shaves, and an atmosphere of pure luxury.
          </motion.p>
          <motion.div variants={fadeInUp} className="flex flex-wrap gap-4">
            <Link to="/booking" className="btn-primary flex items-center gap-2 text-lg px-8 py-4 rounded-xl">
              <Calendar size={20} />
              Book Now
            </Link>
            <Link to="/register" className="btn-secondary flex items-center gap-2 text-lg px-8 py-4 rounded-xl hover:bg-white/10">
              Join the Club
              <ArrowRight size={20} />
            </Link>
          </motion.div>
        </motion.div>

        <motion.div 
          className="md:w-1/2 relative mt-16 md:mt-0"
          initial={{ opacity: 0, scale: 0.9, x: 50 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <div className="relative w-full aspect-square md:aspect-[4/5] rounded-[2rem] overflow-hidden glass border-white/10 border-2 shadow-[0_0_40px_rgba(207,181,59,0.15)]">
            <img 
              src="https://images.unsplash.com/photo-1593702275687-f8b402bf1fb5?q=80&w=1000&auto=format&fit=crop" 
              alt="Premium Barber Service" 
              className="w-full h-full object-cover opacity-80 mix-blend-lighten hover:opacity-100 transition-opacity duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"></div>
          </div>
          
          {/* Floating Badge */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="absolute -bottom-10 -left-10 glass-card flex items-center gap-4 animate-bounce-slow"
          >
            <div className="bg-primary/20 p-3 rounded-full text-primary">
              <Star fill="currentColor" size={24} />
            </div>
            <div>
              <p className="text-white font-bold text-lg">4.9/5</p>
              <p className="text-sm text-gray-400">from 2,000+ reviews</p>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* 2. Stats / Logos */}
      <motion.section 
        className="py-10 border-y border-white/5 flex flex-wrap justify-between items-center gap-8 px-8 glass rounded-3xl relative z-10"
        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
      >
        {[
          { text: "10k+ Cuts" },
          { text: "Award Winning" },
          { text: "Premium Products" },
          { text: "Expert Stylists" },
        ].map((item, i) => (
          <motion.div key={i} variants={fadeInUp} className="flex items-center gap-3 text-gray-300 font-semibold text-xl uppercase tracking-widest">
            <CheckCircle2 className="text-primary hidden sm:block" size={24} />
            {item.text}
          </motion.div>
        ))}
      </motion.section>

      {/* 3. Services Section */}
      <section className="py-12 relative z-10">
        <motion.div className="text-center mb-16" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Our Premium Services</h2>
          <p className="text-gray-400 text-lg">Tailored perfection for every gentleman.</p>
        </motion.div>
        
        <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-8" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}>
          {[
            { tag: "The Classic", title: "Executive Haircut", desc: "Precision cut, wash, and styling with premium products.", price: "$45", icon: Scissors },
            { tag: "The Ritual", title: "Hot Towel Shave", desc: "Traditional straight razor shave with essential oils and hot towels.", price: "$35", icon: Shield },
            { tag: "The Ultimate", title: "Full Grooming", desc: "Haircut, beard trim, hot towel shave, and mini facial.", price: "$90", icon: Star },
          ].map((service, i) => (
            <motion.div key={i} variants={fadeInUp} className="glass-card group hover:-translate-y-2 transition-transform duration-500 cursor-pointer relative overflow-hidden">
               <div className="absolute top-0 left-0 w-2 h-full bg-primary transform origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500"></div>
               <div className="mb-6 inline-block p-4 bg-primary/10 rounded-2xl text-primary group-hover:bg-primary group-hover:text-black transition-colors duration-500">
                  <service.icon size={32} />
               </div>
               <h4 className="text-primary text-sm font-bold uppercase tracking-wider mb-2">{service.tag}</h4>
               <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-primary transition-colors">{service.title}</h3>
               <p className="text-gray-400 mb-6 leading-relaxed">{service.desc}</p>
               <div className="flex justify-between items-center border-t border-white/10 pt-4 mt-auto">
                 <span className="text-2xl font-black text-white">{service.price}</span>
                 <Link to="/booking" className="text-sm font-bold text-primary flex items-center gap-1 hover:text-yellow-300">
                   Book <ArrowRight size={16} />
                 </Link>
               </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* 4. How It Works */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-primary/5 rounded-[3rem] -z-10"></div>
        <motion.div className="text-center mb-16 pt-10" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
          <p className="text-gray-400 text-lg">Your flawless look in three simple steps.</p>
        </motion.div>
        
        <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-12 px-8 pb-10" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
          {[
            { step: "01", title: "Select a Barber", desc: "Browse our roster of master barbers and pick your preferred artist." },
            { step: "02", title: "Pick a Time", desc: "Choose a convenient time slot that fits your busy schedule." },
            { step: "03", title: "Look Amazing", desc: "Show up, relax, and let our professionals work their magic." },
          ].map((item, i) => (
            <motion.div key={i} variants={fadeInUp} className="flex flex-col items-center text-center relative">
              <div className="text-7xl font-black text-white/5 absolute -top-10 left-1/2 -translate-x-1/2 select-none">{item.step}</div>
              <div className="w-16 h-16 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-2xl mb-6 border border-primary/30 z-10 transition-transform group-hover:scale-110">
                {i + 1}
              </div>
              <h3 className="text-2xl font-bold mb-3 z-10">{item.title}</h3>
              <p className="text-gray-400 z-10">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* 5. CTA Section */}
      <motion.section 
        className="py-20 text-center glass-card relative overflow-hidden mb-12"
        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
        <h2 className="text-5xl font-black mb-6">Ready for an Upgrade?</h2>
        <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">Join thousands of gentlemen who trust TRIMLY for their grooming needs. Create an account today and book your first session.</p>
        <Link to="/booking" className="btn-primary inline-flex items-center gap-3 text-xl px-12 py-5 rounded-2xl">
          <Calendar size={28} />
          Book Your Session Now
        </Link>
      </motion.section>
    </div>
  );
};

export default Home;
