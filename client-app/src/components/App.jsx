import React from 'react';
import Header from './Header';
import Hero from './Hero';
import Collection from './Collection';
import Shop from './Shop';
import Banner from './Banner';
import Feature from './Feature';
import Offer from './Offer';
import Blog from './Blog';
import Footer from './Footer';

const App = () => (
  <div>
    <Header />
    <main>
      <Hero />
      <Collection />
      <Shop />
      <Banner />
      <Feature />
      <Offer />
      <Blog />
    </main>
    <Footer />
  </div>
);

export default App;
