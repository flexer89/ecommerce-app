import React, { useState } from 'react';
import '../assets/style/style.css';  // Adjust the path according to your project structure

const faqData = [
  {
    question: "Jak mogę zarejestrować konto?",
    answer: "Aby zarejestrować konto, kliknij ikonę logowania na stronie głównej, wypełnij wymagane informacje i postępuj zgodnie z instrukcjami."
  },
  {
    question: "Jak mogę skontaktować się z obsługą klienta?",
    answer: "Możesz skontaktować się z naszą obsługą klienta, wysyłając e-mail na adres jolszak@jolszak.test lub dzwoniąc pod numer +48 123 456 789."
  },
  {
    question: "Jak mogę złożyć zamówienie?",
    answer: "Aby złożyć zamówienie, wybierz produkty, które chcesz kupić, dodaj je do koszyka i postępuj zgodnie z instrukcjami na stronie zamówienia."
  },
  {
    question: "Czy mogę śledzić moje zamówienie?",
    answer: "Tak, możesz śledzić swoje zamówienie logując się na swoje konto i przechodząc do sekcji 'Moje Zamówienia' w zakładce moje konto."
  },
  {
    question: "Jakie są opcje dostawy?",
    answer: "Oferujemy różne opcje dostawy, w tym standardową przesyłkę kurierską, paczkomat i odbiór osobisty. Wybierz odpowiednią opcję podczas składania zamówienia."
  },
  {
    question: "Czy mogę zmienić adres dostawy po złożeniu zamówienia?",
    answer: "Tak, możesz zmienić adres dostawy przed wysłaniem zamówienia. Skontaktuj się z obsługą klienta, aby dokonać zmiany."
  },
  {
    question: "Jak mogę anulować zamówienie?",
    answer: "Aby anulować zamówienie, skontaktuj się z obsługą klienta jak najszybciej. Jeśli zamówienie nie zostało jeszcze wysłane, będziemy mogli je anulować."
  },
  {
    question: "Czy mogę zwrócić produkt?",
    answer: "Tak, akceptujemy zwroty w ciągu 30 dni od daty zakupu. Produkt musi być w oryginalnym stanie i opakowaniu. Skontaktuj się z obsługą klienta, aby zorganizować zwrot."
  }
];

const FAQComponent = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const handleToggle = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="faq-container">
      <h1>Najczęściej Zadawane Pytania</h1>
      {faqData.map((item, index) => (
        <div key={index} className="faq-item">
          <div className="faq-question" onClick={() => handleToggle(index)}>
            <h2>{item.question}</h2>
          </div>
          {activeIndex === index && (
            <div className="faq-answer">
              <p>{item.answer}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default FAQComponent;
