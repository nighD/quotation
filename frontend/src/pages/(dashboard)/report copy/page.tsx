import { AnimatePresence, motion } from 'framer-motion';
import { Filter, Maximize2, Search } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../_layouts/AdminLayout';

interface Article {
    id: number;
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
            d="M4 9.5C3.17157 9.5 2.5 10.1716 2.5 11V19.5C2.5 20.8807 3.61929 22 5 22H19C20.3807 22 21.5 20.8807 21.5 19.5V11C21.5 10.1716 20.8284 9.5 20 9.5H4ZM12 13C11.1716 13 10.5 13.6716 10.5 14.5C10.5 15.15 10.91 15.7 11.48 15.91L11.1 18.2C11.04 18.57 11.33 18.9 11.7 18.9H12.3C12.67 18.9 12.96 18.57 12.9 18.2L12.52 15.91C13.09 15.7 13.5 15.15 13.5 14.5C13.5 13.6716 12.8284 13 12 13Z"
            fill="currentColor"
        />
    </svg>
);

const CATEGORIES = [
    { id: 1, label: 'Top Categories' },
    { id: 2, label: 'Hover/Active' },
    { id: 3, label: 'Top Categories' },
    { id: 4, label: 'Top Categories' },
];

const INITIAL_ARTICLES: Article[] = [
    {
        id: 1,
        title: 'Article Name 01',
        date: 'SUN 17 MAY 15:29',
        description:
            'Experience frictionless global payments with premium flexibility. Click to explore our full suite of benefits, including.Experience frictionless global payments with premium flexibility. Click to explore our full suite of benefits, including...',
        isDark: false,
        isLocked: false,
    },
    {
        id: 2,
        title: 'Article Name 01',
        date: 'SUN 17 MAY 15:29',
        description:
            'Experience frictionless global payments with premium flexibility. Click to explore our full suite of benefits, including.Experience frictionless global payments with premium flexibility. Click to explore our full suite of benefits, including...',
        isDark: true,
        isLocked: true,
    },
    {
        id: 3,
        title: 'Article Name 01',
        date: 'SUN 17 MAY 15:29',
        description:
            'Experience frictionless global payments with premium flexibility. Click to explore our full suite of benefits, including.Experience frictionless global payments with premium flexibility. Click to explore our full suite of benefits, including...',
        isDark: false,
        isLocked: false,
    },
    {
        id: 4,
        title: 'Article Name 01',
        date: 'SUN 17 MAY 15:29',
        description:
            'Experience frictionless global payments with premium flexibility. Click to explore our full suite of benefits, including.Experience frictionless global payments with premium flexibility. Click to explore our full suite of benefits, including...',
        isDark: true,
        isLocked: true,
    },
    {
        id: 5,
        title: 'Article Name 01',
        date: 'SUN 17 MAY 15:29',
        description:
            'Experience frictionless global payments with premium flexibility. Click to explore our full suite of benefits, including.Experience frictionless global payments with premium flexibility. Click to explore our full suite of benefits, including...',
        isDark: false,
        isLocked: false,
    },
    {
        id: 6,
        title: 'Article Name 01',
        date: 'SUN 17 MAY 15:29',
        description:
            'Experience frictionless global payments with premium flexibility. Click to explore our full suite of benefits, including.Experience frictionless global payments with premium flexibility. Click to explore our full suite of benefits, including...',
        isDark: false,
        isLocked: false,
    },
];

