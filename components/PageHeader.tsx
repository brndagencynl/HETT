import React from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { PRODUCTS, PROJECTS, NEWS_ITEMS } from '../constants';

interface Breadcrumb {
  label: string;
  path: string;
  isLast?: boolean;
}

const PageHeader: React.FC<any> = () => {
  const { pathname } = useLocation();
  const params = useParams();

  // If we are on the Home page, normally breadcrumbs are not shown or just show "Thuis"
  // However, the instructions say "overal", so we provide them.
  if (pathname === '/') return null;

  const generateBreadcrumbs = (): Breadcrumb[] => {
    const crumbs: Breadcrumb[] = [{ label: 'Thuis', path: '/' }];
    const segments = pathname.split('/').filter(Boolean);

    let currentPath = '';

    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === segments.length - 1;
      let label = segment;

      // Logic to map path segments to readable labels
      if (segment === 'categorie') return; // Skip "categorie" segment as we want Categorieën > [Name]
      
      if (pathname.includes('/categorie/') && index === segments.length - 1) {
          crumbs.push({ label: 'Categorieën', path: '/shop' });
          label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
      } else if (pathname.includes('/product/') && isLast) {
          const product = PRODUCTS.find(p => p.id === segment);
          if (product) {
              crumbs.push({ label: product.category, path: `/categorie/${product.category.toLowerCase()}` });
              label = product.title;
          }
      } else if (pathname.includes('/projecten/') && isLast) {
          crumbs.push({ label: 'Projecten', path: '/projecten' });
          const project = PROJECTS.find(p => p.id === segment);
          label = project ? project.title : segment;
      } else if (pathname.includes('/nieuws/') && isLast) {
          crumbs.push({ label: 'Nieuws', path: '/blogs' });
          const news = NEWS_ITEMS.find(n => n.id === segment);
          label = news ? news.title : segment;
      } else {
          // General mapping
          const mapping: Record<string, string> = {
            'shop': 'Shop',
            'cart': 'Winkelwagen',
            'checkout': 'Afrekenen',
            'my-account': 'Mijn Account',
            'wishlist': 'Favorieten',
            'projecten': 'Projecten',
            'contact': 'Contact',
            'over-ons': 'Over ons',
            'veelgestelde-vragen': 'Veelgestelde vragen',
            'blogs': 'Nieuws',
            'showroom': 'Showroom',
            'offerte': 'Offerte aanvragen',
            'bezorging': 'Bezorging',
            'montage-handleiding': 'Montage'
          };
          label = mapping[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
      }

      crumbs.push({ label, path: currentPath, isLast });
    });

    // Deduplicate if needed (e.g. if category logic added duplicates)
    return crumbs.reduce((acc: Breadcrumb[], current) => {
        const x = acc.find(item => item.path === current.path);
        if (!x) return acc.concat([current]);
        else return acc;
    }, []);
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <div className="hett-breadcrumbbar">
      <div className="hett-container">
        <nav className="hett-breadcrumbs" aria-label="Breadcrumb">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={crumb.path}>
              {idx > 0 && <span className="separator"> &gt; </span>}
              {crumb.isLast ? (
                <span className="font-bold text-hett-dark truncate max-w-[200px] md:max-w-none block">{crumb.label}</span>
              ) : (
                <Link to={crumb.path}>{crumb.label}</Link>
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default PageHeader;