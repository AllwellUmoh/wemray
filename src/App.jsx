import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from './components/layout/Layout';
import About from './pages/About';
import Academy from './pages/Academy';
import Contact from './pages/Contact';
import Home from './pages/Home';
import Legal from './pages/Legal';
import NotFound from './pages/NotFound';
import Portfolio from './pages/Portfolio';
import ServiceDetail from './pages/ServiceDetail';
import Services from './pages/Services';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="services" element={<Services />} />
          <Route path="services/:slug" element={<ServiceDetail />} />
          <Route path="portfolio" element={<Portfolio />} />
          <Route path="academy" element={<Academy />} />
          <Route path="contact" element={<Contact />} />
          <Route path="privacy" element={<Legal kind="privacy" />} />
          <Route path="terms" element={<Legal kind="terms" />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
