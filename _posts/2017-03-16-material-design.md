---
title: Material Design
layout: post
comments: true
tags: 
category: daj-sie-poznac
description: Twitter wypuścił Bootstrapa w sierpniu 2011 roku. Jeśli nie byłeś za dobry w designie, mogłeś teraz po prostu korzystać z gotowych szablonów, a twoja aplikacja nie tylko nie sypnie się na mobilkach, ale też nie będzie strasznie brzydka. Sam chętnie używam Bootstrapa, choć trzeba powiedzieć, że przez te lata standardy w designie się zmieniły i najwyższy czas, by spróbować za nimi nadążyć.
---

Bootstrap bywa krytykowany przede wszystkim za to, że jest dość ciężki i mocno narzuca swoją filozofię.
Łatwo jest w nim stworzyć szybki prototyp interfejsu, jednak kiedy trzeba bardziej dopracować wygląd aplikacji, może stwarzać problemy.
Często bardzo trudno jest pozbyć się charakterystycznego _bootstrapowego_ wyglądu aplikacji, a przebudowa struktury plików HTML jest pracochłonna.

Teraz od jakiegoś czasu bardzo popularny jest [Material Design](https://material.io/guidelines/) opracowany przez Google.
O założeniach takiego podejścia można poczytać też po polsku, np. [tutaj](http://grafmag.pl/artykuly/czym-jest-material-design-teoria-zasady-materialy-i-przyklady/).
Sam na designie się za bardzo nie znam, wystarczy mi dostępość gotowców (takich jak Bootstrap) i świadomość, żeby korzystać z tych gotowców i jak najmniej robić na własną rękę.
Wtedy moje aplikacje wyglądają najładniej.

Dla [startera](https://github.com/withspace/serverless-webapp-starter) od razu postanowiłem wejść w Material Design.
A robię to już teraz, na tak wczesnym etapie rozwoju projektu, bo znacznie lepiej się koduje, kiedy od samego początku aplikacja wygląda ładnie &#128578;


## Material Components

Poszukałem trochę w Google i oprócz opisów tego, czym jest i jak działa Material Design, znalazłem tę bibliotekę: [material-components-web](https://github.com/material-components/material-components-web).
Postanowiłem spróbować.

Jako pierwszy krok, należy oczywiście zainstalować przez NPM `material-components-web`, a następnie uaktualnić konfigurację Webpacka, żeby mógł korzystać z plków CSS.
Czyli najpierw musimy jeszcze zainstalować odpowiedni loader (`npm install --save-dev css-loader`) i dodać go do `webpack.config.js`.

```javascript
...

const CSSLoader = {
  test: /\.css$/,
  loader: "css-loader"
};
...

module.exports = {
  ...
  module: {
    loaders: [BabelLoader, CSSLoader]
  }
  ...
};

```

W tym wypadku nie ignoruję folderu `node_modules`, ponieważ bezpośrednio stamtąd zamierzam dorzucić plik CSS z Material Components.
A można to zrobić po prostu przez odpowiednie importy w `app/index.js`.

```javascript
import 'material-components-web/dist/material-components-web.css'
import 'material-components-web/dist/material-components-web'
```

Zaimportowałem tym samym plik CSS i plik zawierający skrypty Material Components.

Teraz chciałem zacząć już implementować coś na widoku, a okazało się, że w Material Components mają przykład integracji z Reactem ([tutaj](https://github.com/material-components/material-components-web/tree/master/framework-examples/react)).
Przejrzałem to pobieżnie i... zrezygnowałem z Material Components.

Między innymi dlatego, że okazało się, że komponent Reacta, który obudowywał checkboxa, żeby działał na Material Design miał [220 linijek](https://github.com/material-components/material-components-web/blob/master/framework-examples/react/src/Checkbox.js).
Co prawda komponent na etykietę checkboxa był już dużo krótszy, jednak zdałem sobie sprawę, że zbłądziłem.
Może i takie podejście ma jakies zalety, ale ja potrzebuję czegoś na szybko.
Postanowiłem wykorzystać dodatkowo słówko kuczowe `react` i znalazłem.


## Material-UI

Wydaje się, że [Material-UI](http://www.material-ui.com/) to to, czego szukałem -- taki Twitter Bootstrap, tylko na Material Design i dla Reacta.
Na GitHubie prawie dwadzieścia cztery tysiące gwiazdek, a na stronce mnóstwo przykładów i można łatwo podejrzeć ich kod, który wygląda bardzo ładnie i w dodatku jest na nowoczesnym JavaScripcie.
Są klaski i importy, nie ma żadnych `var`ów, żyć nie umierać.

 1. Usuwam Material Components z `package.json` (`npm uninstall --save material-components-web`) i z importów w `app/indeks.js` (ręcznie).
 1. Instaluję Material-UI (`npm install --save material-ui`), a potem jeszcze `react-tap-event-plugin`, bo okazuje się, że jest jeszcze wymagany, zeby działał Material-UI.
 1. Zgodnie z [instrukcją](https://github.com/callemall/material-ui#react-tap-event-plugin) daję w `app/index.js` import do `react-tap-event-plugin` i wywołanie `injectTapEventPlugin();`.
 1. Dodaję czcionkę Roboto. Na razie bez kombinowania, tylko klasycznie do `index.html` dodam `<link href="https://fonts.googleapis.com/css?family=Roboto:300,400,500" rel="stylesheet">`.
 1. Robię mini refactoring, usuwając komponenty Reacta z `index.js` i wrzucając je do nowego pliku `App.js` (podpatrzyłem konwencję, że tak się nazywa główny komponent w React).
 1. Przekształcam tak mój główny komponent, żeby korzystał z Material-UI.
 
Ostatecznie plik `app/index.js` wygląda tak:

```javascript
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import injectTapEventPlugin from "react-tap-event-plugin";

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();


ReactDOM.render(<App />, document.getElementById('app'));

```

A plik `app/App.js` tak:

```javascript
import React from "react";
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import AppBar from "material-ui/AppBar";

const App = () => (
  <MuiThemeProvider>
    <AppBar
      title="Serverless WebApp Starter"
      iconClassNameRight="muidocs-icon-navigation-expand-more"
    />
  </MuiThemeProvider>
);

export default App;
```

&nbsp;

A sama aplikacja zaczyna mieć piękny _material-wygląd_:

![starter-material](/assets/img/posts/starter-material.png)


