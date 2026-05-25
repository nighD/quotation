import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { ArticleCard } from '../../components/ArticleCard';
import { useAuth } from '../../context/AuthContext';
import { Lock } from 'lucide-react';
import { apiClient } from '../../api/client';

interface Block {
  type: 'heading' | 'text' | 'image' | 'pdf';
  level?: string;
  content?: string;
  url?: string;
  name?: string;
  thumbnail?: string;
  activeRole?: string;
}

interface Article {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail: string;
  content: string;
  blocks: string | Block[];
  created_at: string;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
}

const ROLE_LEVELS: Record<string, number> = {
  free: 0,
  base: 1,
  standard: 2,
  premium: 3,
  admin: 4,
};

const formatArticleDate = (dateStr: string): string => {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  } catch (e) {
    return dateStr;
  }
};

const getArticleRequiredRole = (blocksStr: string | Block[] | undefined): string => {
  if (!blocksStr) return 'free';
  try {
    const blocks = typeof blocksStr === 'string' ? JSON.parse(blocksStr) : blocksStr;
    if (Array.isArray(blocks)) {
      const pdfBlock = blocks.find(b => b.type === 'pdf');
      if (pdfBlock && pdfBlock.activeRole) {
        return pdfBlock.activeRole;
      }
    }
  } catch (e) {
    console.error('Error parsing article blocks', e);
  }
  return 'free';
};

