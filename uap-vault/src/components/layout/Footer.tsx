import { ShieldAlert } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#050508] border-t border-[#c8a96e]/10 py-12 px-4 sm:px-6 lg:px-8 mt-auto font-mono text-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-[#e8e8e0]/40">
        
        {/* Left Section - Copyright & Laws */}
        <div className="text-center md:text-left max-w-xl">
          <div className="flex items-center justify-center md:justify-start space-x-2 text-[#e8e8e0]/60 mb-2">
            <ShieldAlert className="h-4 w-4 text-[#c8a96e]" />
            <span className="font-serif text-sm font-bold tracking-wider">UAP VAULT</span>
          </div>
          <p className="leading-relaxed mb-3">
            Public portal of declassified UAP documents. Materials indexed herein are subject to Freedom of Information Act (FOIA) disclosures and United States Department of Defense public release provisions.
          </p>
          <p className="text-[10px] text-[#cc3333]/60 font-semibold tracking-wider">
            AUTHORITY: PURSUE ACT SECTION 992-B // RECON-LEVEL-4
          </p>
        </div>

        {/* Right Section - Official Metas */}
        <div className="text-center md:text-right border border-[#e8e8e0]/10 p-4 rounded bg-white/[0.01] min-w-[200px]">
          <div className="text-[10px] text-[#c8a96e] tracking-widest font-bold uppercase mb-1.5">
            STATUS: SECURE // PUBLIC
          </div>
          <div className="text-[11px] font-bold text-[#e8e8e0]/70 mb-0.5">
            DIGITAL HASH: SHA-256
          </div>
          <div className="text-[10px] text-[#e8e8e0]/40 font-mono break-all select-all">
            4a8b9c...9f2e3d
          </div>
          <div className="mt-3 text-[10px] text-[#e8e8e0]/30">
            &copy; {currentYear} UAP VAULT. No rights reserved.
          </div>
        </div>

      </div>
    </footer>
  );
}
