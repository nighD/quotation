import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { ArticleCard } from '../../components/ArticleCard';
import { useAuth } from '../../context/AuthContext';

const REPORT_DATA: Record<string, { title: string, date: string }> = {
  "1": { title: "Article Name 01 - Experience frictionless global payments with premium flexibility", date: "Sun 17 May 15:29" },
  "2": { title: "Article Name 02 - Experience frictionless global payments with premium flexibility", date: "Sun 17 May 15:29" },
  "3": { title: "Article Name 03 - Experience frictionless global payments with premium flexibility", date: "Sun 17 May 15:29" },
  "4": { title: "Article Name 04 - Experience frictionless global payments with premium flexibility", date: "Sun 17 May 15:29" },
  "5": { title: "Article Name 05 - Experience frictionless global payments with premium flexibility", date: "Sun 17 May 15:29" },
  "6": { title: "Article Name 06 - Experience frictionless global payments with premium flexibility", date: "Sun 17 May 15:29" },
  "7": { title: "Article Name 07 - Experience frictionless global payments with premium flexibility", date: "Sun 17 May 15:29" },
  "8": { title: "Article Name 08 - Experience frictionless global payments with premium flexibility", date: "Sun 17 May 15:29" },
  "9": { title: "Title of demo article here, Experience frictionless global payments with premium flexibility", date: "Sun 17 May 15:29" },
};

