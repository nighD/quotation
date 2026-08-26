import { motion } from "framer-motion";
import { Filter, Maximize2, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../../api/client";
import { PortalModal } from "../../../components";

interface ArticleItem {
  id: string;
  slug: string;
  title: string;
  date: string;
  description: string;
  isDark?: boolean;
  isLocked?: boolean;
}

const FilledLock = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <path d="M6.5 10V7a5.5 5.5 0 0 1 11 0v3" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M4 9.5C3.17157 9.5 2.5 10.1716 2.5 11V19.5C2.5 20.8807 3.61929 22 5 22H19C20.3807 22 21.5 20.8807 21.5 19.5V11C21.5 10.1716 20.8284 9.5 20 9.5H4ZM12 13C11.1716 13 10.5 13.6716 10.5 14.5C10.5 15.15 10.91 15.7 11.48 15.91L11.1 18.2C11.04 18.57 11.33 18.9 11.7 18.9H12.3C12.67 18.9 12.96 18.57 12.52 15.91C13.09 15.7 13.5 15.15 13.5 14.5C13.5 13.6716 12.8284 13 12 13Z"
      fill="currentColor"
    />
  </svg>
);

const getArticleRequiredRole = (article: any): string => {
  if (!article) return "free";
  if (article.required_role) return article.required_role;
  if (!article.blocks) return "free";

  try {
    const blocks = typeof article.blocks === "string" ? JSON.parse(article.blocks) : article.blocks;
    if (Array.isArray(blocks)) {
      const pdfBlock = blocks.find((block: any) => block.type === "pdf");
      if (pdfBlock?.activeRole) {
        return pdfBlock.activeRole;
      }
    }
  } catch {
    // ignore
  }

  return "free";
};

const formatArticleDate = (dateStr: string): string => {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch {
    return dateStr;
  }
};

