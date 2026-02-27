import React from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PROJECTS, NEWS_ITEMS } from '../constants';

interface Breadcrumb {
  label: string;
  path: string;
  isLast?: boolean;
}

const PageHeader: React.FC<any> = () => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const params = useParams();

  // If we are on the Home page, normally breadcrumbs are not shown or just show "Thuis"
  // However, the instructions say "overal", so we provide them.
  if (pathname === '/') return null;

  const generateBreadcrumbs = (): Breadcrumb[] => {
    const crumbs: Breadcrumb[] = [{ label: t('nav.home'), path: '/' }];
    const segments = pathname.split('/').filter(Boolean);

    let currentPath = '';

    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === segments.length - 1;
      let label = segment;

      // Logic to map path segments to readable labels
      if (segment === 'categorie') return; // Skip "categorie" segment as we want Categorieën > [Name]
      if (segment === 'products') return; // Skip "products" segment
      
      if (pathname.includes('/categorie/') && index === segments.length - 1) {
          crumbs.push({ label: t('nav.categories'), path: '/shop' });
          label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
      } else if (pathname.includes('/products/') && isLast) {
          // For product pages, prettify the handle for breadcrumb display
          // e.g., "sandwichpaneel" -> "Sandwichpaneel"
          label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
      } else if (pathname.includes('/projecten/') && isLast) {
          crumbs.push({ label: t('nav.projects'), path: '/projecten' });
          const project = PROJECTS.find(p => p.id === segment);
          label = project ? project.title : segment;
      } else if (pathname.includes('/nieuws/') && isLast) {
          crumbs.push({ label: t('nav.news'), path: '/blogs' });
          const news = NEWS_ITEMS.find(n => n.id === segment);
          label = news ? news.title : segment;
      } else {
          // General mapping
          const mapping: Record<string, string> = {
            'shop': t('shop.title'),
            'cart': t('cart.title'),
            'checkout': t('checkout.title'),
            'my-account': t('nav.myAccount'),
            'wishlist': t('nav.favorites'),
            'projecten': t('nav.projects'),
            'contact': t('nav.contact'),
            'over-ons': t('about.subtitle'),
            'veelgestelde-vragen': t('faq.title'),
            'blogs': t('nav.news'),
            'showroom': t('nav.showroom'),
            'offerte': t('offerte.title'),
            'bezorging': t('delivery.title'),
            'montage-handleiding': t('nav.montage')
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