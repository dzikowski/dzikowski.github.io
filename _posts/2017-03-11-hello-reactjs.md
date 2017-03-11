---
title: Hello React.js
layout: post
comments: true
tags: 
category: daj-sie-poznac
description: Współczesne korzystanie z JavaScriptu w aplikacjach webowych bardzo różni się od tego, co było wiele lat temu. Czasy, kiedy szukało się bibliotek, a potem wstawiało do nich linki w headerze dokumentu dawno minęły. Nic dziwnego, że Tyler McGinnis zaraz na początku swojego świetnego kursu o React.js, jeszcze przed wgłębieniem się w samego Reacta, opowiada o tym, jak działa NPM, Webpack i Babel.
---

[React Fundamentals](https://reacttraining.com/online/react-fundamentals), bo o tym kursie mowa, to właściwie dopiero moje wejście w ekosystem Reacta.
Ostatnie dwa lata, jeśli chodzi o JavaScript, spędziłem w Angularze 1.x.
Ponieważ nie jestem frontentowcem, tylko full stackiem, pracę w Angularze dzieliłem z backendem i nie mam jeszcze takiego doświadczenia we froncie jak ludzie, którzy na JavaScripcie zjedli zęby.
Takie pliki jak `package.json`, czy `webpack.config.js` oczywiście kojarzyłem i zmieniałem w miarę potrzeb, nigdy jednak nie wgłębiałem się do końca, co to jest, co tam w środku siedzi, do momentu, kiedy nie było mi to do czegoś potrzebne.
Nigdy też nie konfigurowałem tych plików od podstaw i zamiast tego korzystałem z gotowców.

Na początku [startera](https://github.com/withspace/serverless-webapp-starter) zająłem się konfiguracją projektu i komponentem w stylu _Hello world_ w React.js.
I własnie, zanim przywitałem się z Reactem, trzeba było ustawić konfigurację NPM i Webpacka.

(Alternatywne wprowadzenie do tego wpisu znajdziesz [tutaj](https://hackernoon.com/how-it-feels-to-learn-javascript-in-2016-d3a717dd577f#.7ekau5h34)).


## package.json

`package.json` to taki plik, w którym trzymane są podstawowe informacje o projekcie.
Po wywołaniu w terminalu `npm init` można go stworzyć automatycznie, NPM tylko po drodze zapyta o kilka rzeczy: nazwę projektu, wersję, opis, polecenie wywołania testów, adres do repozytorium git i kilka innych.
Oczywiście nie ma potrzeby podawania wszystkich tych rzeczy, a do części z nich sugerowane są domyślne wartości.
Wygenerowany plik może wyglądać mniej więcej tak:

```json
{
  "name": "serverless-webapp-starter",
  "version": "1.0.0",
  "description": "Serverless web application starter with Webpack, React.js and Amazon Cognito.",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/withspace/serverless-webapp-starter.git"
  },
  "author": "Jakub Dzikowski",
  "license": "Apache-2.0",
  "bugs": {
    "url": "https://github.com/withspace/serverless-webapp-starter/issues"
  },
  "homepage": "https://github.com/withspace/serverless-webapp-starter#readme"
}
```

Z ciekawszych rzeczy które tutaj są, to sekcja `scripts`.
W naszym przypadku po wpisaniu w terminalu `npm run test` pojawi nam się tekst `Error: no test specified` (plus sporo, mylących na początku, komunikatów błędów NPMa, że proces zwrócił kod `1`, w związku z tym sprawdź, czy masz najnowszą wersję NPM itd.).

Sekcja `scripts` służy zatem do ustawiania różnych konfiguracji uruchamiania projektu.
Na pewno ustawimy tam jeszcze `start`, które będzie wykorzystywać Webpacka, ale o tym za chwilę.
Najpierw o zależnościach, bo do pliku `package.json` dodaje się również zależności do bibliotek, z których korzysta nasz projekt.
Może to wyglądać tak:

```json
{
  "name": "serverless-webapp-starter",
  ...
  "devDependencies": {
    "babel-core": "^6.23.1",
    "babel-loader": "^6.4.0",
    "babel-preset-react": "^6.23.0",
    "html-webpack-plugin": "^2.28.0",
    "webpack": "^2.2.1",
    "webpack-dev-server": "^2.4.1"
  },
  "dependencies": {
    "react": "^15.4.2",
    "react-dom": "^15.4.2"
  }
}
```

Zdefiniowane są tutaj dwa rodzaje zależności: `devDependencies`, które są wykorzystywane tylko wewnętrznie i służą do zbudowania naszej aplikacji, odpalenia testów itp., a także `dependencies`, które są wymagane do tego, żeby nasza aplikacja działała (więcej możesz poczytać [tutaj](http://stackoverflow.com/questions/18875674/whats-the-difference-between-dependencies-devdependencies-and-peerdependencies), mimo że to trochę stare).
W naszym przypadku, żeby aplikację zbudować potrzebujemy Webpacka i Babel, przy odpalaniu na razie wystarczy nam React.


## webpack.config.js

W tym pliku znajduje się konfiguracja Webpacka, czyli narzędzia, które -- mówiąc w skrócie -- pozbiera różne pliki źródłowe w projekcie i poskłada je w jeden, który będzie wykorzystywany na produkcji.
`webpack-dev-server` jest natomiast bardzo użytecznym narzędziem, które pozwala odpalić aplikacje na Webpacku w trybie tzw. _hot reload_.

Ale wróćmy do pliku `webpack.config.js`, który u mnie wygląda tak:

```javascript
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackPluginConfig = new HtmlWebpackPlugin({
  template: __dirname + '/app/index.html',
  filename: 'index.html',
  inject: 'body'
});

const BabelLoader = {
  test: /\.js$/,
  exclude: /node_modules/,
  loader: "babel-loader"
};

module.exports = {
  entry: [
    './app/index.js'
  ],
  output: {
    path: __dirname + '/dist',
    filename: "index_bundle.js"
  },
  module: {
    loaders: [BabelLoader]
  },
  plugins: [HtmlWebpackPluginConfig]
};
```

W obiekcie dostępnym w `module.exports = { ... };` zamieszcza się całą konfigurację Webpacka.
Zdefiniowane są tam podstawowe rzeczy: `entry`, czyli główny plik z aplikacją, gdzie wszystko się zaczyna, `output`, czyli ścieżka i nazwa pliku wynikowego -- tego, który zostanie zbudowany, a także `module` i `plugins`.

W sekcji `module` można zdefiniować tzw. `loaders`, które pozwalają na przetwarzanie plików, zanim zostaną połączone w jedną paczkę.
W tym przypadku mamy tylko jeden, `BabelLoader`, które weźmie wszystkie pliki o rozszerzeniu `.js` (oprócz tych z folderu `node_modules`) i przetworzy je z wykorzystaniem biblioteki `babel-loader`.
(Ale o Babelu jeszcze za chwilę).

No i mamy jeszcze `plugins`, które... tak w zasadzie mogą wszystko podczas procesu budowania aplikacji przez Webpacka.
Tutaj na razie jest to tylko `html-webpack-plugin`, który wrzuca do zbudowanego pliku HTML (tego w `/dist`) odnośnik do zbudowanego skryptu (`/dist/index_bundle.js`).


## .babelrc

To jest plik konfiguracyjny dla [Babela](https://babeljs.io/).
Babela, czyli chyba najpopularniejszej z bibliotek JavaScriptowych, który służy, w uproszczeniu, do takich przekształceń plików źródłowych JavaScriptu, żeby działały na wszystkich przeglądarkach.
Możesz np. kodować sobie w najnowszym JavaScripcie, a Babel go tak przebuduje, że da się go odpalić na IE 9.

```json
{
  "presets": [
    "react"
  ]
}
```

W naszym skromnym konfigu Babela na razie zaznaczone jest tylko to, że Babel ma obsługiwać Reacta.
Znaczy to tyle, że kiedy w Webpacku wywołany będzie `BabelLoader`, Babel skorzysta z biblioteki `babel-preset-react`, żeby przerobić pliki Reactowe na czysty JavaScript, który może być obsłużony w przeglądarce.


## package.json raz jeszcze

Na koniec jeszcze rozszerzymy `package.json`, dodając do niego dwa skrypty:

```json
{
  ...
  "scripts": {
    "start": "webpack-dev-server --content-base app --port 9090 --inline --hot",
    "build": "webpack",
    ...
  },
  ...
}
```

Teraz, kiedy wywołamy w terminalu `npm run start`, odpali nam się serwer z działającą aplikacją w _hot reload_ na porcie 9090.
Natomiast kiedy wywołamy `npm run buid`, webpack zbuduje nam aplikację i zbudowane pliki wrzuci do folderu `/dist`.


## ... i wreszcie React

Na razie Reacta będzie mało, tylko komponent na Hello World, ale z użytecznym komentarzem dotyczącym wersji JavaScriptu.
Bo w kursach, szczególnie tych starszych, można natknąć się na coś takiego:

```javascript
var React = require('react');
var ReactDOM = require('react-dom');
 
var HelloReactJS = React.createClass({
  render: function(){
    return (<div>Serverless WebApp Starter</div>);
  }
});

ReactDOM.render(<HelloReactJS />, document.getElementById('app'));
```

Obecnie jednak można skorzystać z dobrodziejstw, jakie daje nam nowszy JavaScript i zamienić importy na coś ładniejszego, a z komponentu zrobić klasę.
Ostatecznie plik `app/index.js` na początku będzie wyglądał tak:

```javascript

import React from 'react';
import ReactDOM from 'react-dom';

class HelloReactJS extends React.Component {
  render() {
    return <div>Serverless WebApp Starter</div>;
  }
}

ReactDOM.render(<HelloReactJS />, document.getElementById('app'));
```

Po odpaleniu `npm run start` wchodzę na [http://localhost:9090](http://localhost:9090).

Wszystko pięknie działa.
Mamy _Hello world_ w React.js. &#128079;