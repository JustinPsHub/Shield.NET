import React from 'react';
import { Shield, Menu, X, Github } from 'lucide-react';

interface NavbarProps {
  onNavigate: (page: string) => void;
  activePage: string;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate, activePage }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const navItems = [
    { name: 'Features', id: 'features' },
    { name: 'Documentation', id: 'docs' },
    { name: 'Pricing', id: 'pricing' },
    { name: 'Enterprise', id: 'enterprise' },
  ];

  const handleNavClick = (id: string) => {
    if (id === 'docs') {
      window.open('https://learn.microsoft.com/en-us/dotnet/', '_blank');
    } else if (id === 'enterprise') {
       window.location.href = 'mailto:enterprise@shield.net';
    } else {
       onNavigate(id);
    }
    setIsOpen(false);
  }

  return (
    <nav className="fixed w-full z-50 top-0 start-0 border-b border-white/10 bg-dark-bg/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between h-16">
          
          {/* Logo */}
          <button onClick={() => onNavigate('home')} className="flex items-center space-x-2 group focus:outline-none">
            <div className="bg-brand-600 p-1.5 rounded-lg group-hover:bg-brand-500 transition-colors">
                <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="self-center text-xl font-bold whitespace-nowrap text-white tracking-tight">
              Shield<span className="text-brand-400">.NET</span>
            </span>
          </button>

          {/* Desktop Menu */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`text-sm font-medium transition-colors ${
                  activePage === item.id ? 'text-brand-400' : 'text-gray-300 hover:text-white'
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex md:items-center md:space-x-4">
             <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <Github className="w-5 h-5" />
             </a>
             <button 
               onClick={() => onNavigate('dashboard')}
               className="text-white bg-brand-600 hover:bg-brand-500 font-medium rounded-lg text-sm px-4 py-2 text-center transition-all shadow-[0_0_15px_rgba(2,132,199,0.5)] hover:shadow-[0_0_20px_rgba(2,132,199,0.7)]"
             >
               Try Live Demo
             </button>
          </div>

          {/* Mobile Toggle */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center p-2 w-10 h-10 justify-center text-gray-400 rounded-lg hover:bg-gray-700 focus:outline-none"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 md:hidden bg-dark-surface border-b border-white/10">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
            >
              {item.name}
            </button>
          ))}
            <button 
               onClick={() => { onNavigate('dashboard'); setIsOpen(false); }}
               className="w-full mt-4 text-white bg-brand-600 font-medium rounded-lg text-sm px-4 py-2"
             >
               Try Live Demo
             </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;