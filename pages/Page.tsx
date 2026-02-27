import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getPageByHandle, ShopifyPage } from '../services/shopify';
import PageHeader from '../components/PageHeader';
import { useTranslation } from 'react-i18next';

const Page: React.FC = () => {
    const { t } = useTranslation();
    const { handle } = useParams<{ handle: string }>();
    const [page, setPage] = useState<ShopifyPage | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchPage = async () => {
            if (!handle) return;

            try {
                const data = await getPageByHandle(handle);
                if (data) {
                    setPage(data);
                } else {
                    setError(true);
                }
                setLoading(false);
            } catch (err) {
                console.error('Failed to fetch page:', err);
                setError(true);
                setLoading(false);
            }
        };

        fetchPage();
    }, [handle]);

    if (loading) {
        return (
            <div className="pb-20 bg-hett-bg">
                <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="py-24 text-center">
                        <span className="text-hett-muted font-medium animate-pulse">{t('page.loading')}</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !page) {
        return (
            <div className="pb-20 bg-hett-bg">
                <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="py-24 text-center">
                        <h1 className="text-2xl font-bold text-hett-dark mb-4">{t('page.notFound')}</h1>
                        <p className="text-hett-muted mb-8">{t('page.notFoundDesc')}</p>
                        <Link to="/" className="btn-primary">
                            {t('common.backToHome')}
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="pb-20 bg-hett-bg">
            <PageHeader
                title={page.title}
                subtitle={page.bodySummary || undefined}
            />

            <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back link */}
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-hett-muted hover:text-hett-primary transition-colors mb-8 text-sm font-medium"
                >
                    <ArrowLeft size={16} />
                    {t('common.backToHome')}
                </Link>

                {/* Page Content */}
                <article
                    className="prose prose-lg max-w-none bg-white rounded-2xl p-8 shadow-sm border border-gray-100
                        prose-headings:text-hett-dark prose-headings:font-bold
                        prose-p:text-gray-600 prose-p:leading-relaxed
                        prose-a:text-hett-primary prose-a:no-underline hover:prose-a:underline
                        prose-strong:text-hett-dark
                        prose-ul:text-gray-600 prose-ol:text-gray-600
                        prose-img:rounded-xl prose-img:shadow-lg"
                    dangerouslySetInnerHTML={{ __html: page.body }}
                />
            </div>
        </div>
    );
};

export default Page;