export function ReportDetail() {
  const { user, setUser } = useAuth();
  const [userRole, setUserRole] = useState<'free' | 'base' | 'standard' | 'premium' | 'admin'>('free');
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>(); // id is the slug

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedArticles, setRelatedArticles] = useState<any[]>([]);

  useEffect(() => {
    const verifyTokenAndRoles = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const { data } = await apiClient.get('/auth/profile');
          if (data && data.data) {
            setUser(data.data);
          }
        } catch (error) {
          console.error("Token verification / refresh failed", error);
        }
      }
    };
    verifyTokenAndRoles();
  }, [setUser]);

  useEffect(() => {
    if (user && user.roles) {
      const roleOrder = ['free', 'base', 'standard', 'premium', 'admin'];
      let maxRole = 'free';
      for (const r of user.roles) {
        if (roleOrder.indexOf(r) > roleOrder.indexOf(maxRole)) {
          maxRole = r;
        }
      }
      setUserRole(maxRole as any);
    } else {
      setUserRole('free');
    }
  }, [user]);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const { data } = await apiClient.get(`/cms/articles/${id}`);
        if (data.success && data.data) {
          setArticle(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch article details', err);
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [id]);

  useEffect(() => {
    if (article) {
      document.title = article.seo_title || article.title;
      
      // Update meta description
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', article.seo_description || article.description || '');

      // Update meta keywords
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.setAttribute('name', 'keywords');
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.setAttribute('content', article.seo_keywords || '');

      // Update Open Graph tags helper
      const updateOGTag = (property: string, content: string) => {
        let tag = document.querySelector(`meta[property="${property}"]`);
        if (!tag) {
          tag = document.createElement('meta');
          tag.setAttribute('property', property);
          document.head.appendChild(tag);
        }
        tag.setAttribute('content', content);
      };

      updateOGTag('og:title', article.seo_title || article.title);
      updateOGTag('og:description', article.seo_description || article.description || '');
      updateOGTag('og:image', article.thumbnail || '');
      updateOGTag('og:url', window.location.href);
      updateOGTag('og:type', 'article');
    }
  }, [article]);

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        const { data } = await apiClient.get('/cms/articles?page=1&page_size=10');
        if (data.success && data.data) {
          setRelatedArticles(data.data.filter((a: any) => a.slug !== id).slice(0, 4));
        }
      } catch (err) {
        console.error('Failed to fetch related articles', err);
      }
    };
    fetchRelated();
  }, [id]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111] flex items-center justify-center text-white">
        <div className="animate-pulse">Loading report...</div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-[#111] flex items-center justify-center text-white font-sans">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Report not found</h2>
          <button onClick={() => navigate('/reports')} className="px-6 py-2 bg-white text-black rounded-full font-semibold">
            Back to Reports
          </button>
        </div>
      </div>
    );
  }

  // Parse blocks
  let blocks: Block[] = [];
  if (article.blocks) {
    if (typeof article.blocks === 'string') {
      try {
        blocks = JSON.parse(article.blocks);
      } catch (e) {
        console.error('Failed to parse blocks JSON', e);
      }
    } else if (Array.isArray(article.blocks)) {
      blocks = article.blocks;
    }
  }

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
                {article.title}
              </h1>
              <p className="text-[#8E8E93] text-[14px] font-medium mt-2">
                {formatArticleDate(article.created_at)}
              </p>
            </div>

            {/* Banner Image */}
            {article.thumbnail && (
              <div className="w-full max-w-[944px] aspect-[944/480] rounded-[24px] overflow-hidden border border-white/5 shadow-2xl">
                <img
                  src={article.thumbnail}
                  alt={article.title}
                  className="w-full h-full object-cover select-none pointer-events-none"
                />
              </div>
            )}

            {/* Content Headings & Paragraphs sequentially rendered from blocks */}
            <div className="flex flex-col gap-4">
              {blocks.map((block, index) => {
                if (block.type === 'heading') {
                  const HeadingTag = `h${block.level || 2}` as any;
                  return (
                    <HeadingTag key={index} className="text-xl md:text-[22px] font-semibold text-white leading-snug mt-6">
                      {block.content}
                    </HeadingTag>
                  );
                }

                if (block.type === 'text') {
                  return (
                    <p key={index} className="text-gray-300 text-[15px] leading-relaxed font-normal">
                      {block.content}
                    </p>
                  );
                }

                if (block.type === 'image') {
                  return (
                    <div key={index} className="w-full max-w-[944px] rounded-[24px] overflow-hidden border border-white/5 shadow-2xl my-6">
                      <img
                        src={block.url}
                        alt=""
                        className="w-full h-auto object-cover select-none pointer-events-none"
                      />
                    </div>
                  );
                }

                if (block.type === 'pdf') {
                  const requiredLevel = ROLE_LEVELS[block.activeRole || 'free'] || 0;
                  const userLevel = ROLE_LEVELS[userRole] || 0;
                  const hasPdfAccess = userLevel >= requiredLevel;

                  return (
                    <div key={index} className="my-6 flex flex-col items-center">
                      <div className="w-[340px] max-w-full aspect-[1/1.38] bg-white rounded-[24px] p-6 shadow-2xl flex flex-col justify-between border border-[#e5e7eb] relative select-none group transition-transform hover:scale-[1.01] duration-300">
                        {/* Header */}
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
                            {block.name || article.title}
                          </h3>
                          
                          {/* Concentric hexagonal outline patterns */}
                          <div className="relative w-44 h-44 mx-auto flex items-center justify-center opacity-90 mt-2">
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

                        {/* Gradient + Blur overlay */}
                        <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-black/25 to-black/80 backdrop-blur-[1.5px] rounded-[24px] pointer-events-none" />

                        {/* View Full Report Pill Button */}
                        <div className="flex justify-center my-6 relative z-10">
                          {hasPdfAccess ? (
                            <button 
                              onClick={() => window.open(`/reports/${article.slug}/pdf`, '_blank')}
                              className="bg-white border border-gray-200 hover:bg-gray-50 text-black text-[13px] font-semibold px-6 py-2.5 rounded-full flex items-center gap-2 transition-all cursor-pointer shadow-md"
                            >
                              <span>View full report</span>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="7" y1="17" x2="17" y2="7" />
                                <polyline points="7 7 17 7 17 17" />
                              </svg>
                            </button>
                          ) : (
                            <button 
                              onClick={() => navigate('/subscriptions')}
                              className="bg-white border border-gray-200 hover:border-red-500 hover:bg-red-50 text-black hover:text-red-500 text-[13px] font-semibold px-6 py-2.5 rounded-full flex items-center gap-2 transition-all cursor-pointer shadow-md group/btn"
                            >
                              <Lock className="w-3.5 h-3.5 text-black/60 group-hover/btn:text-red-500 transition-colors" />
                              <span>Only available for {block.activeRole ? block.activeRole.charAt(0).toUpperCase() + block.activeRole.slice(1) : 'Premium'}</span>
                            </button>
                          )}
                        </div>

                        {/* Footer text */}
                        <div className="flex justify-between items-center w-full border-t border-gray-100 pt-3 text-[9px] text-gray-400 font-semibold tracking-tight">
                          <span>The future is here</span>
                          <span>difc.ae</span>
                        </div>
                      </div>
                      <p className="text-center text-gray-400 text-[13px] mt-3 font-semibold">
                        {block.name || `${article.title}.pdf`}
                      </p>
                    </div>
                  );
                }

                return null;
              })}
            </div>
          </div>

          {/* Right Column: Search + Related Articles */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            {/* Related Articles Stack */}
            <div className="flex flex-col gap-6">
              <h3 className="text-[18px] font-semibold text-white mt-2">Related Articles</h3>

              <div className="flex flex-col gap-6 w-full">
                {relatedArticles.map((art) => (
                  <ArticleCard
                    key={art.id}
                    title={art.title}
                    date={formatArticleDate(art.created_at)}
                    abstract={art.description || art.title}
                    requiredRole={getArticleRequiredRole(art.blocks)}
                    userRole={userRole}
                    variant="report"
                    imageUrl={art.thumbnail}
                    onExpand={() => navigate(`/reports/detail/${art.slug}`)}
                    className="w-full"
                  />
                ))}
                {relatedArticles.length === 0 && (
                  <p className="text-gray-400 text-sm">No related articles found.</p>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