export function ReportDetail() {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<'free' | 'basic' | 'pro' | 'premium'>('free');
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const report = id ? REPORT_DATA[id] || REPORT_DATA["9"] : REPORT_DATA["9"];

  useEffect(() => {
    if (user && user.roles && user.roles.includes('premium')) {
      setUserRole('premium');
    } else {
      setUserRole('free');
    }
  }, [user]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  return (
    <div className="min-h-screen bg-[#111] bg-cover bg-center bg-no-repeat flex flex-col font-poppins relative" style={{ backgroundImage: "url('/bg.png')" }}>
      <div className="absolute inset-0 bg-black/40 pointer-events-none"></div>
      <Navbar />

      <div className="relative z-10 flex-1 flex flex-col px-6 md:px-12 max-w-[1400px] mx-auto w-full pt-4">
        {/* Main Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 w-full mt-6 mb-16">
          
          {/* Left Column: Report Contents */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div>
              <h1 className="text-3xl md:text-[34px] font-semibold text-white tracking-tight leading-snug">
                {report.title}
              </h1>
              <p className="text-[#8E8E93] text-[14px] font-medium mt-2">
                {report.date}
              </p>
            </div>

            {/* Banner Image */}
            <div className="w-full max-w-[944px] aspect-[944/480] rounded-[24px] overflow-hidden border border-white/5 shadow-2xl">
              <img
                src="/crypto_blocks.png"
                alt="Crypto blocks banner"
                className="w-full h-full object-cover select-none pointer-events-none"
              />
            </div>

            {/* Content Headings & Paragraphs */}
            <div>
              <h2 className="text-xl md:text-[22px] font-semibold text-white leading-snug mt-4">
                XRP Price Prediction: Pennant Breakout Signals 6% Rally Amid Whale Buying as XXRP ETF Hits $462M
              </h2>
              
              <p className="text-gray-300 text-[15px] leading-relaxed font-normal mt-4">
                Market sentiment around XRP has been bolstered by regulatory clarity in key jurisdictions and the increasing adoption of RippleNet by major banks. The recent milestone of the XXRP ETF reaching $462 million in assets under management demonstrates growing institutional confidence in XRP's long-term prospects.
              </p>

              <p className="text-gray-300 text-[15px] leading-relaxed font-normal mt-4">
                From a fundamental perspective, Ripple's continued partnerships with central banks for CBDC development and the expansion of On-Demand Liquidity services provide strong underlying support for XRP's utility and value proposition. These developments create a favorable environment for sustained price appreciation beyond short-term technical movements.
              </p>
            </div>

            {/* Mock PDF Document Frame */}
            <div className="my-6 flex flex-col items-center">
              <div className="w-[340px] max-w-full aspect-[1/1.38] bg-white rounded-[24px] p-6 shadow-2xl flex flex-col justify-between border border-[#e5e7eb] relative select-none group transition-transform hover:scale-[1.01] duration-300">
                {/* LSEG / DIFC Header */}
                <div className="flex justify-between items-start w-full border-b border-gray-100 pb-3">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-800 tracking-wider">LSEG</span>
                    <span className="text-[6.5px] font-bold text-gray-500 tracking-tight">DATA & ANALYTICS</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-gray-800 tracking-wide">DIFC</span>
                    <span className="text-[8px] font-semibold text-red-600 border border-red-500/20 px-1 rounded bg-red-50">20</span>
                  </div>
                </div>

                {/* Cover Title & Geometric Visual Pattern */}
                <div className="flex-1 flex flex-col justify-start pt-6">
                  <h3 className="text-[22px] font-bold text-[#1f2937] leading-tight mb-8">
                    Wealth and asset management outlook
                  </h3>
                  
                  {/* Concentric hexagonal outline patterns */}
                  <div className="relative w-44 h-44 mx-auto flex items-center justify-center opacity-90 mt-2">
                    {/* Concentric Hexagons */}
                    {[1, 2, 3, 4, 5].map((idx) => {
                      const scale = 1 - (idx - 1) * 0.15;
                      const rotation = (idx - 1) * 15;
                      return (
                        <div
                          key={idx}
                          className="absolute border border-emerald-600/30 transition-transform duration-300 group-hover:rotate-[45deg]"
                          style={{
                            width: `${176 * scale}px`,
                            height: `${176 * scale}px`,
                            transform: `rotate(${rotation}deg)`,
                            clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
                          }}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* View Full Report Pill Button */}
                <div className="flex justify-center my-6 z-10">
                  <button className="bg-transparent border border-gray-300 hover:border-black hover:bg-black/5 text-[#1f2937] text-[13px] font-semibold px-6 py-2.5 rounded-full flex items-center gap-2 transition-all cursor-pointer shadow-sm">
                    <span>View full report</span>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="7" y1="17" x2="17" y2="7" />
                      <polyline points="7 7 17 7 17 17" />
                    </svg>
                  </button>
                </div>

                {/* Footer text */}
                <div className="flex justify-between items-center w-full border-t border-gray-100 pt-3 text-[9px] text-gray-400 font-semibold tracking-tight">
                  <span>The future is here</span>
                  <span>difc.ae</span>
                </div>
              </div>
              <p className="text-center text-gray-400 text-[13px] mt-3 font-semibold">
                Wealth and asset management outlook.pdf
              </p>
            </div>

            {/* Extra Paragraphs */}
            <div>
              <p className="text-gray-300 text-[15px] leading-relaxed font-normal mt-2">
                XRP, the digital asset associated with Ripple Labs, is showing promising technical indicators that suggest a potential 6% rally in the coming days. The cryptocurrency has been consolidating within a pennant formation, a bullish continuation pattern that often precedes significant price movements.
              </p>

              <p className="text-gray-300 text-[15px] leading-relaxed font-normal mt-4">
                Recent on-chain data reveals increased whale activity, with large holders accumulating XRP at current price levels. This institutional interest coincides with growing adoption of Ripple's payment solutions across various financial institutions globally.
              </p>
            </div>
          </div>

          {/* Right Column: Search + Related Articles */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            {/* Sidebar Search Bar */}
            <div className="relative w-full">
              <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search news..."
                className="w-full bg-[#2d2a2a]/40 border border-white/10 rounded-full py-2.5 pl-11 pr-4 text-white text-[14px] placeholder-gray-400 focus:outline-none focus:border-white/20 transition-all font-poppins"
              />
            </div>

            {/* Related Articles Stack */}
            <div className="flex flex-col gap-6">
              <h3 className="text-[18px] font-semibold text-white mt-2">Related Articles</h3>

              <div className="flex flex-col gap-6 w-full">
                <ArticleCard
                  title="Article Name 02"
                  date="Sun 17 May 15:29"
                  abstract="Experience frictionless global payments with premium flexibility. Click to explore our full suite of benefits, including.Experience frictionless global payments with premium flexibility. Click to explore our full suite of benefits, including..."
                  requiredRole="premium"
                  userRole={userRole}
                  variant="report"
                  onExpand={() => navigate('/reports/detail/2')}
                  className="w-full"
                />
                
                <ArticleCard
                  title="Article Name 03"
                  date="Sun 17 May 15:29"
                  abstract="Experience frictionless global payments with premium flexibility. Click to explore our full suite of benefits, including.Experience frictionless global payments with premium flexibility. Click to explore our full suite of benefits, including..."
                  requiredRole="free"
                  userRole={userRole}
                  variant="report"
                  imageUrl="/blue_card.png"
                  onExpand={() => navigate('/reports/detail/3')}
                  className="w-full"
                />

                <ArticleCard
                  title="Article Name 02"
                  date="Sun 17 May 15:29"
                  abstract="Experience frictionless global payments with premium flexibility. Click to explore our full suite of benefits, including.Experience frictionless global payments with premium flexibility. Click to explore our full suite of benefits, including..."
                  requiredRole="premium"
                  userRole={userRole}
                  variant="report"
                  onExpand={() => navigate('/reports/detail/2')}
                  className="w-full"
                />

                <ArticleCard
                  title="Article Name 03"
                  date="Sun 17 May 15:29"
                  abstract="Experience frictionless global payments with premium flexibility. Click to explore our full suite of benefits, including.Experience frictionless global payments with premium flexibility. Click to explore our full suite of benefits, including..."
                  requiredRole="free"
                  userRole={userRole}
                  variant="report"
                  imageUrl="/blue_card.png"
                  onExpand={() => navigate('/reports/detail/3')}
                  className="w-full"
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
