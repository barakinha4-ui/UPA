'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname, useRouter } from '@/lib/navigation';
import { Menu, X, ShieldAlert, Globe } from 'lucide-react';

export default function Navbar() {
  const locale = useLocale() as 'pt' | 'en';
  const t = useTranslations('nav');
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const toggleLanguage = () => {
    const nextLocale = locale === 'pt' ? 'en' : 'pt';
    router.replace(pathname, { locale: nextLocale });
  };

  const navItems = [
    { name: t('documents'), href: '/documentos' },
    { name: t('map'), href: '/mapa' },
    { name: t('search'), href: '/busca' },
  ];

  return (
    <nav className="sticky top-0 z-40 bg-[#0a0a0f]/80 backdrop-blur-md border-b border-[#c8a96e]/10">
      {/* Top classification bar */}
      <div className="bg-[#cc3333] text-white text-[10px] font-mono tracking-[0.2em] font-bold py-1 text-center select-none">
        RESTRICTED // DECLASSIFIED UAP ARCHIVE
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Title */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center space-x-2 group">
              <ShieldAlert className="h-6 w-6 text-[#c8a96e] group-hover:scale-105 transition-transform" />
              <span className="font-serif text-lg font-bold tracking-wider text-[#e8e8e0] group-hover:text-[#c8a96e] transition-colors">
                UAP VAULT
              </span>
            </Link>
            <span className="ml-3 hidden sm:inline-block font-mono text-[9px] text-[#cc3333] border border-[#cc3333]/30 px-1 py-0.5 rounded select-none">
              PUB-REF-99
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`font-mono text-sm tracking-widest uppercase transition-colors relative py-1 ${
                    isActive ? 'text-[#c8a96e] font-bold' : 'text-[#e8e8e0]/70 hover:text-[#e8e8e0]'
                  }`}
                >
                  {item.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#c8a96e] shadow-[0_0_8px_#c8a96e]" />
                  )}
                </Link>
              );
            })}

            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-1.5 font-mono text-xs tracking-widest text-[#e8e8e0]/60 hover:text-[#c8a96e] transition-colors border border-[#e8e8e0]/20 hover:border-[#c8a96e]/30 px-2.5 py-1 rounded"
              title={locale === 'pt' ? 'Switch to English' : 'Mudar para Português'}
            >
              <Globe className="h-3.5 w-3.5" />
              <span className="uppercase">{locale === 'pt' ? 'EN' : 'PT'}</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-4">
            {/* Language Switcher (mobile navbar) */}
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-1 font-mono text-xs text-[#e8e8e0]/60 hover:text-[#c8a96e] px-2 py-1 border border-[#e8e8e0]/10 rounded"
            >
              <Globe className="h-3 w-3" />
              <span className="uppercase">{locale === 'pt' ? 'EN' : 'PT'}</span>
            </button>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-[#e8e8e0]/70 hover:text-[#e8e8e0] focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-[#0a0a0f] border-b border-[#c8a96e]/10">
          <div className="px-2 pt-2 pb-4 space-y-1 sm:px-3">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`block px-3 py-2.5 rounded-md font-mono text-sm tracking-wider uppercase ${
                    isActive
                      ? 'bg-[#c8a96e]/10 text-[#c8a96e] font-bold border-l-2 border-[#c8a96e]'
                      : 'text-[#e8e8e0]/70 hover:bg-[#e8e8e0]/5 hover:text-[#e8e8e0]'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
