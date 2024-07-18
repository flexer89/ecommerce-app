import React from 'react';
import '../assets/style/style.css';  // Adjust the path according to your project structure

const regulationsData = [
  {
    title: "Regulamin Ogólny",
    content: `
      <p>Witamy na naszej platformie. Korzystając z naszych usług, zgadzasz się przestrzegać następujących zasad:</p>
      <ol>
        <li><strong>Bezpieczeństwo Konta:</strong> Użytkownicy są odpowiedzialni za zachowanie poufności informacji o swoim koncie i hasle.</li>
        <li><strong>Zabronione Działania:</strong> Użytkownicy nie mogą angażować się w żadne nielegalne działania, nękanie ani działania naruszające prawa innych.</li>
        <li><strong>Własność Treści:</strong> Użytkownicy zachowują własność treści, które przesyłają, ale udzielają nam licencji na używanie, wyświetlanie i dystrybucję tych treści na naszej platformie.</li>
        <li><strong>Zmiana Regulaminu:</strong> Zastrzegamy sobie prawo do modyfikacji tego regulaminu w dowolnym momencie. Zmiany będą powiadamiane użytkownikom przez platformę.</li>
      </ol>
    `
  },
  {
    title: "Polityka Prywatności",
    content: `
      <p>Dbamy o Twoją prywatność. Niniejsza Polityka Prywatności wyjaśnia, jak przetwarzamy Twoje dane osobowe:</p>
      <ol>
        <li><strong>Zbieranie Informacji:</strong> Zbieramy dane osobowe, takie jak imię, adres e-mail i dane płatności, gdy rejestrujesz się i korzystasz z naszych usług.</li>
        <li><strong>Wykorzystanie Informacji:</strong> Wykorzystujemy Twoje dane, aby świadczyć i ulepszać nasze usługi, realizować transakcje i komunikować się z Tobą.</li>
        <li><strong>Udostępnianie Danych:</strong> Nie udostępniamy Twoich danych osobowych stronom trzecim bez Twojej zgody, chyba że jest to wymagane przez prawo lub w celu ochrony naszych praw.</li>
        <li><strong>Bezpieczeństwo Danych:</strong> Wdrażamy środki bezpieczeństwa, aby chronić Twoje dane przed nieautoryzowanym dostępem i ujawnieniem.</li>
        <li><strong>Cookies:</strong> Używamy plików cookie, aby poprawić Twoje doświadczenie w przeglądaniu naszej strony. Możesz zarządzać preferencjami cookie przez ustawienia przeglądarki.</li>
      </ol>
    `
  },
  {
    title: "Regulamin Świadczenia Usług",
    content: `
      <p>Korzystając z naszych usług, zgadzasz się na następujące warunki:</p>
      <ol>
        <li><strong>Akceptacja Warunków:</strong> Korzystając z naszej platformy, zgadzasz się przestrzegać niniejszego Regulaminu Świadczenia Usług.</li>
        <li><strong>Odpowiedzialność Użytkownika:</strong> Jesteś odpowiedzialny za korzystanie z usług i wszelkie treści, które dostarczasz, w tym zgodność z obowiązującym prawem.</li>
        <li><strong>Zakończenie Konta:</strong> Zastrzegamy sobie prawo do zamknięcia kont, które naruszają nasze warunki, polityki lub angażują się w zabronione działania.</li>
        <li><strong>Ograniczenie Odpowiedzialności:</strong> Nie ponosimy odpowiedzialności za jakiekolwiek szkody pośrednie, przypadkowe lub wynikowe wynikające z korzystania z naszych usług.</li>
      </ol>
    `
  },
  {
    title: "Polityka Cookies",
    content: `
      <p>Nasza strona internetowa używa plików cookie w celu poprawy Twojego doświadczenia. Niniejsza Polityka Cookies wyjaśnia, jak używamy plików cookie:</p>
      <ol>
        <li><strong>Czym są Cookies:</strong> Pliki cookie to małe pliki tekstowe przechowywane na Twoim urządzeniu przez Twoją przeglądarkę internetową.</li>
        <li><strong>Rodzaje Cookies:</strong> Używamy zarówno plików cookie sesyjnych (które wygasają po zamknięciu przeglądarki), jak i trwałych plików cookie (które pozostają na Twoim urządzeniu, dopóki ich nie usuniesz).</li>
        <li><strong>Cel Cookies:</strong> Pliki cookie pomagają nam zapamiętać Twoje preferencje, zrozumieć, jak korzystasz z naszej strony, i ulepszać nasze usługi.</li>
        <li><strong>Zarządzanie Cookies:</strong> Możesz kontrolować ustawienia plików cookie przez swoją przeglądarkę. Wyłączenie plików cookie może wpłynąć na funkcjonowanie niektórych funkcji naszej strony.</li>
        <li><strong>Cookies Stron Trzecich:</strong> Możemy pozwalać stronom trzecim na umieszczanie plików cookie na Twoim urządzeniu w celach analitycznych i reklamowych.</li>
      </ol>
    `
  },
  {
    title: "Płatności",
    content: `
      <p>Nasza polityka płatności określa procesy i warunki dotyczące płatności:</p>
      <ol>
        <li><strong>Metody Płatności:</strong> Akceptujemy różne metody płatności, w tym główne karty kredytowe i cyfrowe platformy płatnicze.</li>
        <li><strong>Przetwarzanie Płatności:</strong> Płatności są przetwarzane bezpiecznie przez naszą bramkę płatności. Twoje dane płatności są chronione.</li>
        <li><strong>Obciążanie:</strong> Zostaniesz obciążony za swoje zamówienie w momencie zakupu.</li>
        <li><strong>Zwroty:</strong> Wszystkie sprzedaże są ostateczne. Zwroty są wydawane tylko w przypadku wadliwych produktów lub usług nieświadczonych zgodnie z opisem.</li>
        <li><strong>Spory:</strong> W przypadku jakichkolwiek problemów z płatnością prosimy o kontakt. Postaramy się szybko rozwiązać wszelkie spory.</li>
      </ol>
    `
  }
];

const RegulationsComponent = () => {
  return (
    <div className="regulations-container">
      <h1>Regulamin</h1>
      {regulationsData.map((regulation, index) => (
        <div key={index} className="regulation-item">
          <h2>{regulation.title}</h2>
          <div dangerouslySetInnerHTML={{ __html: regulation.content }} />
        </div>
      ))}
    </div>
  );
};

export default RegulationsComponent;
