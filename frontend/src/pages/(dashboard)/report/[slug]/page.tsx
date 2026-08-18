import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Calendar, Maximize2, Search, X, FileText, Lock, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiClient } from "../../../../api/client";
import { useAuth } from "../../../../context/AuthContext";
import { UpgradeModal } from "../../../../components/UpgradeModal";

interface ArticleItem {
  id: string;
  slug: string;
  title: string;
  date: string;
  description: string;
  isDark?: boolean;
  isLocked?: boolean;
}

interface Block {
  type: "heading" | "text" | "image" | "pdf" | "html";
  level?: string;
  content?: string;
  url?: string;
  name?: string;
  thumbnail?: string;
  activeRole?: string;
  html?: string;
}

interface ArticleDetail {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  description?: string;
  content: string[];
  blocks: Block[];
  html?: string;
  bannerUrl: string;
  date: string;
  isLocked?: boolean;
}

const ROLE_LEVELS: Record<string, number> = {
  free: 0,
  base: 1,
  standard: 2,
  premium: 3,
  admin: 4,
};

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

const MaximizeIcon = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="15 3 21 3 21 9" />
    <polyline points="9 21 3 21 3 15" />
    <line x1="21" y1="3" x2="14" y2="10" />
    <line x1="3" y1="21" x2="10" y2="14" />
  </svg>
);

