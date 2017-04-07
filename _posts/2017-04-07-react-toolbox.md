---
title: React Toolbox
layout: post
comments: true
tags: 
category: daj-sie-poznac
description: Ostatnio natknąłem się na <a href="https://github.com/stickfigure/blog/wiki/Opinionated-Comparison-of-React%2C-Angular2%2C-and-Aurelia">świetne porównanie</a> Angular2, React i Aurelii. Z jednej strony porównanie utwierdziło mnie w przekonaniu, że wybór Reacta to była właściwa droga, a z drugiej... pomogło mi wybrać React Toolbox jako zestaw komponentów Material Design do startera. Choć nie jestem do końca pewien, czy to słuszny wybór.
---

We wspomnianym artykule autor podał przykład czterech dojrzałych bibliotek do Material Design w React.js (zachwycając się jednocześnie bogactwem reactowego ekosystemu):

 - [react-md](https://react-md.mlaursen.com/),
 - [Material-UI](http://www.material-ui.com/#/),
 - [React Toolbox](http://react-toolbox.com/#/),
 - [React-MDL](https://react-mdl.github.io/react-mdl/).

Tego drugiego, Material-UI, próbowałem już wcześniej i z niego [zrezygnowałem](http://dzikowski.github.io/daj-sie-poznac/2017/03/28/materialize/), bo miał kilka rzeczy, które mi odpowiadały.
Co ciekawe, Material-UI miał też najwięcej gwiazdek spośród tych czterech bibliotek (24.5 tys. vs 5.8 tys. dla drugiego na tej liście Material Toolbox).
Poklikałem trochę na przykładowe komponenty, przejrzałem GitHuba i ostatecznie postanowiłem włączyć do [startera](https://github.com/withspace/serverless-webapp-starter) właśnie React Toolbox.

No to jedziemy:

```bash
npm uninstall --save material-ui
npm install --save react-toolbox
```

Oczywiście po czymś takim Webpack wypluwa mnóstwo błędów, bo nagle komponenty z Material-UI poznikały, ale projekt jest mały, więc nie chciałem się bawić w spokojne przechodzenie pomiędzy jedną biblioteką a drugą.
Na początku zmiany postępowały szybko i wyeliminowałem większość tych błędów, ale jak to (prawie) zawsze w programowaniu bywa, pojawiły się nieprzewidziane okoliczności &#128521;


## CSS Modules

Zainstalowałem bibliotekę, przerobiłem moje pięć komponentów na krzyż, co rozwiązało wszystkie błędy Webpacka, poza jednym, bardzo dziwnym i mało mówiącym:

```
Error: composition is only allowed when selector is single :local class name not in ".raised", ".raised" is weird
```

Na szczęście udało mi się znaleźć odpowiedni [issue](https://github.com/react-toolbox/react-toolbox/issues/1054) na GitHubie na zbliżony temat, a tam [komentarz](https://github.com/react-toolbox/react-toolbox/issues/1054#issuecomment-267910222):

> This is a classic. You need to add configuration parameters for css modules.

CSS Modules? A co to takiego?

Generalnie chodzi o to, żeby nazwy klas i animacji z CSS miały domyślnie lokalny _scope_ ([stąd](https://css-tricks.com/css-modules-part-1-need/) wziąłem te informacje).
W praktyce polega to na tym, że pisze się kod HTML w JavaScripcie i zamieszcza się w nim zaimportowane style.
Przykład:

```javascript
import styles from "./styles.css";

element.innerHTML = 
  `<h1 class="${styles.title}">
     An example heading
   </h1>`;
```

Odpowiednie loadery dla Webpacka przeprocesują taki kod i nadadzą klasie CSS taką nazwę, żeby styl był lokalny.
W wyniku powstanie na przykład coś takiego:

```html
<h1 class="_styles__title_309571057">
  An example heading
</h1>
```

Najwyraźniej React Toolbox używa CSS Modules, dlatego muszę pozwolić na to loaderom Webpacka.
W przypadku mojej skromnej aplikacji sprowadza się to zmiany tego:

```javascript
const CSSLoader = {
  test: /\.css$/,
  loader: "style-loader!css-loader"
};
```

na to:

```javascript
const CSSLoader = {
  test: /\.css$/,
  loader: "style-loader!css-loader?modules"
};
```

## PostCSS

Kolejny problem pojawił się chwilę później, kiedy utworzyłem sobie komponent na górne menu:

```javascript
const Header = (props) => (
  <AppBar title='Serverless WebApp Starter' leftIcon='menu'></AppBar>
);
```

Niestety w aplikacji wyglądało to następująco:

![Brzydkie menu](/assets/img/posts/react-toolbox-drawback-1.png)

Próbowałem to rozwiązać na kilka sposobów, jednak na szczęście stosunkowo szybko zauważyłem, że we wszystkich przykładach z React Toolbox używany jest jeszcze jeden loader dla Webpacka: [postcss-loader](https://github.com/postcss/postcss-loader).
W ogóle [PostCSS](https://github.com/postcss/postcss) to wydaje się całkiem inne środowisko, bo jest loader do Webpacka, a oprócz tego mnóstwo pluginów, które przetwarzają pliki CSS.
Postanowiłem spróbować, czy dodanie `postcss-loader` rozwiąże mój problem.

Po pierwsze, dodałem `postcss-loader` do konfiguracji Webpacka w `webpack.config.js`:

```javascript
const CSSLoader = {
  test: /\.css$/,
  loader: "style-loader!css-loader?modules!postcss-loader"
};
```

Następnie do głównego katalogu dodałem plik konfiguracyjny dla tego loadera, `postcss.config.js` (skopiowałem go z oficjalnego [przykładu](https://github.com/react-toolbox/react-toolbox-example) dla React Toolbox):

```javascript
module.exports = {
  plugins: {
    'postcss-import': {
      root: __dirname,
    },
    'postcss-mixins': {},
    'postcss-each': {},
    'postcss-cssnext': {}
  }
};
```

A żeby to wszystko zadziałało, musiałem jeszcze zainstalować kilka rzeczy:

```bash
npm install --save-dev postcss-loader postcss-import postcss-mixins postcss-each postcss-cssnext
```

Działa? Działa.

![Brzydkie menu naprawione](/assets/img/posts/react-toolbox-drawback-1-solved.png)


## AppBar

Przeniesienie całego projektu na React Toolbox nie było specjalnie trudne, choć jeden z komponentów (`AppBar`, czyli górne menu) sprawił trochę problemów, i to podobnych do tych z Material-UI.
W zasadzie to problemy te sprawiły, że zacząłem się zastanawiać, czy React Toolbox, to na pewno był dobry wybór.
Ale nie ma co na razie rezygnować, przede mną jeszcze więcej zabawy z pisaniem formularzy, wtedy zobaczymy, na ile się sprawdzi.

Po pierwsze, okazało się, że w `AppBar`, jeśli zamiast ikony po prawej (`rightIcon`) zagnieżdżone zostało `IconMenu` (czyli taka ikona, po kliknięciu na którą pojawia się menu), to ikona ta jest zawsze czarna.
Musiałem poszukać w strukturze HTML, jak wygląda element, któremu ręcznie trzeba zmienić kolor.
Rozwiązałem to dość siłowo i w globalnym CSS nadpisałem styl, ale działa.
No i działa też na te rozszerzające się kółeczka, które się pojawiają po kliknięciu na przycisk.
([Ticket](https://github.com/react-toolbox/react-toolbox/issues/611) na GitHubie).

```css
nav button {
    color: inherit !important;
}
```

Pewnie kiedyś będę to musiał zmienić, bo się okaże, że w innym kontekście też mi to napisuje style, a nie powinno.
No ale zobaczymy.

Po drugie, miałem straszny problem, żeby poradzić sobie z zagnieżdżeniem linka w tym `IconMenu` (tak działa w starterze przejście do `Profile`).
Z jednej strony chodzi o style i o to, że jak wrzuciłem `Link` z React Routera do pozycji w menu, to kliknięcie z boku tej pozycji nie robi nic, tylko zamyka menu -- bo po prostu `Link` tam nie sięga, więc klika się obok.
A inny problem jest taki, że komponenty `Link`, które pochodzą z React Toolbox, nie korzystają z React Routera, na co zresztą też można znaleźć tickety (np. [ten](https://github.com/react-toolbox/react-toolbox/issues/851), [ten](https://github.com/react-toolbox/react-toolbox/issues/1059) i [ten](https://github.com/react-toolbox/react-toolbox/issues/984#issuecomment-263014854)).

Innymi słowy, miałem trochę problemów z konfiguracją React Toolbox i kilka rzeczy robiłem pod górkę.
Bilbioteka jak biblioteka, nie jest może super dojrzała, ale daje odpowiednie możliwości.
Nie wiem jeszcze, czy jest lepsza od Material-UI, ale mam nadzieję, że taka będzie.

Zmiany związane z wprowadzeniem React Toolbox widoczne są [tutaj](https://github.com/withspace/serverless-webapp-starter/pull/4/files).
(Deklaracje komponentów w React Toolbox są krótsze, dlatego też eksperymentuję z trochę innym formatowaniem kodu).
