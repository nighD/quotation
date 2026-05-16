import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../api/client';

interface Category {
  id: string;
  name: string;
}

interface Article {
  id: string;
  title: string;
  slug: string;
  status: string;
  created_at: string;
  category?: Category;
}

export function ArticleList() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/cms/articles?page=1&page_size=20');
      if (data.success) {
        setArticles(data.data || []);
      }
    } catch (err: any) {
      setError('Failed to load articles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="border-b-8 border-verge-magenta pb-4 mb-12">
        <h1 className="text-6xl md:text-8xl font-display font-black uppercase tracking-tighter text-verge-white leading-none">
          Latest <span className="text-verge-magenta">Intel</span>
        </h1>
      </div>
      
      {error && <div className="text-verge-magenta font-display font-bold p-4 border-2 border-verge-magenta">{error}</div>}
      
      {loading ? (
        <div className="text-3xl font-display text-verge-neon uppercase tracking-widest animate-pulse">
          Fetching data...
        </div>
      ) : articles.length === 0 ? (
        <div className="verge-card border-verge-magenta flex flex-col items-center justify-center p-16">
          <h3 className="text-3xl text-gray-500 uppercase tracking-widest mb-4">Void</h3>
          <p className="text-gray-400">No signals intercepted yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article, i) => (
            <Link 
              to={`/articles/${article.id}`} 
              key={article.id} 
              className={`verge-card block group ${i === 0 ? 'md:col-span-2 lg:col-span-2 row-span-2' : ''}`}
            >
              <div className="flex flex-col h-full justify-between">
                <div>
                  <div className="text-verge-neon font-display tracking-widest text-xs uppercase mb-3 border-b border-verge-border pb-2 inline-block">
                    {article.category?.name || 'Transmission'}
                  </div>
                  <h3 className={`font-display font-black uppercase leading-tight mb-4 group-hover:text-verge-magenta transition-colors ${i === 0 ? 'text-4xl md:text-6xl' : 'text-2xl'}`}>
                    {article.title}
                  </h3>
                </div>
                <div className="flex justify-between items-end mt-8 border-t-2 border-verge-border pt-4">
                  <span className="bg-verge-yellow text-verge-black px-2 py-1 font-bold text-xs uppercase tracking-wider">
                    {article.status}
                  </span>
                  <span className="font-sans text-xs text-gray-500 font-bold uppercase">
                    {new Date(article.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