const FacebookIcon = ({ size = 18, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
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

export default function ReportDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<"free" | "base" | "standard" | "premium" | "admin">("free");
  const [searchQuery, setSearchQuery] = useState("");
  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    if (user && user.roles) {
      const roleOrder = ["free", "base", "standard", "premium", "admin"];
      let maxRole = "free";
      for (const r of user.roles) {
        if (roleOrder.indexOf(r) > roleOrder.indexOf(maxRole)) {
          maxRole = r;
        }
      }
      setUserRole(maxRole as any);
    } else {
      setUserRole("free");
    }
  }, [user]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsPreviewOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!slug) return;

    const fetchDetailAndRelated = async () => {
      setLoading(true);
      setError("");
      try {
        // Fetch article detail
        const { data: detailRes } = await apiClient.get(`/cms/articles/${slug}`);
        if (detailRes.success && detailRes.data) {
          const d = detailRes.data;

          let parsedParagraphs: string[] = [];
          if (d.content && d.content.trim().length > 0) {
            parsedParagraphs = d.content.split(/\n\n+/).filter(Boolean);
          } else if (d.description && d.description.trim().length > 0) {
            parsedParagraphs = [d.description];
          }

          let parsedBlocks: Block[] = [];
          if (d.blocks) {
            if (typeof d.blocks === "string") {
              try {
                parsedBlocks = JSON.parse(d.blocks);
              } catch {
                // ignore
              }
            } else if (Array.isArray(d.blocks)) {
              parsedBlocks = d.blocks;
            }
          }

          setArticle({
            id: d.id,
            slug: d.slug || d.id,
            title: d.title,
            subtitle: d.description && d.description.trim().length > 0 ? d.description : undefined,
            description: d.description || "",
            content: parsedParagraphs,
            blocks: parsedBlocks,
            html: d.html,
            bannerUrl: d.thumbnail || d.banner_url || "/admin/banner-report.png",
            date: formatArticleDate(d.created_at),
            isLocked: d.required_role ? d.required_role !== "free" : getArticleRequiredRole(d) !== "free",
          });
        }

        // Fetch related articles
        const { data: listRes } = await apiClient.get("/cms/articles?page=1&page_size=5");
        if (listRes.success && Array.isArray(listRes.data)) {
          const filtered = listRes.data
            .filter((item: any) => item.slug !== slug && item.id !== slug)
            .slice(0, 4)
            .map((item: any, index: number) => ({
              id: item.id,
              slug: item.slug || item.id,
              title: item.title,
              date: formatArticleDate(item.created_at),
              description:
                item.description && item.description.trim().length > 0
                  ? item.description
                  : "Experience frictionless global payments with premium flexibility. Click to explore our full suite of benefits.",
              isDark: index % 2 === 1,
              isLocked: item.required_role ? item.required_role !== "free" : getArticleRequiredRole(item) !== "free",
            }));
          setRelatedArticles(filtered);
        }
      } catch (err: any) {
        console.error("Failed to load article detail:", err);
        setError("Không thể tải bài viết hoặc bài viết không tồn tại.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetailAndRelated();
  }, [slug]);

  useEffect(() => {
    if (article?.title) {
      document.title = `${article.title} — On-Chain Card`;
    }
  }, [article?.title]);

  const userLevel = ROLE_LEVELS[userRole] || 0;

  return (
    <div className="w-full pb-12">
      {/* Sticky Header Bar */}
      <div className="sticky -top-3 sm:-top-4 md:-top-6 lg:-top-6 xl:-top-8 z-10 -mx-3 sm:-mx-4 md:-mx-6 lg:-mx-6 xl:-mx-8 px-4 sm:px-6 md:px-8 py-3 bg-[#F2E8E0]/95 backdrop-blur-md border-b border-[#DCD0C5] mb-6 sm:mb-8 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => navigate("/report")}
          className="bg-[#523C37] hover:bg-[#382b24] text-[#F2E8E0] px-3.5 sm:px-4 py-2 rounded-lg font-['Inter']! text-[11px] sm:text-[12px] font-medium! tracking-wider uppercase flex items-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
        >
          <ArrowLeft size={14} />
          <span>BACK TO REPORT</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="relative flex items-center bg-[#E5DBD2] rounded-full px-3.5 sm:px-4 py-2 w-48 sm:w-60 md:w-65 border border-transparent focus-within:border-[#B58F6F] focus-within:bg-white transition-all shadow-2xs">
            <Search size={15} className="text-[#664E48] shrink-0" />
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

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-6 animate-pulse">
          <div className="text-center space-y-3">
            <div className="h-8 bg-[#D2C2B3]/60 rounded-md w-2/3 mx-auto" />
            <div className="h-4 bg-[#D2C2B3]/40 rounded-md w-1/4 mx-auto" />
          </div>
          <div className="h-72 bg-[#D2C2B3]/50 rounded-2xl w-full" />
          <div className="space-y-3 pt-4">
            <div className="h-4 bg-[#D2C2B3]/40 rounded-md w-full" />
            <div className="h-4 bg-[#D2C2B3]/40 rounded-md w-full" />
            <div className="h-4 bg-[#D2C2B3]/40 rounded-md w-4/5" />
          </div>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="rounded-2xl bg-[#F9ECE8] p-8 text-center space-y-4">
          <p className="text-[14px] font-['Inter']! text-[#9A4D3A]">{error}</p>
          <button
            type="button"
            onClick={() => navigate("/report")}
            className="bg-[#523C37] text-white px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider"
          >
            Quay lại danh sách
          </button>
        </div>
      )}

      {/* Article Content */}
      {!loading && !error && article && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          <div className="lg:col-span-8 xl:col-span-9 flex flex-col min-w-0">
            <div className="text-center mb-6 select-none">
              <h1 className="font-['Cormorant_Garamond']! text-center text-[#523C37] leading-snug mb-4 mx-auto">
                <span className="font-semibold! text-[24px] sm:text-[28px] md:text-[32px] block">{article.title}</span>
                {article.subtitle && (
                  <span className="font-semibold! text-[18px] sm:text-[22px] md:text-[24px] text-[#7C6354] block mt-1">{article.subtitle}</span>
                )}
              </h1>

              <div className="inline-flex items-center gap-2 bg-[#E8D7C9] text-[#523C37] px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl font-['Inter']! text-xs font-normal! tracking-wider uppercase shadow-2xs border border-[#DFD3C7]/60">
                <Calendar size={13} className="text-[#523C37]" />
                <span>{article.date}</span>
              </div>
            </div>

            {/* Banner Image Container with Hover Preview Trigger */}
            <div
              onClick={() => setIsPreviewOpen(true)}
              className="relative w-full h-[240px] xs:h-[280px] sm:h-[340px] md:h-[400px] lg:h-[420px] overflow-hidden mb-6 sm:mb-8 rounded-2xl sm:rounded-3xl shadow-sm border border-[#E4D6CA] group cursor-pointer select-none bg-stone-900/5"
            >
              <img
                src={article.bannerUrl}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/admin/banner-report.png";
                }}
              />

              {/* Hover Zoom Icon at Top-Right without background overlay */}
              <div className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-100 scale-90">
                <button
                  type="button"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/65 hover:bg-black/85 text-white backdrop-blur-md flex items-center justify-center shadow-lg border border-white/20 transition cursor-pointer active:scale-95"
                  title="Phóng to ảnh"
                >
                  <Maximize2 size={16} className="text-white" />
                </button>
              </div>
            </div>

            {/* Article Content Paragraphs & Blocks */}
            <div className="space-y-5 text-[#523C37] font-['Inter']! text-[14px] sm:text-[15px] md:text-[16px] leading-relaxed font-normal! text-justify">
              {article.html && <div dangerouslySetInnerHTML={{ __html: article.html }} className="prose max-w-none text-[#523C37]" />}

              {article.content.map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}

              {/* Dynamic Blocks Rendering (PDFs, Images, Headings) */}
              {article.blocks && article.blocks.length > 0 && (
                <div className="space-y-6 pt-4">
                  {article.blocks.map((block, bIdx) => {
                    if (block.type === "heading") {
                      const HeadingTag = `h${block.level || 2}` as any;
                      return (
                        <HeadingTag key={bIdx} className="text-[20px] sm:text-[22px] font-semibold text-[#1B1A16] pt-2">
                          {block.content}
                        </HeadingTag>
                      );
                    }

                    if (block.type === "text") {
                      return <p key={bIdx}>{block.content}</p>;
                    }

                    if (block.type === "image") {
                      return (
                        <div key={bIdx} className="w-full rounded-2xl overflow-hidden shadow-sm border border-[#E4D6CA] my-4">
                          <img src={block.url} alt="" className="w-full h-auto object-cover" />
                        </div>
                      );
                    }

                    if (block.type === "pdf") {
                      const requiredLevel = ROLE_LEVELS[block.activeRole || "free"] || 0;
                      const hasPdfAccess = userLevel >= requiredLevel;
                      const roleName = block.activeRole ? block.activeRole.toUpperCase() : "STANDARD";

                      return (
                        <div key={bIdx} className="my-8 flex flex-col items-center">
                          <div className="w-[320px] sm:w-[350px] max-w-full aspect-[1/1.42] bg-[#1E1B18] rounded-[24px] overflow-hidden shadow-2xl flex flex-col justify-between border border-[#D9C8BA]/40 relative select-none group transition-transform hover:scale-[1.01] duration-300">
                            {/* Real Thumbnail from S3 or Clean Modern Cover */}
                            {block.thumbnail ? (
                              <div className="absolute inset-0 w-full h-full">
                                <img src={block.thumbnail} alt={block.name || article.title} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/35 to-black/85" />
                              </div>
                            ) : (
                              <div className="absolute inset-0 bg-gradient-to-b from-[#3E2D28] to-[#1E1614] p-6 flex flex-col justify-between">
                                <div className="flex justify-between items-center text-[#E8D7C9]/70 text-[11px] font-semibold uppercase tracking-wider">
                                  <span>Official Report</span>
                                  <span className="bg-white/10 px-2 py-0.5 rounded text-white/90">PDF</span>
                                </div>
                                <div className="my-auto py-6">
                                  <h3 className="text-[20px] font-semibold text-white leading-snug">{block.name || article.title}</h3>
                                </div>
                              </div>
                            )}

                            {/* Top Badge Header */}
                            <div className="relative z-10 flex justify-between items-center p-5">
                              <span className="bg-black/50 backdrop-blur-md text-white/90 text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full border border-white/10 flex items-center gap-1.5">
                                <FileText size={12} className="text-[#B58F6F]" />
                                <span>PDF DOCUMENT</span>
                              </span>
                              {!hasPdfAccess && (
                                <span className="bg-red-500/20 text-red-300 text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full border border-red-500/30 flex items-center gap-1">
                                  <Lock className="w-3 h-3" />
                                  <span>{roleName} ONLY</span>
                                </span>
                              )}
                            </div>

                            {/* Bottom Action Section */}
                            <div className="relative z-10 p-5 flex flex-col gap-3">
                              <h4 className="text-white text-[15px] font-semibold line-clamp-2 drop-shadow-md font-['Inter']">{block.name || article.title}</h4>

                              {hasPdfAccess ? (
                                <button
                                  type="button"
                                  onClick={() => navigate(`/report/${article.slug}/pdf`)}
                                  className="w-full bg-[#E8D7C9] hover:bg-[#F2E8E0] text-[#523C37] text-[13px] font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg active:scale-98"
                                >
                                  <span>Đọc báo cáo PDF</span>
                                  <ExternalLink size={14} />
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setShowUpgradeModal(true)}
                                  className="w-full bg-white/15 hover:bg-white/25 border border-white/20 text-white text-[12px] font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg backdrop-blur-md"
                                >
                                  <Lock className="w-3.5 h-3.5 text-white/80" />
                                  <span>Yêu cầu gói {roleName} trở lên</span>
                                </button>
                              )}
                            </div>
                          </div>
                          <p className="text-center text-[#7C6354] text-[13px] mt-3 font-semibold">{block.name || `${article.title}.pdf`}</p>
                        </div>
                      );
                    }

                    return null;
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar: Share & Related */}
          <div className="lg:col-span-4 xl:col-span-3 select-none lg:border-l lg:border-[#DCD0C5] lg:pl-6 xl:pl-8 pt-4 lg:pt-0">
            <div className="sticky top-20 flex flex-col gap-5 sm:gap-6">
              <div>
                <h2 className="font-['Cormorant_Garamond']! text-[20px] sm:text-[22px] font-semibold! text-[#1B1A16] mb-3">Shared</h2>
                <button
                  type="button"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({ title: article.title, url: window.location.href }).catch(() => {});
                    } else {
                      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, "_blank");
                    }
                  }}
                  className="w-10 h-10 rounded-full bg-[#E5DBD2] hover:bg-[#E8D7C9] text-[#1B1A16] flex items-center justify-center transition cursor-pointer shadow-2xs border border-[#DFD3C7] active:scale-95"
                  title="Share on Facebook"
                >
                  <FacebookIcon size={18} />
                </button>
              </div>

              <div className="h-px bg-[#DCD0C5] w-full my-1" />

              {relatedArticles.length > 0 && (
                <div>
                  <h2 className="font-['Cormorant_Garamond']! text-[20px] sm:text-[22px] font-semibold! text-[#1B1A16] mb-4">Related Reports</h2>

                  <div className="flex flex-col gap-3.5 sm:gap-4">
                    {relatedArticles.map((relArt, index) => (
                      <motion.div
                        key={relArt.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                        whileHover={{ y: -2 }}
                        onClick={() => navigate(`/report/${relArt.slug || relArt.id}`)}
                        className={`rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col justify-between shadow-xs border transition-all cursor-pointer ${
                          relArt.isDark ? "bg-[#B58F6F] text-[#F2E8E0] border-[#a67e63]" : "bg-[#E8D7C9] text-[#523C37] border-[#dfd3c7]"
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-3 mb-1">
                            <div className="flex-1 min-w-0">
                              <h3
                                className={`font-['Cormorant_Garamond']! text-[19px] sm:text-[21px] font-semibold! leading-tight truncate ${
                                  relArt.isDark ? "text-white" : "text-[#1B1A16]"
                                }`}
                              >
                                {relArt.title}
                              </h3>
                              <p
                                className={`font-['Inter'] text-[10px] font-medium tracking-wider uppercase mt-1 ${
                                  relArt.isDark ? "text-[#F2E8E0]!" : "text-[#B58F6F]"
                                }`}
                              >
                                {relArt.date}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/report/${relArt.slug || relArt.id}`);
                              }}
                              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg transition-all duration-200 cursor-pointer shrink-0 active:scale-95 flex items-center justify-center ${
                                relArt.isLocked
                                  ? "bg-[#E8D7C9] hover:bg-[#ded0c2] text-[#523C37] shadow-2xs"
                                  : relArt.isDark
                                    ? "bg-white/30 hover:bg-white/40 text-white"
                                    : "bg-[#523C37] hover:bg-[#382b24] text-white"
                              }`}
                              title={relArt.isLocked ? "Locked Article" : "Expand Article"}
                            >
                              {relArt.isLocked ? <FilledLock size={15} /> : <MaximizeIcon size={15} />}
                            </button>
                          </div>

                          <div className={`h-px w-full my-2.5 sm:my-3 ${relArt.isDark ? "bg-[#F2E8E0]/30" : "bg-[#664E48]/25"}`} />

                          <p
                            className={`font-['Inter']! font-normal! text-[12px] leading-relaxed line-clamp-3 ${
                              relArt.isDark ? "text-[#1B1A16]" : "text-[#523C37]"
                            }`}
                          >
                            {relArt.description}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Lightbox Modal */}
      <AnimatePresence>
        {isPreviewOpen && article && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-6" onClick={() => setIsPreviewOpen(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center justify-center select-none"
            >
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="absolute -top-12 right-0 sm:-right-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/35 text-white flex items-center justify-center transition cursor-pointer backdrop-blur-sm shadow-md active:scale-95"
                title="Đóng (Esc)"
              >
                <X size={20} />
              </button>

              <img
                src={article.bannerUrl}
                alt={article.title}
                className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl border border-white/10"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onSuccess={() => {
          setShowUpgradeModal(false);
          window.location.reload();
        }}
      />
    </div>
  );
}
