import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Search } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Article {
    id: number;
    slug: string;
    title: string;
    date: string;
    description: string;
    isDark?: boolean;
    isLocked?: boolean;
}

const FilledLock = ({ size = 16, className = '' }: { size?: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
        <path
            d="M6.5 10V7a5.5 5.5 0 0 1 11 0v3"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.8"
            strokeLinecap="round"
        />
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M4 9.5C3.17157 9.5 2.5 10.1716 2.5 11V19.5C2.5 20.8807 3.61929 22 5 22H19C20.3807 22 21.5 20.8807 21.5 19.5V11C21.5 10.1716 20.8284 9.5 20 9.5H4ZM12 13C11.1716 13 10.5 13.6716 10.5 14.5C10.5 15.15 10.91 15.7 11.48 15.91L11.1 18.2C11.04 18.57 11.33 18.9 11.7 18.9H12.3C12.67 18.9 12.96 18.57 12.52 15.91C13.09 15.7 13.5 15.15 13.5 14.5C13.5 13.6716 12.8284 13 12 13Z"
            fill="currentColor"
        />
    </svg>
);

const MaximizeIcon = ({ size = 16, className = '' }: { size?: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polyline points="15 3 21 3 21 9" />
        <polyline points="9 21 3 21 3 15" />
        <line x1="21" y1="3" x2="14" y2="10" />
        <line x1="3" y1="21" x2="10" y2="14" />
    </svg>
);

const FacebookIcon = ({ size = 18, className = '' }: { size?: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
);

const RELATED_ARTICLES: Article[] = [
    {
        id: 1,
        slug: 'article-01',
        title: 'Article Name 01',
        date: 'SUN 17 MAY 15:29',
        description:
            'Experience frictionless global payments with premium flexibility. Click to explore our full suite of benefits, including...',
        isDark: false,
        isLocked: false,
    },
    {
        id: 2,
        slug: 'article-02',
        title: 'Article Name 01',
        date: 'SUN 17 MAY 15:29',
        description:
            'Experience frictionless global payments with premium flexibility. Click to explore our full suite of benefits, including...',
        isDark: true,
        isLocked: true,
    },
    {
        id: 3,
        slug: 'article-03',
        title: 'Article Name 01',
        date: 'SUN 17 MAY 15:29',
        description:
            'Experience frictionless global payments with premium flexibility. Click to explore our full suite of benefits, including...',
        isDark: false,
        isLocked: false,
    },
    {
        id: 4,
        slug: 'article-04',
        title: 'Article Name 01',
        date: 'SUN 17 MAY 15:29',
        description:
            'Experience frictionless global payments with premium flexibility. Click to explore our full suite of benefits, including...',
        isDark: false,
        isLocked: false,
    },
];

export default function ReportDetailPage() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    const articleData = {
        title: 'Global Summit 2027',
        subtitle: 'Unlock privileged acces with a seamless experience demo text here.',
        date: 'SUN 17 MAY 15:29',
        bannerUrl: '/admin/banner-report.png',
        content: [
            'XRP, the digital asset associated with Ripple Labs, is showing promising technical indicators that suggest a potential 6% rally in the coming days. The cryptocurrency has been consolidating within a pennant formation, a bullish continuation pattern that often precedes significant price movements.',
            'Recent on-chain data reveals increased whale activity, with large holders accumulating XRP at current price levels. This institutional interest coincides with growing adoption of Ripple\'s payment solutions across various financial institutions globally.',
            'The technical setup shows XRP trading within a symmetrical pennant after a strong upward move earlier this month. The convergence of support and resistance levels has created a tightening range, typically indicating an imminent breakout. Volume analysis supports this thesis, with decreasing volume during the consolidation phase - a characteristic feature of healthy pennant formations.',
            'Market sentiment around XRP has been bolstered by regulatory clarity in key jurisdictions and the increasing adoption of RippleNet by major banks. The recent milestone of the XXRP ETF reaching $462 million in assets under management demonstrates growing institutional confidence in XRP\'s long-term prospects.',
            'From a fundamental perspective, Ripple\'s continued partnerships with central banks for CBDC development and the expansion of On-Demand Liquidity services provide strong underlying support for XRP\'s utility and value proposition. These developments create a favorable environment for sustained price appreciation beyond short-term technical movements.',
            'Risk factors to consider include broader cryptocurrency market volatility, potential regulatory changes, and macroeconomic headwinds that could impact risk asset sentiment. Traders should monitor key resistance levels at $0.75 and $0.82, with a break above these levels confirming the bullish breakout scenario.',
        ],
    };

    return (
        <div className="w-full pb-12">
            <div className="sticky top-0 z-30 bg-[#F2E8E0] flex items-center justify-between gap-4 -mt-4 -mx-4 px-6  pb-4 border-b border-[#DCD0C5] mb-8">
                <button
                    type="button"
                    onClick={() => navigate('/admin/report')}
                    className="bg-[#523C37] hover:bg-[#382b24] text-[#F2E8E0] px-4 py-2 rounded-lg font-['Inter']! text-[12px] font-medium! tracking-wider uppercase flex items-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
                >
                    <ArrowLeft size={14} />
                    <span>BACK TO REPORT</span>
                </button>

                <div className="flex items-center gap-3">
                    <div className="relative flex items-center bg-[#E5DBD2] rounded-full px-4 py-2 w-55 sm:w-65 border border-transparent focus-within:border-[#B58F6F] focus-within:bg-white transition-all shadow-2xs">
                        <Search size={16} className="text-[#664E48] shrink-0" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-transparent border-none outline-none font-['Inter'] text-[12px] text-[#1B1A16] placeholder:text-[#664E48]/60 w-full ml-2"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
                <div className="lg:col-span-9 flex flex-col">
                    <div className="text-center mb-6 select-none">
                        <h1 className="font-['Cormorant_Garamond']! text-center text-[#523C37] leading-snug mb-4 mx-auto">
                            <span className="font-semibold! text-[28px]! block">
                                Global Summit 2027
                            </span>
                            <span className="font-semibold! text-[28px]! ">
                                Unlock privileged acces with a seamless experience demo text here.
                            </span>
                        </h1>

                        <div className="inline-flex items-center gap-2 bg-[#E8D7C9] text-[#523C37] px-6 py-3 rounded-xl font-['Inter']! text-xs font-normal! tracking-wider uppercase shadow-2xs border border-[#DFD3C7]/60">
                            <Calendar size={13} className="text-[#523C37]" />
                            <span>{articleData.date}</span>
                        </div>
                    </div>

                    <div className="w-full overflow-hidden mb-8">
                        <img
                            src={articleData.bannerUrl}
                            alt={articleData.title}
                            className="w-full h-auto object-cover select-none"
                        />
                    </div>

                    <div className="space-y-5 text-[#523C37] font-['Inter']! text-[14px] sm:text-[16px] leading-relaxed font-normal! text-justify">
                        {articleData.content.map((paragraph, idx) => (
                            <p key={idx}>{paragraph}</p>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-3 select-none border-l border-[#DCD0C5] pl-8 -mt-8 pt-8">
                    <div className="sticky top-24 flex flex-col gap-6">
                        <div>
                            <h2 className="font-['Cormorant_Garamond']! text-[22px] font-semibold! text-[#1B1A16] mb-3">
                                Shared
                            </h2>
                            <button
                                type="button"
                                className="w-10 h-10 rounded-full bg-[#E5DBD2] hover:bg-[#E8D7C9] text-[#1B1A16] flex items-center justify-center transition cursor-pointer shadow-2xs border border-[#DFD3C7] active:scale-95"
                                title="Share on Facebook"
                            >
                                <FacebookIcon size={18} />
                            </button>
                        </div>

                        <div className="h-px bg-[#DCD0C5] w-full my-2" />

                        <div>
                            <h2 className="font-['Cormorant_Garamond']! text-[22px] font-semibold! text-[#1B1A16] mb-4">
                                Related Reports
                            </h2>

                            <div className="flex flex-col gap-4">
                                {RELATED_ARTICLES.map((article, index) => (
                                    <motion.div
                                        key={article.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.2, delay: index * 0.05 }}
                                        whileHover={{ y: -2 }}
                                        onClick={() => navigate(`/admin/report/${article.slug}`)}
                                        className={`rounded-3xl p-5 flex flex-col justify-between shadow-xs border transition-all cursor-pointer ${article.isDark
                                            ? 'bg-[#B58F6F] text-[#F2E8E0] border-[#a67e63]'
                                            : 'bg-[#E8D7C9] text-[#523C37] border-[#dfd3c7]'
                                            }`}
                                    >
                                        <div>
                                            <div className="flex items-start justify-between gap-3 mb-1">
                                                <div>
                                                    <h3
                                                        className={`font-['Cormorant_Garamond']! text-[22px] font-semibold! leading-tight ${article.isDark ? 'text-white' : 'text-[#1B1A16]'
                                                            }`}
                                                    >
                                                        {article.title}
                                                    </h3>
                                                    <p
                                                        className={`font-['Inter'] text-[10px] font-medium tracking-wider uppercase mt-1 ${article.isDark ? 'text-[#F2E8E0]!' : 'text-[#B58F6F]'
                                                            }`}
                                                    >
                                                        {article.date}
                                                    </p>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/admin/report/${article.slug}`);
                                                    }}
                                                    className={`w-9 h-9 rounded-lg transition-all duration-200 cursor-pointer shrink-0 active:scale-95 flex items-center justify-center ${article.isLocked
                                                        ? 'bg-[#E8D7C9] hover:bg-[#ded0c2] text-[#523C37] shadow-2xs'
                                                        : article.isDark
                                                            ? 'bg-white/30 hover:bg-white/40 text-white'
                                                            : 'bg-[#523C37] hover:bg-[#382b24] text-white'
                                                        }`}
                                                    title={article.isLocked ? 'Locked Article' : 'Expand Article'}
                                                >
                                                    {article.isLocked ? <FilledLock size={15} /> : <MaximizeIcon size={15} />}
                                                </button>
                                            </div>

                                            <div
                                                className={`h-px w-full my-3 ${article.isDark ? 'bg-[#F2E8E0]/30' : 'bg-[#664E48]/25'
                                                    }`}
                                            />

                                            <p
                                                className={`font-['Inter']! font-normal! text-[12px] leading-relaxed line-clamp-3 ${article.isDark ? 'text-[#1B1A16]' : 'text-[#523C37]'
                                                    }`}
                                            >
                                                {article.description}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
