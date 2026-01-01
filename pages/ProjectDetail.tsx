import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { PROJECTS } from '../constants';
import { ArrowLeft, MapPin, Calendar, ArrowRight } from 'lucide-react';

const ProjectDetail: React.FC = () => {
    const { id } = useParams();
    const project = PROJECTS.find(p => p.id === id) || PROJECTS[0];

    return (
        <div className="bg-white min-h-screen pt-24 pb-20">

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
                <Link to="/projecten" className="text-gray-500 hover:text-hett-dark flex items-center gap-1 text-sm mb-6">
                    <ArrowLeft size={16} /> Terug naar projecten
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* Left Content */}
                    <div className="lg:col-span-8">
                        <div className="relative h-[400px] lg:h-[500px] rounded-xl overflow-hidden mb-6 shadow-lg">
                            <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover" />
                        </div>

                        {/* Extra Gallery Images */}
                        {project.images && project.images.length > 1 && (
                            <div className="grid grid-cols-3 gap-4 mb-8">
                                {project.images.slice(1).map((img, idx) => (
                                    <div key={idx} className="h-32 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity">
                                        <img src={img} alt={`Detail ${idx}`} className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        )}

                        <h1 className="text-3xl lg:text-4xl font-bold text-hett-dark mb-4">{project.title}</h1>

                        <div className="flex flex-wrap gap-6 text-sm text-gray-500 mb-8 border-b border-gray-100 pb-8">
                            {project.location && (
                                <div className="flex items-center gap-2">
                                    <MapPin size={18} /> {project.location}
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <Calendar size={18} /> Opgeleverd: 2024
                            </div>
                            <span className="bg-slate-100 px-3 py-0.5 rounded text-hett-dark font-medium">
                                {project.category}
                            </span>
                        </div>

                        <div className="prose prose-slate max-w-none text-gray-600">
                            <h3 className="text-xl font-bold text-hett-dark mb-3">Projectomschrijving</h3>
                            <p className="leading-relaxed mb-6">
                                {project.description} Dit project demonstreert de veelzijdigheid van HETT sandwichpanelen.
                                Door de combinatie van hoge isolatiewaardes en een strakke afwerking is een comfortabele buitenruimte gecreëerd
                                die naadloos aansluit bij de bestaande bouw.
                            </p>
                            <p>
                                De montage is uitgevoerd met oog voor detail, waarbij gebruik is gemaakt van onze bijpassende zetwerk profielen
                                voor een waterdichte en esthetische afwerking.
                            </p>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-4">
                        <div className="bg-slate-50 p-8 rounded-xl border border-slate-100 sticky top-28">
                            <h3 className="text-xl font-bold text-hett-dark mb-6">Gebruikte Materialen</h3>

                            <div className="space-y-4 mb-8">
                                <p className="text-gray-500 text-sm">Bekijk onze shop voor vergelijkbare producten.</p>
                            </div>

                            <div className="space-y-4">
                                <h4 className="font-bold text-hett-dark">Interesse in dit project?</h4>
                                <p className="text-sm text-gray-600">
                                    Wilt u een soortgelijke veranda of tuinkamer realiseren? Vraag een offerte aan voor de benodigde materialen.
                                </p>
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
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectDetail;