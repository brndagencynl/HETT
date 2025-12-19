import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import PageHeader from '../components/PageHeader';

const projects = [
  {
    id: 1,
    slug: 'moderne-tuinkamer-zwolle',
    title: 'Moderne Tuinkamer met Glasschuifwanden',
    location: 'Zwolle, Overijssel',
    image: '/assets/projects/project1.jpg'
  },
  {
    id: 2,
    slug: 'luxe-veranda-arnhem',
    title: 'Luxe Veranda met Geïntegreerde LED',
    location: 'Arnhem, Gelderland',
    image: '/assets/projects/project2.jpg'
  },
  {
    id: 3,
    slug: 'carport-op-maat-utrecht',
    title: 'Aluminium Carport op Maat',
    location: 'Utrecht',
    image: '/assets/projects/project3.jpg'
  },
  {
    id: 4,
    slug: 'strakke-overkapping-breda',
    title: 'Strakke Overkapping met Zijwanden',
    location: 'Breda, Noord-Brabant',
    image: '/assets/projects/project4.jpg'
  },
  {
    id: 5,
    slug: 'bedrijfshal-sandwichpanelen-deventer',
    title: 'Bedrijfshal met HETT Sandwichpanelen',
    location: 'Deventer, Overijssel',
    image: '/assets/projects/project5.jpg'
  },
  {
    id: 6,
    slug: 'glazen-schuifwanden-enkhuizen',
    title: 'Glazen Schuifwanden voor Veranda',
    location: 'Enkhuizen, Noord-Holland',
    image: '/assets/projects/project6.jpg'
  }
];

const Projects: React.FC = () => {
  return (
    <div className="bg-white min-h-screen font-sans">
      <PageHeader
        title="Projecten"
        subtitle="Inspiratie"
        description="Laat u inspireren door onze opgeleverde projecten en zie de mogelijkheden voor uw eigen tuin of pand."
      />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {projects.map((project) => (
            <Link
              key={project.id}
              to={`/projecten/${project.slug}`}
              className="group block"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-gray-100 mb-4">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-bold text-hett-dark mb-1 group-hover:text-hett-primary transition-colors">
                  {project.title}
                </h3>
                {project.location && (
                  <div className="flex items-center text-gray-400 text-sm">
                    <MapPin size={14} className="mr-1.5" />
                    {project.location}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Projects;
