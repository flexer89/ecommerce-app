import React from 'react';
import '../assets/style/style.css';

const OurMission = () => {
  return (
    <div className="our-mission-container container">
      <h2 className="h2-large section-title">Nasza Misja</h2>
      <p className="our-mission-description">
        Nasza misja to dostarczanie produktów najwyższej jakości, wspierając jednocześnie zrównoważony rozwój i etyczne praktyki. Wierzymy, że każdy produkt, który oferujemy, powinien być nie tylko doskonały, ale także odpowiedzialny społecznie.
      </p>
      <div className="mission-section">
        <h3 className="mission-subtitle">Wspieranie Lokalnych Społeczności</h3>
        <p className="mission-description">
          Współpracujemy bezpośrednio z lokalnymi dostawcami, oferując im uczciwe warunki współpracy i inwestując w rozwój ich społeczności. Poprzez długoterminowe partnerstwa pomagamy poprawiać jakość życia w regionach, z których pochodzą nasze produkty.
        </p>
      </div>
      <div className="mission-section">
        <h3 className="mission-subtitle">Zrównoważona Produkcja</h3>
        <p className="mission-description">
          Stosujemy zrównoważone metody produkcji, które chronią środowisko i promują bioróżnorodność. Dbamy o efektywne wykorzystanie zasobów naturalnych, aby minimalizować nasz wpływ na planetę.
        </p>
      </div>
      <div className="mission-section">
        <h3 className="mission-subtitle">Edukacja Konsumentów</h3>
        <p className="mission-description">
          Uświadamiamy naszych klientów o pochodzeniu i procesie wytwarzania naszych produktów, aby mogli podejmować świadome decyzje. Organizujemy warsztaty i wydarzenia, aby dzielić się naszą wiedzą i pasją.
        </p>
      </div>
      <div className="mission-section">
        <h3 className="mission-subtitle">Etyczne Praktyki</h3>
        <p className="mission-description">
          Dbamy o to, aby każdy etap produkcji naszych produktów odbywał się zgodnie z najwyższymi standardami etycznymi. Nasze podejście obejmuje zarówno warunki pracy naszych partnerów, jak i transparentność łańcucha dostaw.
        </p>
      </div>
      <div className="mission-section">
        <h3 className="mission-subtitle">Inwestowanie w Projekty Społeczne</h3>
        <p className="mission-description">
          Część naszych zysków przeznaczamy na finansowanie projektów społecznych i środowiskowych, które wspierają lokalne społeczności i przyczyniają się do ochrony środowiska.
        </p>
      </div>
    </div>
  );
};

export default OurMission;