export default function ReportPage() {
    const navigate = useNavigate();
    const [activeCategory, setActiveCategory] = useState<number>(2);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

    const filteredArticles = INITIAL_ARTICLES.filter((art) =>
        art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <AdminLayout>
            <div className="w-full">
                <div className="mb-8 select-none">
                    <h1 className="font-['Cormorant_Garamond']! text-[36px] md:text-[40px] font-semibold! text-[#1B1A16] mb-2 leading-tight">
                        Report
                    </h1>
                    <p className="font-['Inter']! text-[13px] md:text-md text-[#523C37] font-normal! leading-relaxed max-w-190">
                        Phòng Grand Ballroom là trung tâm hội nghị quốc tế lớn và hiện đại bậc nhất miền Trung. Với sức
                        chứa tối đa 750 khách hội nghị và 500 khách tiệc ngồi, đây là không gian lý tưởng.
                    </p>
                </div>

                <div className="mb-5 select-none">
                    <h2 className="font-['Cormorant_Garamond']! text-[24px] font-semibold! text-[#1B1A16] mb-4">
                        Top Categories
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {CATEGORIES.map((cat) => {
                            const isActive = activeCategory === cat.id;
                            return (
                                <motion.button
                                    key={cat.id}
                                    type="button"
                                    whileHover={{ y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setActiveCategory(cat.id)}
                                    className={`min-h-24 rounded-[20px] p-5 flex items-center justify-center font-['Cormorant_Garamond']! text-[24px] font-semibold! transition-all duration-200 cursor-pointer shadow-xs ${isActive
                                        ? 'bg-[#E8D7C9] border-2 border-[#B58F6F] text-[#D16419] shadow-sm'
                                        : 'bg-[#E5DBD2] hover:bg-[#E8D7C9]/80 border-2 border-transparent text-[#664E48]'
                                        }`}
                                >
                                    {cat.label}
                                </motion.button>
                            );
                        })}
                    </div>
                </div>

                <div className="flex items-center justify-between mb-2 flex-wrap gap-4 select-none">
                    <h2 className="font-['Cormorant_Garamond']! text-[24px] font-semibold! text-[#1B1A16] mb-4">
                        Articles
                    </h2>

                    <div className="flex items-center gap-3">
                        <div className="relative flex items-center bg-[#E5DBD2] rounded-full px-4 py-3 w-55 sm:w-65 border border-transparent focus-within:border-[#B58F6F] focus-within:bg-white transition-all shadow-2xs">
                            <Search size={16} className="text-[#664E48] shrink-0" />
                            <input
                                type="text"
                                placeholder="Search articles..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-transparent border-none outline-none font-['Inter'] text-[12px] text-[#1B1A16] placeholder:text-[#664E48]/60 w-full ml-2"
                            />
                        </div>

                        <button
                            type="button"
                            className="w-10 h-10 rounded-full bg-[#C8BBB0] hover:bg-[#E8D7C9] text-[#664E48] flex items-center justify-center transition cursor-pointer active:scale-95 shadow-2xs"
                            title="Filter articles"
                        >
                            <Filter size={18} />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {filteredArticles.map((article, index) => (
                        <motion.div
                            key={article.id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.25, delay: index * 0.05 }}
                            whileHover={{ y: -3 }}
                            onClick={() => navigate(`/admin/report/${article.id}`)}
                            className={`rounded-3xl p-6 flex flex-col justify-between min-h-57.5 shadow-xs border transition-shadow cursor-pointer ${article.isDark
                                ? 'bg-[#B58F6F] text-[#F2E8E0] border-[#a67e63]'
                                : 'bg-[#E8D7C9] text-[#523C37] border-[#dfd3c7]'
                                }`}
                        >
                            <div>
                                <div className="flex items-start justify-between gap-3 mb-1">
                                    <div>
                                        <h3
                                            className={`font-['Cormorant_Garamond']! text-[24px] font-semibold! leading-tight ${article.isDark ? 'text-white' : 'text-[#1B1A16]'
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
                                            navigate(`/admin/report/${article.id}`);
                                        }}
                                        className={`w-10 h-10 rounded-lg transition-all duration-200 cursor-pointer shrink-0 active:scale-95 flex items-center justify-center ${article.isLocked
                                            ? 'bg-[#E8D7C9] hover:bg-[#ded0c2] text-[#523C37] shadow-2xs'
                                            : article.isDark
                                                ? 'bg-white/30 hover:bg-white/40 text-white'
                                                : 'bg-[#523C37] hover:bg-[#382b24] text-white'
                                            }`}
                                        title={article.isLocked ? 'Locked Article' : 'Expand Article'}
                                    >
                                        {article.isLocked ? <FilledLock size={16} /> : <Maximize2 size={16} />}
                                    </button>
                                </div>

                                <div
                                    className={`h-px w-full my-3 ${article.isDark ? 'bg-[#F2E8E0]/30' : 'bg-[#664E48]/25'
                                        }`}
                                />

                                <p
                                    className={`font-['Inter']! font-normal! text-sm! leading-relaxed line-clamp-4 ${article.isDark ? 'text-[#1B1A16]' : 'text-[#523C37]'
                                        }`}
                                >
                                    {article.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="flex items-center justify-center gap-2 mt-5 select-none">
                    {[1, 2, 3].map((page) => (
                        <button
                            key={page}
                            type="button"
                            onClick={() => setCurrentPage(page)}
                            className={`w-8 h-8 rounded-full font-['Inter'] text-[13px] font-medium transition cursor-pointer flex items-center justify-center ${currentPage === page
                                ? 'bg-[#E8D7C9] text-[#1B1A16] shadow-xs'
                                : 'text-[#664E48] hover:bg-[#E8D7C9]/40'
                                }`}
                        >
                            {page}
                        </button>
                    ))}
                </div>

                <AnimatePresence>
                    {selectedArticle && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                className="bg-[#FDFBF7] rounded-[28px] p-6 max-w-135 w-full border border-[#e0c4a4] shadow-2xl overflow-hidden relative"
                            >
                                <h3 className="font-['Cormorant_Garamond'] text-[28px] font-semibold text-[#1B1A16] mb-1">
                                    {selectedArticle.title}
                                </h3>
                                <p className="font-['Inter'] text-[11px] font-medium uppercase tracking-wider text-[#B58F6F] mb-4">
                                    {selectedArticle.date}
                                </p>
                                <div className="h-px bg-stone-200 w-full mb-4" />
                                <p className="font-['Inter'] text-[13px] text-[#523C37] leading-relaxed mb-6">
                                    {selectedArticle.description}
                                </p>
                                <div className="flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedArticle(null)}
                                        className="bg-[#523C37] hover:bg-[#382b24] text-white font-['Inter'] text-[12px] font-medium uppercase tracking-wider px-5 py-2.5 rounded-xl cursor-pointer transition active:scale-95"
                                    >
                                        ĐÓNG
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </AdminLayout>
    );
}
