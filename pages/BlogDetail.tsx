import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, ArrowLeft, User } from 'lucide-react';
import { getBlogArticleByHandle, BlogArticle } from '../services/shopify';

const BlogDetail: React.FC = () => {
    const { handle } = useParams<{ handle: string }>();
    const [article, setArticle] = useState<BlogArticle | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchArticle = async () => {
            if (!handle) return;

            try {
                const data = await getBlogArticleByHandle(handle);
                if (data) {
                    setArticle(data);
                } else {
                    setError(true);
                }
                setLoading(false);
            } catch (err) {
                console.error('Failed to fetch blog article:', err);
                setError(true);
                setLoading(false);
            }
        };

        fetchArticle();
    }, [handle]);

    // Format date
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('nl-NL', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    // Calculate reading time
    const getReadingTime = (content: string) => {
        const textContent = content.replace(/<[^>]+>/g, '');
        const wordCount = textContent.split(/\s+/).length;
        return Math.max(1, Math.ceil(wordCount / 200));
    };

    if (loading) {
        return (
            <div className="pb-20 bg-hett-bg">
                <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="py-24 text-center">
                        <span className="text-hett-muted font-medium animate-pulse">Artikel laden...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !article) {
        return (
            <div className="pb-20 bg-hett-bg">
                <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="py-24 text-center">
                        <h1 className="text-2xl font-bold text-hett-dark mb-4">Artikel niet gevonden</h1>
                        <p className="text-hett-muted mb-8">Het artikel dat u zoekt bestaat niet of is verwijderd.</p>
                        <Link to="/blog" className="btn-primary">
                            Terug naar blog
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="pb-20 bg-hett-bg">
            {/* Hero Image */}
            {article.image && (
                <div className="w-full h-[300px] md:h-[400px] lg:h-[500px] relative overflow-hidden bg-gray-100 mb-12">
                    <img
                        src={article.image.url}
                        alt={article.image.altText || article.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </div>
            )}

            <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back link */}
                <Link
                    to="/blog"
                    className="inline-flex items-center gap-2 text-hett-muted hover:text-hett-primary transition-colors mb-8 text-sm font-medium"
                >
                    <ArrowLeft size={16} />
                    Terug naar blog
                </Link>

                {/* Article Header */}
                <header className="mb-12">
                    <div className="inline-block bg-hett-secondary/10 text-hett-secondary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                        Nieuws
                    </div>

                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-hett-dark mb-6 leading-tight">
                        {article.title}
                    </h1>

                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-6 text-sm text-hett-muted">
                        <span className="flex items-center gap-2">
                            <Calendar size={16} className="text-hett-secondary" />
                            {formatDate(article.publishedAt)}
                        </span>
                        <span className="flex items-center gap-2">
                            <Clock size={16} className="text-hett-secondary" />
                            {getReadingTime(article.content)} min leestijd
                        </span>
                        {article.author && (
                            <span className="flex items-center gap-2">
                                <User size={16} className="text-hett-secondary" />
                                {article.author}
                            </span>
                        )}
                    </div>
                </header>

                {/* Article Content */}
                <article
                    className="prose prose-lg max-w-none
                        prose-headings:text-hett-dark prose-headings:font-bold
                        prose-p:text-gray-600 prose-p:leading-relaxed
                        prose-a:text-hett-primary prose-a:no-underline hover:prose-a:underline
                        prose-strong:text-hett-dark
                        prose-ul:text-gray-600 prose-ol:text-gray-600
                        prose-img:rounded-xl prose-img:shadow-lg
                        mb-12"
                    dangerouslySetInnerHTML={{ __html: article.content }}
                />

                {/* Footer CTA */}
                <div className="border-t border-gray-200 pt-12">
                    <div className="bg-hett-light rounded-2xl p-8 text-center">
                        <h3 className="text-xl font-bold text-hett-dark mb-3">
                            Vragen over dit artikel?
                        </h3>
                        <p className="text-hett-muted mb-6">
                            Neem contact met ons op voor meer informatie of advies op maat.
                        </p>
                        <Link to="/contact" className="btn-primary">
                            Contact opnemen
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlogDetail;
