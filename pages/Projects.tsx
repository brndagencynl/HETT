import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Loader2 } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { getProjectsPage, ShopifyProject, getProjectPlaceholder } from '../src/services/shopify';

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<ShopifyProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      console.log('[Projects] Fetching initial projects...');
      try {
        const result = await getProjectsPage(12);
        setProjects(result.projects);
        setHasMore(result.pageInfo.hasNextPage);
        setCursor(result.pageInfo.endCursor);
        setLoading(false);
        console.log(`[Projects] Loaded ${result.projects.length} projects`);
      } catch (err) {
        console.error('[Projects] Failed to fetch projects:', err);
        setError(true);
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const loadMore = async () => {
    if (!cursor || loadingMore) return;
    
    console.log('[Projects] Loading more projects...');
    setLoadingMore(true);
    try {
      const result = await getProjectsPage(12, cursor);
      setProjects(prev => [...prev, ...result.projects]);
      setHasMore(result.pageInfo.hasNextPage);
      setCursor(result.pageInfo.endCursor);
      console.log(`[Projects] Loaded ${result.projects.length} more projects`);
    } catch (err) {
      console.error('[Projects] Failed to load more projects:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Get location from tags (first tag starting with "loc:")
  const getLocation = (tags: string[]): string | null => {
    const locTag = tags.find(t => t.toLowerCase().startsWith('loc:'));
    return locTag ? locTag.substring(4).trim() : null;
  };

  // Loading skeleton
  const ProjectSkeleton = () => (
    <div className="animate-pulse">
      <div className="aspect-[4/3] bg-gray-200 rounded-xl mb-4"></div>
      <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
  );

  return (
    <div className="bg-white min-h-screen font-sans">
      <PageHeader
        title="Projecten"
        subtitle="Inspiratie"
        description="Laat u inspireren door onze opgeleverde projecten en zie de mogelijkheden voor uw eigen tuin of pand."
      />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[...Array(6)].map((_, i) => (
              <ProjectSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-hett-muted mb-4">Er is een fout opgetreden bij het laden van de projecten.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="btn-primary"
            >
              Probeer opnieuw
            </button>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-hett-muted">Nog geen projecten beschikbaar.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {projects.map((project) => {
                const location = getLocation(project.tags);
                return (
                  <Link
                    key={project.id}
                    to={`/projecten/${project.handle}`}
                    className="group block"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-gray-100 mb-4">
                      <img
                        src={project.image?.url || getProjectPlaceholder()}
                        alt={project.image?.altText || project.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {project.tags.length > 0 && (
                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold text-hett-dark shadow-sm uppercase tracking-wider">
                          {project.tags.find(t => !t.startsWith('loc:')) || 'Project'}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg md:text-xl font-bold text-hett-dark mb-1 group-hover:text-hett-primary transition-colors line-clamp-2">
                        {project.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 text-gray-400 text-sm">
                        {location && (
                          <div className="flex items-center">
                            <MapPin size={14} className="mr-1.5" />
                            {location}
                          </div>
                        )}
                        <div className="flex items-center">
                          <Calendar size={14} className="mr-1.5" />
                          {formatDate(project.publishedAt)}
                        </div>
                      </div>
                      {project.excerpt && (
                        <p className="text-gray-500 text-sm mt-2 line-clamp-2">{project.excerpt}</p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>

            {hasMore && (
              <div className="text-center mt-12">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="btn-secondary px-8 py-3 inline-flex items-center gap-2"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Laden...
                    </>
                  ) : (
                    'Meer projecten laden'
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Projects;
