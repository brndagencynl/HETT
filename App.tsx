import React from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Dealers from './pages/Dealers';
import Configurator from './pages/Configurator';
import Projects from './pages/Projects';
import ProjectDetailPage from './pages/ProjectDetail';
import Contact from './pages/Contact';
import Documents from './pages/Documents';
import About from './pages/About';
import FAQ from './pages/FAQ';
import News from './pages/News';
import NewsDetail from './pages/NewsDetail';
import ScrollToTopButton from './components/ScrollToTopButton';
import PageTransition from './components/PageTransition';

// ScrollToTop helper
const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const AnimatedRoutes: React.FC = () => {
    const location = useLocation();
    
    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                <Route path="/" element={<PageTransition><Home /></PageTransition>} />
                <Route path="/producten" element={<PageTransition><Products /></PageTransition>} />
                <Route path="/producten/:id" element={<PageTransition><ProductDetail /></PageTransition>} />
                <Route path="/configurator" element={<PageTransition><Configurator /></PageTransition>} />
                <Route path="/toepassingen" element={<PageTransition><Projects /></PageTransition>} />
                <Route path="/projecten" element={<PageTransition><Projects /></PageTransition>} />
                <Route path="/projecten/:id" element={<PageTransition><ProjectDetailPage /></PageTransition>} />
                <Route path="/dealers" element={<PageTransition><Dealers /></PageTransition>} />
                <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
                <Route path="/downloads" element={<PageTransition><Documents /></PageTransition>} />
                <Route path="/over-ons" element={<PageTransition><About /></PageTransition>} />
                <Route path="/veelgestelde-vragen" element={<PageTransition><FAQ /></PageTransition>} />
                <Route path="/nieuws" element={<PageTransition><News /></PageTransition>} />
                <Route path="/nieuws/:id" element={<PageTransition><NewsDetail /></PageTransition>} />
            </Routes>
        </AnimatePresence>
    );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="flex flex-col min-h-screen bg-[#f6f8fa] font-sans text-slate-900 relative">
        <ScrollToTop />
        <Navbar />
        <main className="flex-grow">
           <AnimatedRoutes />
        </main>
        <Footer />
        <ScrollToTopButton />
      </div>
    </HashRouter>
  );
};

export default App;