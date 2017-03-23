---
title: Pierwszy mock
layout: post
comments: true
tags: 
category: daj-sie-poznac
description: Zaczynając pracę nad jakimś projektem, często dobrze jest zrobić najpierw jakieś mocki, zaimplementować widoki bez logiki pod spodem, żeby na pierwszy rzut oka było widać, co dana aplikacja ma robić, i żeby już na początku można było sobie poklikać. W kolejnym kroku pracy nad <a href="https://github.com/withspace/serverless-webapp-starter">starterem</a> przygotowałem właśnie coś takiego.
---

W praktyce całkiem często korzystam z takiego podejścia.
Implementuję kawałek interfejsu, pokazuję klientowi i dzięki temu dostaję szybki _feedback_.
Łatwo oczywiście wpaść w pułapkę, zamockować za dużo i potem dużo zmieniać, ale małymi kroczkami takie podejście świetnie się sprawdza.

Rejestracja i logowanie użytkownika to takie funkcjonalności, które są raczej standardowe, podobne w wielu systemach.
Są pewne pułapki, na przykład z mailem rejestracyjnym -- czy można się zalogować jeśli konto jest niepotwierdzone?
Kiedy pierwszy raz stosowałem Cognito w projekcie wpadłem właśnie w tę pułapkę i założyłem, że można, a potem musiałem przerabiać proces.

Teraz co prawda mam już to przećwiczone i znam proces rejestracji i logowania w Amazon Cognito, jednak ciągle nie znam jeszcze narzędzi, z których będę budować interfejs (budowania komponentów w Material-UI i React Routera).
Tym samym nie wiem, na ile będzie to pracochłonne.
Dlatego pierwsze mocki i pierwszy przepływ ograniczę do minimum.


## Pierwszy przepływ

![starter-initial-mock](/assets/img/posts/starter-initial-mock.gif)

Na menu nawigacji u górze znajduje się przycisk, pozwalający się zalogować.
Ponieważ nie implementuję pod spodem żadnej logiki biznesowej i nie łączę się jeszcze z Amazon Cognito, kliknięcie na ten przycisk od razu powoduje zalogowanie się do aplikacji.
Po zalogowaniu się zamiast przycisku `SIGN IN` pojawia się menu, na którym można wybrać wylogowanie się z aplikacji, albo przejść do profilu.

Tyle na początek, więcej na razie nie trzeba.
Co tam siedzi pod spodem?
Kilka komponentów, które mają już jakiś stan + React Router.


## React Router

