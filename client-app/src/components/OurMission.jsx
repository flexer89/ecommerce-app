import React from 'react';
import '../assets/style/style.css';

const OurMission = () => {
  return (
    <div className="our-mission-container container">
      <h2 className="h2-large section-title">Nasza Misja</h2>
      <p className="our-mission-description">
        Nasza misja to dostarczenie najwyższej jakości kawy, jednocześnie wspierając zrównoważony rozwój i etyczne praktyki. Wierzymy, że każda filiżanka kawy powinna być nie tylko smaczna, ale także odpowiedzialna społecznie.
      </p>
      <div className="mission-section">
        <h3 className="mission-subtitle">Wspieranie Lokalnych Społeczności</h3>
        <p className="mission-description">
          Pracujemy bezpośrednio z lokalnymi rolnikami, zapewniając im uczciwe ceny za ich plony i inwestując w rozwój ich społeczności.
          Poprzez długoterminowe partnerstwa pomagamy poprawiać jakość życia w regionach produkujących kawę.
        </p>
      </div>
      <div className="mission-section">
        <h3 className="mission-subtitle">Zrównoważona Produkcja</h3>
        <p className="mission-description">
          Stosujemy zrównoważone metody uprawy, które chronią środowisko i promują bioróżnorodność.
          Używamy technik organicznych i dbamy o zachowanie zdrowia gleby oraz oszczędzanie wody.
        </p>
      </div>
      <div className="mission-section">
        <h3 className="mission-subtitle">Edukacja Konsumentów</h3>
        <p className="mission-description">
          Uświadamiamy naszych klientów o pochodzeniu i procesie produkcji kawy, aby mogli podejmować świadome decyzje.
          Organizujemy warsztaty i degustacje, aby dzielić się wiedzą o kawie.
        </p>
      </div>
      <div className="mission-section">
        <h3 className="mission-subtitle">Etyczne Praktyki</h3>
        <p className="mission-description">
          Dbamy o to, aby każdy etap produkcji kawy odbywał się zgodnie z najwyższymi standardami etycznymi.
          Nasze podejście obejmuje zarówno warunki pracy rolników, jak i transparentność łańcucha dostaw.
        </p>
      </div>
      <div className="mission-section">
        <h3 className="mission-subtitle">Inwestowanie w Projekty Społeczne</h3>
        <p className="mission-description">
          Część naszych zysków przeznaczamy na finansowanie projektów społecznych i środowiskowych, które wspierają lokalne społeczności kawowe i przyczyniają się do ochrony środowiska.
        </p>
      </div>
    </div>
  );
};

export default OurMission;
