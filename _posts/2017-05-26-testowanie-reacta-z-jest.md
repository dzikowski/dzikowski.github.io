---
title: Testowanie Reacta z Jest
layout: post
comments: true
tags: 
category: daj-sie-poznac
description: Mój projekt nie jest duży, a jednak wprowadzanie w nim zmian daje pewien dyskomfort. Żeby mieć pewność, że wszystko działa, po zmianach przeklikuję cały interfejs, żeby sprawdzić, czy wszystko działa. W dodatku denerwujące sią ciągłe maile od Travisa, że build nie przechodzi. Najwyższy czas napisać wreszcie testy!
---

> At Facebook, we use Jest to test React applications.

Takim zdaniem zaczyna się [tutorial](https://facebook.github.io/jest/docs/tutorial-react.html) o testowaniu aplikacji w React.js przy pomocy frameworka [Jest](https://facebook.github.io/jest/).
Trzeba przyznać, że to duża zachęta.
W dodatku na stronie dokumentacji obiecują, że filozofią Jest jest umożliwienie testowania praktycznie bez dodatkowej konfiguracji.
Wierząc, że dzięki temu szybko będę mógł zacząć pisać testy, przystępuję do instalacji brakujących pakietów (przypominam, nie korzystam już z NPM, tylko z [Yarn](http://dzikowski.github.io/daj-sie-poznac/2017/05/25/yarn/)).

```bash
yarn add --dev jest babel-jest react-test-renderer
```

Zainstalowałem Jest, wkleiłem pierwszy lepszy przykład testu, uruchomiłem `yarn run jest` i... mam błąd.
`SyntaxError: Unexpected token import`.
Okazało się, że to dopiero pierwszy z błędów, które napotkałem na swojej drodze, więc opowiem krok po kroku, co chciałem zrobić i co musiałem skonfigurować, żeby wszystko zadziałało.


## Snapshot testing

No więc chciałem zrobić coś takiego, co się nazywa [snapshot testing](https://facebook.github.io/jest/docs/en/snapshot-testing.html#content) dla komponentu `Header` z mojego [startera](https://github.com/withspace/serverless-webapp-starter). 
Testy snapshotowe (bo takim polengliszowym określeniem będę nazywał te testy) polegają na tym, że sprawdzasz, czy wyrenderowany komponent ma taką samą strukturę, jak zapisany wcześniej snapshot.

Kiedy po raz pierwszy uruchamiasz taki test, Jest generuje plik ze snapshotem.
Ten plik powinien być wrzucony do repozytorium, bo staje się on bazą dla kolejnych uruchomień.
Kiedy kolejny raz odpalasz test, sprawdzane jest, czy wyrenderowany komponent ma taką samę strukturę jak zapisany snapshot.
Oczywiście -- wiadomo -- komponenty się zmieniają.
Dlatego w każdej chwili możesz uaktualnić snapshot.

Testowany miał być komponent `Header`, który służy do wyświetlania górnego paska aplikacji,
Jeśli użytkownik jest zalogowany, komponent wyświetli `ProfileMenu`, w którym jest link do profilu i przycisk umożliwiający wylogowanie się aplikacji.
Jeśli natomiast użytkownik nie jest zalogowany, wyświetlony zostanie link do rejestracji i link do logowania.
Dla przypomnienia kod komponentu:

```javascript
export default function Header({ user }) {
  return (
    <AppBar title="Serverless WebApp Starter" leftIcon="menu">
      <Navigation type="horizontal">
        {user.signedIn ? <ProfileMenu /> : <SignInButtons />}
      </Navigation>
    </AppBar>
  );
}
```

Wydaje mi się, że to wymarzony, prosty przykład, żeby napisać dwa testy snapshotowe -- jeden, który sprawdzi komponent dla użytkownika zalogowanego, a drugi dla niezalogowanego.
Takie testy zapisane w Jest wyglądają następująco (plik `Header.spec.jsx`):

```javascript
import React from 'react';
import renderer from 'react-test-renderer';
import Header from './Header';
import { User } from '../../services/auth';

it('renders correctly for signed in user', () => {
  const tree = renderer.create(<Header user={User.signedIn('jsparrow@pearl.org')} />).toJSON();
  expect(tree).toMatchSnapshot();
});

it('renders correctly for signed out user', () => {
  const tree = renderer.create(<Header user={User.signedOut(null)} />).toJSON();
  expect(tree).toMatchSnapshot();
});
```

Wyglądają bardzo prosto i przejrzyście, a wywołanie ich też jest proste: `yarn run jest`.
Jest znajdzie sam odpowiednie pliki (w tym wypadku chodzi o rozszerzenie `.spec.jsx`) i będzie próbował odpalić testy.
Tyle że w przypadku bieżącej konfiguracji [startera](https://github.com/withspace/serverless-webapp-starter) to się nie uda.


## Problem pierwszy: moduły

Pierwszy błąd, który pojawia się w terminalu:

```bash
SyntaxError: Unexpected token import
```

Skąd to się bierze?
Jest to znany problem, wynikający z korzystania z Jest razem z Webpackiem (opisany nawet [w dokumentacji](https://facebook.github.io/jest/docs/en/webpack.html#using-with-webpack-2)).
Chodzi o to, że Webpack wspiera natywne moduły (czyli te wszystkie importy), ale nie wspiera już tego NPM.
Tymczasem testy w Jest wywoływane są na gołym NPM, bez Webpacka.
Żeby rozwiązać problem, należy dodać odpowiedni plugin do Babela, który zmieni importy na postać zrozumiałą dla NPM.
(A wiemy, że Jest korzysta z Babela, bo został zainstalowany wcześniej pakiet `babel-jest`).

Czyli najpierw:

```bash
yarn add --dev babel-plugin-transform-es2015-modules-commonjs
```

A następnie dodatkowo w pliku `.babelrc`:

```javascript
{
  ...
  "env": {
    "test": {
      "plugins": ["transform-es2015-modules-commonjs"]
    }
  }
}
```

Taka konfiguracja sprawi, że w momencie, kiedy odpalane są testy (_env -> test_), w Babelu zostanie wykorzystany plugin `transform-es2015-modules-commonjs`, który przerobi importy na `exports` / `require`, zrozumiałe dla NPM (zob. [tutaj](https://www.npmjs.com/package/babel-plugin-transform-es2015-modules-commonjs)).


## Problem drugi: moduły CSS

Kolejny błąd, który otrzymamy po tym, jak umożliwiliśmy Jest korzystanie z importów:

```bash
SyntaxError: Unexpected token :
```

Tym razem problemy sprawia plik CSS, a konkretnie `/node_modules/react-toolbox/lib/ripple/theme.css`.
Zobacz, jak zaczyna się ten plik:

```css
:root {
  --color-divider: var(--palette-grey-200);
  --color-background: var(--color-white);
```

Tutaj od razu przyznam, że na tym się za dużo nie znam, więc to, co zaraz przeczytasz, to to, jak jak rozumiem to zagadnienie -- i mam nadzieję, że nie mijam się z prawdą.

No więc mamy coś takiego, co nazywa się moduły CSS (_CSS Modules_), które pozwalają nam ograniczyć _scope_ danych styli (tak jak pisałem już [tutaj](http://dzikowski.github.io/daj-sie-poznac/2017/04/07/react-toolbox/)).
Wygląda na to, że w `:root` definiowane są zmienne CSS dostępne globalnie na poziomie danego modułu (zob. też. przykład [tutaj](https://github.com/postcss/postcss-custom-properties)).
W _zwykłym_ CSS taka składnia jest jednak niedopuszczalna, ponieważ `:root` to tylko [pseudoklasa](https://developer.mozilla.org/pl/docs/Web/CSS/:root), która musi występować po selektorze (tak jak np. `:hover`, czy `:after`).
Stąd taki błąd w konsoli.

Rozwiązania tego problemu są dwa:

1. Odpalać testy bez CSS (albo precyzyjniej: na zamockowanym, _pustym_ CSS).
1. Przed wywołaniem testów przeprocesować pliki CSS, żeby pasowały do standardowej specyfikacji.

Próbowałem podejścia pierwszego, ale to, co było opisane w [dokumentacji Jest](https://facebook.github.io/jest/docs/en/webpack.html)) nie rozwiązało problemu, więc ostatecznie poszedłem na skróty i skorzystałem z pierwszego rozwiązania ([ta sekcja](https://facebook.github.io/jest/docs/webpack.html#handling-static-assets) dokumentacji).
Wadą tego rozwiązania jest to, że w snapshotach nazwy klas będą brzmiały `undefined`.

Aby zamockować pliki CSS (a także inne pliki), należy dodać w `package.json` konfigurację Jest.
Na przykład taką:

```javascript
  "jest": {
    "moduleNameMapper": {
      "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$": "<rootDir>/__mocks__/fileMock.js",
      "\\.(css|less)$": "<rootDir>/__mocks__/styleMock.js"
    }
  }
```

Jak widzisz, tutaj nie tylko mockuję pliki CSS, ale też obrazki, czcionki, dźwięki itp.
Mock różnych plików zdefiniowany jest w pliku `__mocks__/fileMock.js`:

```javascript
module.exports = 'test-file-stub';
```

Natomiast mock styli w pliku `__mocks__/styleMock.js`:

```javascript
module.exports = {};
```


## Problem trzeci: zmienne globalne

Teraz na szczęście zaczynają się błędy, które łatwiej naprawić.

```
ReferenceError: COGNITO_POOL_ID is not defined
```

Ewidentnie brakuje zmiennej, która jest brana ze zmiennych środowiskowych.
Nie mamy jednak w terminalu własnego błędu, który powinien wyskoczyć, kiedy Webpack Define Plugin nie znajdzie zmiennej środowiskowej, bo przecież Jest nie korzysta z Webpacka (a tym samym nie zadziała dodanie zmiennej środowiskowej w terminalu).
Błąd pojawia się w pliku `cognitoConfig.js`, kiedy chcemy odczytać wartość zmiennej globalnej.

Żeby rozwiązać ten problem, wystarczy postępować zgodnie z [tym wątkiem](https://stackoverflow.com/questions/38060295/jest-global-variable-example), czyli po prostu dodać odpowiednie zmienne globalne do konfiguracji Jest w pliku `package.json`;

```javascript
  "jest": {
    ...
    "globals": {
      "COGNITO_POOL_ID": "test-pool-id-123",
      "COGNITO_APP_CLIENT_ID": "test-app-client-id-123"
    }
  }
```

## Problem czwarty: router

Nasze testy się uruchomią, to duży sukces.
Tyle że korzystamy w `Header` z komponentów `Link`, pochodzących z React Routera, a komponenty te do działania potrzebują kontekstu Routera, który jest u nas wstrzykiwany poza `Header`, w samym `App`.
Stąd w terminalu ostrzeżenie:

```
Warning: Failed context type: The context `router` is marked as required in `Link`, but its value is `undefined`.
```

Rozwiązać ten problem jest całkiem łatwo.
Renderowane komponenty w testach należy obudować którymś z routerów, np. `MemoryRouter`, który jest chyba najmniej wymagający:

```javascript
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
...

it('renders correctly for signed in user', () => {
  const tree = renderer.create(
    <MemoryRouter>
      <Header user={User.signedIn('jsparrow@pearl.org')} />
    </MemoryRouter>,
  ).toJSON();
  expect(tree).toMatchSnapshot();
});
...
```

Teraz jesteśmy w dobrym miejscu.
Testy się uruchamiają w Jest i przechodzą.
Tyle że to ciągle nie wszystko.


## Problem piąty: ESLint

Uważam, że podczas weryfikacji projektu w środowisku CI (np. na Travisie) powinny być nie tylko uruchamiane testy, ale też ESLint.
A w naszym przypadku, po implementacji testów, ESLint pokazuje błędy:

```bash
/Users/jakub/IdeaProjects/serverless-webapp-starter/app/components/Header/Header.spec.jsx
   3:1  error  'react-test-renderer' should be listed in the project's dependencies, not devDependencies  import/no-extraneous-dependencies
   7:1  error  'it' is not defined                                                                        no-undef
  13:3  error  'expect' is not defined                                                                    no-undef
  16:1  error  'it' is not defined                                                                        no-undef
  22:3  error  'expect' is not defined                                                                    no-undef
```

Pierwszy rodzaj błędu: `react-test-renderer` zdaniem ESLint powinien był dołączony do `dependencies`, a nie do `devDependencies`.
To oczywiście nieprawda, bo pakiet jest odpowiedzialny za renderowanie komponentów na potrzeby testów i nie ma nic do `dependencies`, które są ładowane na produkcję.
Pojawił się na to nawet [issue](https://github.com/airbnb/javascript/issues/959) w projekcie z dobrymi praktykami Airbnb.
Rozwiązaniem jest stworzenie osobnego pliku `.eslintrc` na potrzeby testów.
Plik wystarczy wrzucić do głównego folderu testów... tyle że ja nie mam osobnego folderu na testy, bo korzystam z praktyki trzymania testów tuż przy testowanym komponencie.

Takiego rozdzielenia konfiguracji (np. po rozszerzeniu pliku) ESLint nie wspiera.
Od 2015 roku toczą się dyskusję nad wprowadzeniem takiej konfiguracji ([tutaj](https://github.com/eslint/eslint/issues/3611)), a obecnie dość intensywnie trwa implementacja ([tutaj](https://github.com/eslint/eslint/pull/8081)).
Ciągle jednak nie wiadomo, kiedy ta funkcjonalność zostanie skończona i opublikowana.
Póki co, trzeba sobie radzić inaczej.

Ostatecznie skorzystałem z odpowiednich parametrów ESLint w terminalu i zmodyfikowałem skrypty w `package.json`:

```bash
  "scripts": {
    "lint-app": "eslint . --ext .js,.jsx --fix --ignore-pattern *.spec.js*",
    "lint-tests": "eslint . --ext .spec.js,.spec.jsx --fix --rule 'import/no-extraneous-dependencies: 0' --rule 'no-undef: 0'",
    "lint": "yarn run lint-app && yarn run lint-tests",
    ...
  },
```

Mam teraz osobne polecenia dla ESLinta dla plików aplikacji i plików testów.
`lint-app` sprawdzi (i poprawi) wszystkie pliki z rozszerzeniami `.js` i `.jsx`, ale ominie `.spec.js` i `.spec.jsx`.
Przy sprawdzaniu zostaną wzięte pod uwagę reguły zdefiniowane w `.eslintrc` (czyli standardowo).
Ponieważ dla plików testów chcemy mieć trochę inne reguły, zdefiniowałem skrypt `lint-tests`, który sprawdzi tylko pliki z rozszerzeniem `.spec.js` i `.spec.jsx`, ale oprócz standardowo zdefiniowanych reguł pominie błędy wynikające z importów z `devDependencies` i z brakującymi zmiennymi globalnymi (czyli te z brakującymi `it` oraz `expect`).
Wreszcie, żeby nie wywoływać jednego i drugiego osobno, stworzyłem skrypt `lint`, który najpierw wywoła ESLinta dla plików aplikacji, a potem dla plików testów.


## Travis

Mamy pierwsze testy, mamy przechodzącego ESLinta, teraz wreszcie możemy uaktualnić konfigurację Travisa i cieszyć się zielonym buildem.
Po pierwsze, zmieńmy jeszcze skrypty w `package.json`, aby testy nie wyrzucały błędnego kodu, tylko uruchamiały Jest.
Czyli tak, bo testy już są:

```javascript
  "scripts": {
    ...
    "test": "jest"
  },
```

A teraz jeszcze plik `.travis.yml`, w którym chcemy nie tylko uruchomić testy, ale ESLint i testy:

```yaml
language: node_js
node_js:
  - "stable"
sudo: false
cache:
  yarn: true
  directories:
    - node_modules
script:
  - yarn run lint
  - yarn test
```

Notka na marginesie: Travis wspiera od tamtego roku budowanie z Yarn.
Jeśli znajdzie się w projekcie plik `yarn.lock`, zamiast standardowego `npm install` projekt zostanie zbudowany Yarnem.
Więcej możesz poczytać na [blogu Travisa](https://blog.travis-ci.com/2016-11-21-travis-ci-now-supports-yarn).

## Podsumowanie


W tym wpisie było głównie o uruchomieniu pierwszego testu snapshotowego w Jest.
I stało się, po raz pierwszy w projekcie build na Travisie zakończył się na zielono.
Zanim jednak zaczniemy świętować, trzeba będzie jeszcze napisać testy dla pozostałych komponentów, a także dla usługi do autoryzacji, gdzie nie będą to już testy snapshotowe, gdzie będzie to trzeba zrobić bardziej konwencjonalnie.

Testy snapshotowe wydają mi się ciekawym rozwiązaniem, ale jeszcze nie przekonałem się do nich do końca.
Wyobrażam sobie, że łatwo wpaść w pułapkę i obejmować tymi testami zbyt duży kawałek aplikacji, nieodizolowany od reszty.
W takich sytuacjach pewnie co chwilę trzeba uaktualniaś snapshoty, a to przecież mija się z celem.

W sumie są całkiem fajne i wymagają niewielkiej ilości kodu do napisania, ale też nie są do wszystkiego i, jak zawsze, trzeba uważać i korzystać z wyczuciem.
Najbardziej pewnie nadają się do tego, żeby testować względnie małe, wyizolowane i stabilne już komponenty, żeby je w pewien sposób _zabetonować_ i zabezpieczyć się przed nieoczekiwanymi zmianami.

([Fajny artykuł](http://randycoulman.com/blog/2016/09/06/snapshot-testing-use-with-care/) na temat wad i zalet takiego testowania).