W świecie _Single Page Applications_, czy to w Angularze, Vue, czy React, funkcjonuje coś takiego jak router.
Router, czyli taka biblioteka, która w zależności od URLa pokazuje odpowiedni komponent i przekazuje mu odpowiednie parametry.
Mam właśnie zaszczyt spróbować routera dla Reacta i to w dodatku w najnowszej wersji: `4.0.0`.
Jednak z uwagi na ciągłą ewolucję Routera dla Reacta, znaczna część materiałów, na którą natknąłem się w sieci była już przestarzała.
Najwięcej w sumie skorzystałem na oficjalnej dokumentacji, którą znalazłem [tutaj](https://reacttraining.com/react-router/web/guides/quick-start).

Tak naprawdę na początku w starterze dostępne są jedynie dwie ścieżki: `/` oraz `/profile`.
Główna ścieżka obsługiwana jest przez komponent `Home`, natomiast `/profile` przez komponent `Profile`.
Konfiguracja tego w React jest bardzo przejrzysta.
Wszystkie ścieżki zdefiniowane są w tej chwili w funkcji:

Cały plik `routes.js` wygląda u mnie w tej chwili tak:

```javascript
const Routes = () => (
  <div>
    <Route exact path="/" component={Home}/>
    <Route path="/profile" component={Profile}/>
  </div>
);
```

Uwaga, w tym momencie nie zastrzegam ścieżki do `/profile` tylko dla zalogowanych użytkowników.
Trzeba to będzie robić później, na razie kontekst tego, czy użytkownik jest zalogowany trzymam dość nisko w hierarchii komponentów i pewnie w przyszłości będę go musiał przenieść wyżej.
Na razie po prostu menu z pozycją `Profile` jest niewidoczne dla niezalogowanych użytkowników.

Czyli stworzyłem osobny komponent na wszystkie ścieżki i dla zachowania czytelności trzymam go w osobnym pliku.
W samej aplikacji będę musiał wstawić `<Routes />` wewnątrz któregoś z komponentów reprezentujących router w React (jest kilka różnych takich nadrzędnych komponentów do wyboru). 
Zrobiłem to w komponencie `App`, reprezentującym całą aplikację:

```javascript
import {BrowserRouter as Router} from "react-router-dom";
...

const App = () => (
  <MuiThemeProvider>
    <Router>
      <div>
        <Header/>
        <Routes/>
      </div>
    </Router>
  </MuiThemeProvider>
);
```

W tym przykładzie `MuiThemeProvider` to jest komponent, wewnątrz którego mogę stosować komponenty z Material-UI, natomiast `Header` to jest zdefiniowany przeze mnie komponent, definiujący to niebieskie menu na górze strony.

`Router` (tutaj w zasadzie `BrowserRouter`), zdefiniowany jest dość wysoko w hierarchii komponentów, a linki do ścieżek muszą być wewnątrz tego komponentu (są w `Header`).
Jest to podejście inne niż np. Angularze, gdzie te ścieżki definiowało się trochę _z boku_.


## Komponent Header

Obecnie struktura aplikacji (folder `app`) wygląda następująco:

```
app
├── header
│   └── Header.js
├── home
│   └── Home.js
├── profile
│   └── Profile.js
├── styles
│   └── app.css
├── App.js
├── index.html
├── index.js
└── Routes.js
```

Pokazałem już jak wyglądają `App` i `Routes`, a w `Home` i `Profile` praktycznie nie znajduje się nic poza nagłówkiem.
W tej chwili kompomentem, w którym jest cała logika jest `Header`.
Po pierwsze trzymany jest tam stan, określający, czy użytkownik jest zalogowany, czy nie, a po drugie zmieniamy ten stan w przypadku zalogowania i wylogowania.

```javascript
class Header extends Component {

  state = {
    signedIn: false
  };

  handleSignIn = () => {
    this.setState({signedIn: true})
  };
  
  ...
}
```

W momencie, kiedy użytkownik kliknie przycisk `SIGN IN`, wywoływane jest, jako callback `this.handleSignIn`, a poprzez to zmieniany jest stan komponentu.
 `signedIn` staje się `true`.
Analogicznie działa to w przypadku pozycji `Sign out` w menu dostępnym po zalogowaniu.
Komponent `Header` sam zarządza swoim stanem i w zależności od niego wyświetla przycisk logowania, albo menu.

```javascript
const getSignInButton = (handleSignIn) => (
  <FlatButton
    label="Sign In"
    onTouchTap={handleSignIn}
  />
);

const getProfileMenu = (handleSignOut) => (
  <IconMenu ... >
    ...
    <MenuItem
      primaryText="Sign out"
      onTouchTap={handleSignOut}
    />
  </IconMenu>
);

class Header extends Component {

  ...

  render() {
    return (
      <AppBar
        ...
        iconElementRight={
          this.state.signedIn ? getProfileMenu(this.handleSignOut) : getSignInButton(this.handleSignIn)
        }
      />
    );
  };
}
```

W tym komponencie wyjątkowo korzystam z funkcji, które zwracają mi komponenty Reacta: `getProfileMenu` oraz `getSignInButton`.
Nie wydaje mi się to dobrą praktyką i mógłbym tam wstawić zwykłe komponenty Reacta, a referencje do _handlerów_ przekazać przez `props`.
Nie robię tego z prostego powodu: gdybym miał np. komponent `SignInButton`, w którym byłby ten przycisk, to zmieniłaby się hierarchia komponentów.
Teraz, dzięki funkcji `getSignInButton` w `AppBar` w `iconElementRight` mam bezpośrednio komponent `FlatButton`.
Po zmianie w `iconElementRight` miałbym `SignInButton`, a w nim `FlatButton`.
A to by spowodowało, że Material-UI zmieniłby style i menu wyglądałoby brzydko.
Niestety na razie nie znalazłem sposobu, jak to przeskoczyć.


## Komentarz: ECMAScript stage 2

W komponencie `Header` korzystam z atrybutów klas (np. `state = { ... }`), które nie są jeszcze w standardzie JavaScriptu (czy w zasadzie [ECMAScriptu](https://pl.wikipedia.org/wiki/ECMAScript)).
W procesie rozwoju ECMAScriptu są tak zwane _stages_ od 0 do 4, gdzie 0 oznacza propozycję, a 4, że coś już jest w specyfikacji języka.
W chwili pisania tego posta atrybuty klas są w _stage 2_, co oznacza, że formalnie została opisana składnia i działanie danej cechy języka.
Babel już na szczęście to obsługuje, choć bez niego, nawet w najnowszych przeglądarkach byłby błąd składni.

Żeby móc korzystać ze _stage 2_ w ECMAScripcie należy zainstalować `babel-preset-stage-2`, a następnie uaktualnić plik `.babelrc` o _preset_ `stage-2`:

```json
{
  "presets": [
    "stage-2",
    "react"
  ]
}
```


## Komentarz: Kontekstualne this

W komponencie `Header` _handlery_ do logowania użytkownika są zdefiniowane jako atrybuty klasy (`handleSignIn = () => { ... }`), a nie jako proste metody (`handleSignIn() { ... }`) właśnie przez wzgląd na kontekstualne zachowanie `this`.
O zachowaniu `this` [pisałem ostatnio](http://dzikowski.github.io/daj-sie-poznac/2017/03/19/kontekstualne-this/) (zob. zwłaszcza `Demo7`).


## Komentarz: Co jeszcze nie działa

Uważam, że czasami warto jest pójść dalej, nawet jeśli coś nie działa.
W programowaniu łatwo utknąć w jednym miejscu i próbować rozwiązać jakieś zagadnienie, które tak w zasadzie w niedalekiej przyszłości może rozwiązać się samo.
Albo można utknąć, siedząc nad czymś kilka godzin, a rozwiązanie przyjdzie samo następnego dnia podczas kilkuminutowego prysznica.
Sztuką jest wyłapać ten moment, kiedy trzeba odpuścić.
Niemniej ten moment gdzieś tam jest, a przez to, że tak trudno sobie uświadomić, że to właśnie teraz, my, programiści tracimy mnóstwo czasu.

Na początku zastanawiałem się, czy już teraz, w tym kroku blokować dostęp do ścieżek i komponentów, jeśli użytkownik nie jest zalogowany.
W tym wypadku komponent `Routes` powinien również posiadać informację o tym, czy użytkownik jest zalogowany.
A żeby uniknąć konieczności synchronizowania stanów pomiędzy dwoma komponentami (o czym pisał np. [Tyler McGinnis](https://tylermcginnis.com/react-aha-moments/)), musiałbym przenieść ten stan wyżej w hierarchii komponentów.

Jest to ulepszenie, które na pewno powinno się znaleźć w starterze.
Tyle że... tak naprawdę to jest jedno z wielu ulepszeń.
Zrobię to, znajdę coś podobnego o podobnym priorytecie.
Przystąpię do realizacji tego czegoś.

W sumie mógłbym też zająć się tymi komponentami na przycisk logowania i menu w komponencie `Header`, zamienić funkcje na komponenty i jakoś tak zrobić, żeby style przy okazji się nie rozjeżdżały...

Nie wiem, czy to jest ten moment, że należy przestać, ale podejrzewam, że tak.
Tak jak pisałem kilka postów temu, _[Done is better than perfect](http://dzikowski.github.io/2016/12/27/stary-rok-nowy-rok/)_.
Reszta w następnym kroku.
