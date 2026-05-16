import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Lock } from 'lucide-react';

interface Category {
  id: string;
  name: string;
}

interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: string;
  is_preview: boolean;
  category: Category;
  created_at: string;
}

export function ArticleDetail() {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const { data } = await apiClient.get(`/cms/articles/${id}`);
        if (data.success) {
          setArticle(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch article', err);
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [id]);

  if (loading) return <div className="p-10 text-center font-display text-verge-magenta">Loading...</div>;
  if (!article) return <div className="p-10 text-center font-display">Article not found</div>;

  return (
    <article className="max-w-4xl mx-auto px-4 py-12 relative">
      <div className="mb-8 border-b-4 border-verge-magenta pb-6">
        <div className="text-verge-neon font-display tracking-widest text-sm uppercase mb-2">
          {article.category?.name || 'Uncategorized'}
        </div>
        <h1 className="text-5xl md:text-7xl font-display font-black leading-none mb-6">
          {article.title}
        </h1>
        <div className="text-gray-400 font-sans text-sm">
          Published on {new Date(article.created_at).toLocaleDateString()}
        </div>
      </div>

      <div className="prose prose-invert prose-lg max-w-none font-sans text-gray-300 leading-relaxed mb-12">
        {article.content}
        {article.is_preview && (
          <div className="absolute bottom-0 left-0 w-full h-64 gradient-paywall z-10 pointer-events-none" />
        )}
      </div>

      {article.is_preview && (
        <div className="relative z-20 -mt-32 p-8 bg-verge-gray border-4 border-verge-magenta text-center shadow-[8px_8px_0px_0px_rgba(232,18,92,1)]">
          <Lock className="mx-auto w-12 h-12 text-verge-magenta mb-4" />
          <h2 className="text-3xl font-display font-black mb-4">Subscriber Exclusive</h2>
          <p className="text-gray-300 mb-6 font-sans">
            To read the full article, please subscribe or log in to your premium account.
          </p>
          <div className="flex gap-4 justify-center">
            {isAuthenticated ? (
              <button onClick={() => navigate('/plans')} className="verge-button bg-verge-magenta border-verge-magenta text-white">
                Upgrade Now
              </button>
            ) : (
              <>
                <Link to="/login" className="verge-button border-verge-white hover:text-white">
                  Log In
                </Link>
                <Link to="/plans" className="verge-button bg-verge-magenta border-verge-magenta text-white">
                  Subscribe
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </article>
  );
}
