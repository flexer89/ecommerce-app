import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './Header';
import Hero from './Hero';
import Collection from './Collection';
import Shop from './Shop';
import Banner from './Banner';
import Feature from './Feature';
import AboutUs from './AboutUs';
import Footer from './Footer';
import ProductPageComponent from './ProductPageComponent';
import ProductListPage from './ProductListPage'; // Add this import
import BackToTop from './BackToTop';
import { CartProvider } from '../contexts/CartContext';

const HomePage = () => (
  <div>
    <Header />
    <main>
      <Hero />
      <Collection />
      <Shop />
      <Banner />
      <Feature />
      <AboutUs />
    </main>
    <Footer />
  </div>
);

const ProductPage = () => (
  <div>
    <Header />
    <ProductPageComponent />
    <Footer />
  </div>
);

const ProductPageList = () => (
  <div>
    <Header />
    <ProductListPage />
    <Footer />
  </div>
);

const AboutUsPage = () => (
  <div>
    <Header />
    <AboutUs />
    <Feature />
    <Footer />
  </div>
);

const BestsellerPage = () => (
  <div>
    <Header />
    <Shop />
    <Footer />
  </div>
);

const App = () => (
  <CartProvider>
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/products" element={<ProductPageList />} />
          <Route path="/about" element={<AboutUsPage />} />
          <Route path="/bestsellers" element={<BestsellerPage />} />
        </Routes>
        <BackToTop />
      </div>
    </Router>
  </CartProvider>
);

export default App;