export default function ReportPage() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedArticle, setSelectedArticle] = useState<ArticleItem | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await apiClient.get(`/cms/articles?page=${currentPage}&page_size=6`);
        if (data.success && Array.isArray(data.data)) {
          const mapped: ArticleItem[] = data.data.map((item: any, index: number) => ({
            id: item.id,
            slug: item.slug || item.id,
            title: item.title,
            date: formatArticleDate(item.created_at),
            description:
              item.description && item.description.trim().length > 0
                ? item.description
                : "Experience frictionless global payments with premium flexibility. Click to explore our full suite of benefits, including detailed market analysis and forecasts.",
            isDark: index % 2 === 1,
            isLocked: item.required_role ? item.required_role !== "free" : getArticleRequiredRole(item) !== "free",
          }));
          setArticles(mapped);

          if (data.meta) {
            const pages = data.meta.total_pages || Math.ceil((data.meta.total_items || data.meta.total || mapped.length) / 6) || 1;
            setTotalPages(Math.max(1, pages));
          }
        }
      } catch (err: any) {
        console.error("Failed to fetch articles:", err);
        setError("Không thể tải danh sách bài viết.");
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [currentPage]);

  const filteredArticles = articles.filter(
    (art) => art.title.toLowerCase().includes(searchQuery.toLowerCase()) || art.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="w-full space-y-6 sm:space-y-8">
      <div className="select-none">
        <h1 className="font-['Cormorant_Garamond']! text-[28px] sm:text-[34px] md:text-[40px] font-semibold! text-[#1B1A16] mb-2 leading-tight">Report</h1>
        <p className="font-['Inter']! text-[13px] sm:text-[14px] md:text-[15px] text-[#523C37] font-normal! leading-relaxed max-w-3xl">
          Phòng Grand Ballroom là trung tâm hội nghị quốc tế lớn và hiện đại bậc nhất miền Trung. Với sức chứa tối đa 750 khách hội nghị và 500 khách tiệc ngồi,
          đây là không gian lý tưởng.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 select-none pt-2">
        <h2 className="font-['Cormorant_Garamond']! text-[22px] sm:text-[26px] font-semibold! text-[#1B1A16]">Articles</h2>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial flex items-center bg-[#E5DBD2] rounded-full px-4 py-2.5 sm:py-3 sm:w-64 border border-transparent focus-within:border-[#B58F6F] focus-within:bg-white transition-all shadow-2xs">
            <Search size={16} className="text-[#664E48] shrink-0" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none font-['Inter'] text-[13px] text-[#1B1A16] placeholder:text-[#664E48]/60 w-full ml-2"
            />
          </div>

          <button
            type="button"
            className="w-10 h-10 rounded-full bg-[#C8BBB0] hover:bg-[#E8D7C9] text-[#664E48] flex items-center justify-center transition cursor-pointer active:scale-95 shadow-2xs shrink-0"
            title="Filter articles"
          >
            <Filter size={18} />
          </button>
        </div>
      </div>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="rounded-2xl sm:rounded-3xl p-5 sm:p-6 bg-[#E8D7C9]/50 animate-pulse min-h-56 flex flex-col justify-between border border-[#dfd3c7]/60"
            >
              <div>
                <div className="h-6 bg-[#D2C2B3]/60 rounded-md w-3/4 mb-3" />
                <div className="h-3 bg-[#D2C2B3]/40 rounded-md w-1/3 mb-4" />
                <div className="h-px w-full bg-[#D2C2B3]/40 my-3" />
                <div className="space-y-2">
                  <div className="h-3 bg-[#D2C2B3]/40 rounded-md w-full" />
                  <div className="h-3 bg-[#D2C2B3]/40 rounded-md w-5/6" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {!loading && error && <div className="rounded-2xl bg-[#F9ECE8] p-6 text-[13px] font-['Inter']! text-[#9A4D3A] text-center">{error}</div>}

      {/* Articles Grid */}
      {!loading && !error && filteredArticles.length === 0 && (
        <div className="text-center py-12 text-[#664E48] font-['Inter'] text-sm">No articles found matching your search.</div>
      )}

      {!loading && !error && filteredArticles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {filteredArticles.map((article, index) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: index * 0.05 }}
              whileHover={{ y: -3 }}
              onClick={() => navigate(`/report/${article.slug || article.id}`)}
              className={`rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col justify-between min-h-[220px] sm:min-h-57.5 shadow-xs border transition-all cursor-pointer ${
                article.isDark ? "bg-[#B58F6F] text-[#F2E8E0] border-[#a67e63]" : "bg-[#E8D7C9] text-[#523C37] border-[#dfd3c7]"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-1">
                  <div className="flex-1 min-w-0">
                    <h3
                      className={`font-['Cormorant_Garamond']! text-[20px] sm:text-[24px] font-semibold! leading-tight truncate ${
                        article.isDark ? "text-white" : "text-[#1B1A16]"
                      }`}
                    >
                      {article.title}
                    </h3>
                    <p
                      className={`font-['Inter'] text-[10px] font-medium tracking-wider uppercase mt-1 ${
                        article.isDark ? "text-[#F2E8E0]!" : "text-[#B58F6F]"
                      }`}
                    >
                      {article.date}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/report/${article.slug || article.id}`);
                    }}
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg transition-all duration-200 cursor-pointer shrink-0 active:scale-95 flex items-center justify-center ${
                      article.isLocked
                        ? "bg-[#E8D7C9] hover:bg-[#ded0c2] text-[#523C37] shadow-2xs"
                        : article.isDark
                          ? "bg-white/30 hover:bg-white/40 text-white"
                          : "bg-[#523C37] hover:bg-[#382b24] text-white"
                    }`}
                    title={article.isLocked ? "Locked Article" : "Expand Article"}
                  >
                    {article.isLocked ? <FilledLock size={16} /> : <Maximize2 size={16} />}
                  </button>
                </div>

                <div className={`h-px w-full my-3 ${article.isDark ? "bg-[#F2E8E0]/30" : "bg-[#664E48]/25"}`} />

                <p
                  className={`font-['Inter']! font-normal! text-xs sm:text-sm! leading-relaxed line-clamp-4 ${article.isDark ? "text-[#1B1A16]" : "text-[#523C37]"}`}
                >
                  {article.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2 select-none">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => setCurrentPage(page)}
              className={`w-8 h-8 rounded-full font-['Inter'] text-[13px] font-medium transition cursor-pointer flex items-center justify-center ${
                currentPage === page ? "bg-[#E8D7C9] text-[#1B1A16] shadow-xs" : "text-[#664E48] hover:bg-[#E8D7C9]/40"
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}

      {/* Article Detail Modal Popup */}
      <PortalModal
        isOpen={Boolean(selectedArticle)}
        onClose={() => setSelectedArticle(null)}
        title={selectedArticle?.title}
        subtitle={selectedArticle?.date}
        width="max-w-lg"
        footer={
          <button
            type="button"
            onClick={() => setSelectedArticle(null)}
            className="bg-[#523C37] hover:bg-[#382b24] text-white font-['Inter'] text-[12px] font-medium uppercase tracking-wider px-5 py-2.5 rounded-xl cursor-pointer transition active:scale-95 shadow-xs"
          >
            ĐÓNG
          </button>
        }
      >
        <p className="font-['Inter'] text-[13.5px] text-[#523C37] leading-relaxed whitespace-pre-line">{selectedArticle?.description}</p>
      </PortalModal>
    </div>
  );
}
