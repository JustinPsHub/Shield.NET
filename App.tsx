import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Dashboard from './components/Dashboard';
import Pricing from './components/Pricing';
import Footer from './components/Footer';

const App: React.FC = () => {
  const [activePage, setActivePage] = useState('home');

  const scrollToSection = (id: string) => {
    setActivePage(id);
    if (id === 'dashboard' || id === 'home') {
       window.scrollTo({ top: 0, behavior: 'smooth' });
       return;
    }
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg text-white font-sans selection:bg-brand-500 selection:text-white">
      <Navbar onNavigate={scrollToSection} activePage={activePage} />
      
      <main>
        {activePage === 'dashboard' ? (
          <div className="pt-20">
             <Dashboard />
          </div>
        ) : (
          <>
            <Hero onCtaClick={() => scrollToSection('dashboard')} />
            <Features />
            <Dashboard /> 
            <Pricing onNavigate={scrollToSection} />
          </>
        )}
      </main>
      
      <Footer onNavigate={scrollToSection} />
    </div>
  );
};

export default App;