import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { getBlogArticles, BlogArticle } from '../services/shopify';
import PageHeader from '../components/PageHeader';

const Blog: React.FC = () => {
    const [articles, setArticles] = useState<BlogArticle[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                const data = await getBlogArticles(20);
                setArticles(data);
                setLoading(false);
            } catch (err) {
                console.error('Failed to fetch blog articles:', err);
                setError(true);
                setLoading(false);
            }
        };

        fetchArticles();
    }, []);

    // Format date
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('nl-NL', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        }).replace(/\//g, '-');
    };

    // Calculate reading time
    const getReadingTime = (content: string) => {
        const textContent = content.replace(/<[^>]+>/g, '');
        const wordCount = textContent.split(/\s+/).length;
        return Math.max(1, Math.ceil(wordCount / 200));
    };

    return (
        <div className="pb-20 bg-hett-bg">
            <PageHeader
                title="Blog & Nieuws"
                subtitle="Blijf op de hoogte van het laatste nieuws, tips en inspiratie rondom terrasoverkappingen en buitenleven."
            />

            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                {loading ? (
                    <div className="py-24 text-center">
                        <span className="text-hett-muted font-medium animate-pulse">Artikelen laden...</span>
                    </div>
                ) : error ? (
                    <div className="py-24 text-center">
                        <p className="text-hett-muted">Er is een fout opgetreden bij het laden van de artikelen.</p>
                    </div>
                ) : articles.length === 0 ? (
                    <div className="py-24 text-center">
                        <p className="text-hett-muted">Geen artikelen gevonden.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {articles.map((article) => (
                            <Link
                                key={article.id}
                                to={`/blog/${article.handle}`}
                                className="group flex flex-col h-full bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100"
                            >
                                {/* Image */}
                                <div className="aspect-[16/10] relative overflow-hidden bg-gray-100">
                                    {article.image ? (
                                        <img
                                            src={article.image.url}
                                            alt={article.image.altText || article.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-hett-primary/20 to-hett-secondary/20 flex items-center justify-center">
                                            <span className="text-hett-muted text-sm">Geen afbeelding</span>
                                        </div>
                                    )}
                                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold text-hett-dark shadow-sm uppercase tracking-wider">
                                        Nieuws
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6 flex flex-col flex-grow">
                                    {/* Meta */}
                                    <div className="flex items-center gap-4 text-xs text-gray-400 mb-3 font-medium">
                                        <span className="flex items-center gap-1.5">
                                            <Calendar size={14} className="text-hett-secondary" />
                                            {formatDate(article.publishedAt)}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Clock size={14} className="text-hett-secondary" />
                                            {getReadingTime(article.content)} min
                                        </span>
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-lg font-bold text-hett-dark mb-3 leading-tight line-clamp-2 min-h-[3rem] group-hover:text-hett-primary transition-colors">
                                        {article.title}
                                    </h3>

                                    {/* Excerpt */}
                                    <p className="text-hett-muted text-sm leading-relaxed mb-6 line-clamp-2">
                                        {article.excerpt || article.content.replace(/<[^>]+>/g, '').substring(0, 140) + '...'}
                                    </p>

                                    {/* Footer */}
                                    <div className="mt-auto flex items-center text-sm font-bold text-hett-dark">
                                        Lees meer
                                        <ArrowRight
                                            size={16}
                                            className="ml-2 text-hett-secondary group-hover:translate-x-1 transition-transform duration-300"
                                        />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Blog;
