import React from 'react';
import { HashRouter, Routes, Route, useLocation, Navigate, useParams } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import TawkTo from './src/components/TawkTo';

import Configurator from './pages/Configurator';
import Projects from './pages/Projects';
import ProjectDetailPage from './pages/ProjectDetail';
import Contact from './pages/Contact';
import Documents from './pages/Documents';
import About from './pages/About';
import FAQ from './pages/FAQ';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Cookies from './pages/Cookies';
import ScrollToTopButton from './components/ScrollToTopButton';
import PageTransition from './components/PageTransition';

// New Pages
import Delivery from './pages/Delivery';
import PaymentMethods from './pages/PaymentMethods';
import Pickup from './pages/Pickup';
import Warranty from './pages/Warranty';
import Returns from './pages/Returns';
import DeliveryTerms from './pages/DeliveryTerms';
import Mounting from './pages/Mounting';
import Showroom from './pages/Showroom';
import ShowroomAppointment from './src/pages/ShowroomAppointment';

// New Shop Pages
import Shop from './pages/Shop';
import Category from './pages/Category';
import ProductDetailShop from './pages/ProductDetailShop';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import MyAccount from './pages/MyAccount';
import OrderReceived from './pages/OrderReceived';
import ThankYou from './pages/ThankYou';
import Search from './pages/Search';
import Quote from './pages/Quote';
import Wishlist from './pages/Wishlist';
import CartDrawer from './components/ui/CartDrawer';

const SANDWICHPANELEN_CANONICAL_URL = '/products/sandwichpaneel';
const SANDWICHPANELEN_HANDLE = 'sandwichpaneel'; // Shopify product handle

// Shopify Blog & Page Routes
import Blog from './pages/Blog';
import BlogDetail from './pages/BlogDetail';
import Page from './pages/Page';

// Maatwerk Configurator
import MaatwerkConfiguratorPage from './pages/MaatwerkConfigurator';

// Shopify Test
import ShopifyTest from './pages/ShopifyTest';

// ScrollToTop helper
const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Legacy product route redirect helper
const ProductRedirect = () => {
  const { id } = useParams();
  return <Navigate to={`/products/${id}`} replace />;
};

// Legacy nieuws route redirect helper (preserves article handle)
const NieuwsRedirect = () => {
  const { id } = useParams();
  return <Navigate to={`/blog/${id}`} replace />;
};

const AnimatedRoutes: React.FC = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />

        {/* Sandwichpanelen (single product) - canonical URL: /products/sandwichpaneel */}
        <Route path="/sandwichpanelen" element={<Navigate to={SANDWICHPANELEN_CANONICAL_URL} replace />} />
        <Route path="/categorie/sandwichpanelen" element={<Navigate to={SANDWICHPANELEN_CANONICAL_URL} replace />} />
        <Route path="/sandwichpanelen/isopar-plus-lambris" element={<Navigate to={SANDWICHPANELEN_CANONICAL_URL} replace />} />
        <Route
          path={SANDWICHPANELEN_CANONICAL_URL}
          element={
            <PageTransition>
              <ProductDetailShop productHandle={SANDWICHPANELEN_HANDLE} />
            </PageTransition>
          }
        />

        {/* Shop Routes */}
        <Route path="/shop" element={<PageTransition><Shop /></PageTransition>} />
        <Route path="/categorie/:categorySlug" element={<PageTransition><Category /></PageTransition>} />
        <Route path="/products/:handle" element={<PageTransition><ProductDetailShop /></PageTransition>} />
        {/* Legacy route redirect */}
        <Route path="/product/:id" element={<ProductRedirect />} />
        <Route path="/cart" element={<PageTransition><Cart /></PageTransition>} />
        <Route path="/afrekenen" element={<PageTransition><Checkout /></PageTransition>} />
        <Route path="/my-account" element={<PageTransition><MyAccount /></PageTransition>} />
        <Route path="/order-received" element={<PageTransition><OrderReceived /></PageTransition>} />
        <Route path="/bedankt" element={<PageTransition><ThankYou /></PageTransition>} />
        <Route path="/search" element={<PageTransition><Search /></PageTransition>} />
        <Route path="/offerte" element={<PageTransition><Quote /></PageTransition>} />
        <Route path="/wishlist" element={<PageTransition><Wishlist /></PageTransition>} />

        {/* Maatwerk Configurator */}
        <Route path="/maatwerk-configurator" element={<PageTransition><MaatwerkConfiguratorPage /></PageTransition>} />

        {/* Shopify Test */}
        <Route path="/shopify-test" element={<ShopifyTest />} />

        {/* Information Pages */}
        <Route path="/bezorging" element={<PageTransition><Delivery /></PageTransition>} />
        <Route path="/betaalmethoden" element={<PageTransition><PaymentMethods /></PageTransition>} />
        <Route path="/montage-handleiding" element={<PageTransition><Mounting /></PageTransition>} />
        <Route path="/afhalen" element={<PageTransition><Pickup /></PageTransition>} />
        <Route path="/garantie-en-klachten" element={<PageTransition><Warranty /></PageTransition>} />
        <Route path="/retourneren" element={<PageTransition><Returns /></PageTransition>} />
        <Route path="/leveringsvoorwaarden" element={<PageTransition><DeliveryTerms /></PageTransition>} />
        <Route path="/showroom" element={<PageTransition><Showroom /></PageTransition>} />
        <Route path="/showroom-afspraak" element={<PageTransition><ShowroomAppointment /></PageTransition>} />

        {/* Blog Routes (Shopify) */}
        <Route path="/blog" element={<PageTransition><Blog /></PageTransition>} />
        <Route path="/blog/:handle" element={<PageTransition><BlogDetail /></PageTransition>} />
        
        {/* Generic Shopify Page Route */}
        <Route path="/pagina/:handle" element={<PageTransition><Page /></PageTransition>} />

        {/* Legacy Blog Redirects (WordPress → Shopify) */}
        <Route path="/blogs" element={<Navigate to="/blog" replace />} />
        <Route path="/nieuws" element={<Navigate to="/blog" replace />} />
        <Route path="/nieuws/:id" element={<NieuwsRedirect />} />

        {/* Legacy/Other Routes */}
        {/* Redirect Legacy Routes */}
        <Route path="/producten" element={<Navigate to="/shop" replace />} />
        <Route path="/producten/:id" element={<ProductRedirect />} />
        <Route path="/configurator" element={<PageTransition><Configurator /></PageTransition>} />
        <Route path="/projecten" element={<PageTransition><Projects /></PageTransition>} />
        <Route path="/projecten/:handle" element={<PageTransition><ProjectDetailPage /></PageTransition>} />
        <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
        <Route path="/downloads" element={<PageTransition><Documents /></PageTransition>} />
        <Route path="/over-ons" element={<PageTransition><About /></PageTransition>} />
        <Route path="/veelgestelde-vragen" element={<PageTransition><FAQ /></PageTransition>} />
        <Route path="/algemene-voorwaarden" element={<PageTransition><Terms /></PageTransition>} />
        <Route path="/privacy" element={<PageTransition><Privacy /></PageTransition>} />
        <Route path="/cookies" element={<PageTransition><Cookies /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <TawkTo />
      <div className="flex flex-col min-h-screen bg-[#f6f8fa] font-sans text-hett-primary relative">
        <ScrollToTop />
        <Navbar />
        <main className="flex-grow">
          <AnimatedRoutes />
        </main>
        <CartDrawer />
        <Footer />
        <ScrollToTopButton />
      </div>
    </HashRouter>
  );
};

export default App;
