import { React, useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
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
import ProductListPage from './ProductListPage';
import RegulationsComponent from './RegulationsComponent';
import FAQComponent from './FAQComponent';
import OurMission from './OurMission';
import BackToTop from './BackToTop';
import CartPage from './CartPage';
import UserProfilePage from './UserProfilePage';
import LoginOrRegisterPage from '../pages/LoginOrRegisterPage';
import CheckoutPage from '../pages/CheckoutPage';
import ForbiddenComponent from "./ForbiddenComponent";
import ProceedPaymentPage from "../pages/ProceedPaymentPage";
import OrderConfirmationPage from '../pages/OrderConfirmationPage';
import { CartProvider } from '../contexts/CartContext';
import { KeycloakAuthProvider, useKeycloakAuth } from '../contexts/KeycloakContext';
import NotFoundComponent from "./NotFoundComponent";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_API_KEY);

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

const ProfilePage = () => (
  <div>
    <Header />
    <UserProfilePage />
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

const ViewCartPage = () => (
  <div>
    <Header />
    <CartPage />
    <Footer />
  </div>
);

const ContinueShoppingPage = () => (
  <div>
    <Header />
    <LoginOrRegisterPage />
    <Footer />
  </div>
);

const ProceedCheckoutPage = () => (
  <div>
    <Header />
    <CheckoutPage />
    <Footer />
  </div>
);


const OrderConfirmation = () => (
  <div>
    <Header />
    <OrderConfirmationPage />
    <Footer />
  </div>
);

const RegulationsPage = () => (
  <div>
    <Header />
    <RegulationsComponent />
    <Footer />
  </div>
);

const FAQPage = () => (
  <div>
    <Header />
    <FAQComponent />
    <Footer />
  </div>
);

const NotFoundPage = () => (
  <div>
    <Header />
    <NotFoundComponent />
    <Footer />
  </div>
);

const ForbiddenPage = () => (
  <div>
    <Header />
    <ForbiddenComponent />
    <Footer />
  </div>
);

const OurMissionPage = () => (
  <div>
    <Header />
    <OurMission />
    <Footer />
  </div>
);

const App = () => {
  return (
    <KeycloakAuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/products" element={<ProductPageList />} />
            <Route path="/about" element={<AboutUsPage />} />
            <Route path="/bestsellers" element={<BestsellerPage />} />
            <Route path="/cart" element={<ViewCartPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/login-or-register" element={<ContinueShoppingPage />} />
            <Route path="/checkout" element={<ProceedCheckoutPage />} />
            <Route
              path="/payment"
              element={
                <Elements stripe={stripePromise}>
                  <ProceedPaymentPage />
                </Elements>
              }
            />
            <Route path="/order-confirmation" element={<OrderConfirmation />} />
            <Route path="/regulations" element={<RegulationsPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/our-mission" element={<OurMissionPage />} />
            <Route path="/forbidden" element={<ForbiddenPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          <BackToTop />
        </Router>
      </CartProvider>
    </KeycloakAuthProvider>
  );
}

export default App;
