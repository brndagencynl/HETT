import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, ArrowRight, Loader2, Tag } from 'lucide-react';
import { getProjectByHandle, ShopifyProject, getProjectPlaceholder } from '../src/services/shopify';

const ProjectDetail: React.FC = () => {
    const { handle } = useParams<{ handle: string }>();
    const [project, setProject] = useState<ShopifyProject | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchProject = async () => {
            if (!handle) return;

            console.log(`[Projects] Fetching project: ${handle}`);
            try {
                const data = await getProjectByHandle(handle);
                if (data) {
                    setProject(data);
                    console.log(`[Projects] Loaded project: ${data.title}`);
                } else {
                    console.log(`[Projects] Project not found: ${handle}`);
                    setError(true);
                }
                setLoading(false);
            } catch (err) {
                console.error('[Projects] Failed to fetch project:', err);
                setError(true);
                setLoading(false);
            }
        };

        fetchProject();
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

    // Get location from tags
    const getLocation = (tags: string[]): string | null => {
        const locTag = tags.find(t => t.toLowerCase().startsWith('loc:'));
        return locTag ? locTag.substring(4).trim() : null;
    };

    // Get category tags (non-location tags)
    const getCategoryTags = (tags: string[]): string[] => {
        return tags.filter(t => !t.toLowerCase().startsWith('loc:'));
    };

    if (loading) {
        return (
            <div className="bg-white min-h-screen pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="py-24 text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-hett-secondary mx-auto mb-4" />
                        <span className="text-hett-muted font-medium">Project laden...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className="bg-white min-h-screen pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="py-24 text-center">
                        <h1 className="text-2xl font-bold text-hett-dark mb-4">Project niet gevonden</h1>
                        <p className="text-hett-muted mb-8">Het project dat u zoekt bestaat niet of is verwijderd.</p>
                        <Link to="/projecten" className="btn-primary">
                            Terug naar projecten
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const location = getLocation(project.tags);
    const categoryTags = getCategoryTags(project.tags);

    return (
        <div className="bg-white min-h-screen pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
                <Link to="/projecten" className="text-gray-500 hover:text-hett-dark flex items-center gap-1 text-sm mb-6">
                    <ArrowLeft size={16} /> Terug naar projecten
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left Content */}
                    <div className="lg:col-span-8">
                        <div className="relative h-[400px] lg:h-[500px] rounded-xl overflow-hidden mb-6 shadow-lg bg-gray-100">
                            <img 
                                src={project.image?.url || getProjectPlaceholder()} 
                                alt={project.image?.altText || project.title} 
                                className="w-full h-full object-cover" 
                            />
                        </div>

                        <h1 className="text-3xl lg:text-4xl font-bold text-hett-dark mb-4">{project.title}</h1>

                        <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-8 border-b border-gray-100 pb-8">
                            {location && (
                                <div className="flex items-center gap-2">
                                    <MapPin size={18} /> {location}
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <Calendar size={18} /> {formatDate(project.publishedAt)}
                            </div>
                            {categoryTags.map((tag, idx) => (
                                <span 
                                    key={idx}
                                    className="bg-slate-100 px-3 py-0.5 rounded text-hett-dark font-medium flex items-center gap-1"
                                >
                                    <Tag size={14} />
                                    {tag}
                                </span>
                            ))}
                        </div>

                        {project.excerpt && (
                            <p className="text-lg text-gray-600 mb-6 font-medium">{project.excerpt}</p>
                        )}

                        <div 
                            className="prose prose-slate max-w-none text-gray-600"
                            dangerouslySetInnerHTML={{ __html: project.contentHtml }}
                        />
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-4">
                        <div className="bg-slate-50 p-8 rounded-xl border border-slate-100 sticky top-28">
                            <h3 className="text-xl font-bold text-hett-dark mb-6">Interesse in dit project?</h3>

                            <div className="space-y-4 mb-8">
                                <p className="text-sm text-gray-600">
                                    Wilt u een soortgelijke veranda of tuinkamer realiseren? Vraag een offerte aan voor de benodigde materialen.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <Link
                                    to="/contact"
                                    className="flex items-center justify-center w-full bg-hett-dark text-white font-bold py-3 rounded hover:bg-slate-800 transition-colors"
                                >
                                    Offerte Aanvragen
                                </Link>
                                <Link
                                    to="/categorie/overkappingen"
                                    className="flex items-center justify-center w-full bg-white border border-hett-dark text-hett-dark font-bold py-3 rounded hover:bg-gray-50 transition-colors"
                                >
                                    Stel zelf samen <ArrowRight size={16} className="ml-2" />
                                </Link>
                            </div>

                            <div className="mt-8 pt-8 border-t border-slate-200">
                                <h4 className="font-bold text-hett-dark mb-4">Bekijk onze producten</h4>
                                <div className="space-y-2 text-sm">
                                    <Link to="/categorie/overkappingen" className="block text-gray-600 hover:text-hett-primary transition-colors">
                                        → Veranda's & Overkappingen
                                    </Link>
                                    <Link to="/products/sandwichpaneel" className="block text-gray-600 hover:text-hett-primary transition-colors">
                                        → Sandwichpanelen
                                    </Link>
                                    <Link to="/shop" className="block text-gray-600 hover:text-hett-primary transition-colors">
                                        → Alle producten
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectDetail;