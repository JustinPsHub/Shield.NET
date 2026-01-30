import React from 'react';

interface FooterProps {
  onNavigate?: (page: string) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const handleLinkClick = (e: React.MouseEvent, action: string) => {
    e.preventDefault();
    if (action.startsWith('http')) {
      window.open(action, '_blank');
    } else if (action === 'mailto') {
       window.location.href = 'mailto:info@shield.net';
    } else if (onNavigate) {
       onNavigate(action);
    }
  };

  return (
    <footer className="bg-dark-bg border-t border-white/10" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">Footer</h2>
      <div className="mx-auto max-w-7xl px-6 pb-8 pt-16 sm:pt-24 lg:px-8 lg:pt-32">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8">
            <span className="text-2xl font-bold text-white">Shield<span className="text-brand-400">.NET</span></span>
            <p className="text-sm leading-6 text-gray-300">
              Commercializing the Trust Layer in the .NET Ecosystem. <br/>
              &copy; 2026 Shield Technologies, Inc.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-white">Product</h3>
                <ul role="list" className="mt-6 space-y-4">
                  <li><button onClick={(e) => handleLinkClick(e, 'https://www.nuget.org/packages')} className="text-sm leading-6 text-gray-300 hover:text-white text-left">NuGet Package</button></li>
                  <li><button onClick={(e) => handleLinkClick(e, 'https://learn.microsoft.com/en-us/dotnet/')} className="text-sm leading-6 text-gray-300 hover:text-white text-left">Documentation</button></li>
                  <li><button onClick={() => alert('Compliance whitepaper downloading...')} className="text-sm leading-6 text-gray-300 hover:text-white text-left">Compliance Guide</button></li>
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-white">Company</h3>
                <ul role="list" className="mt-6 space-y-4">
                  <li><button onClick={(e) => handleLinkClick(e, 'home')} className="text-sm leading-6 text-gray-300 hover:text-white text-left">About</button></li>
                  <li><button onClick={(e) => handleLinkClick(e, 'mailto')} className="text-sm leading-6 text-gray-300 hover:text-white text-left">Enterprise Sales</button></li>
                  <li><button onClick={(e) => handleLinkClick(e, 'https://dotnet.microsoft.com/en-us/platform/partners')} className="text-sm leading-6 text-gray-300 hover:text-white text-left">Partners</button></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;