---
title:  Zrozumieć maszynę, cz. 2
layout: post
comments: true
tags: 
category: daj-sie-poznac
description: Dwa niewielkie refaktoringi stały się punktem wyjścia do niskopoziomej analizy Reacta i programowania obiektowego w JavaScripcie. Pierwszy omawiany był kilka dni wcześniej, dzisiaj przyszedł czas na ten drugi.
---


## Metoda czy atrybut?

Drugi refaktoring wydaje się przede wszystkim kosmetyczny.
Zmieniłem po prostu metodę render: `render() { return ( ... ); }` na atrybut będący _arrow function_: `render = () => ( ... );`.
Taka zmiana niesie za sobą szereg korzyści:

 1. Mniej niepotrzebnego kodu, więcej logiki.
    Niby oszczędzam tylko 2 linijki i jeden poziom wcięcia na takim refaktoringu, ale uważam, że taki kod jest czytelniejszy.
 1. Spójność.
    Wszystkie handlery mam jako _arrow functions_ i jeśli w tym komponencie w taki sam sposób zapiszę metodę `render`, wszystko wygląda tak samo, zawsze to mniej _zwiech_ przy analizie kodu.
    (Choć pytanie, czy atrybuty-_arrow functions_ zadziałałyby dla innych metod Reacta, na przykład metod związanych z cyklem życia komponentów).
 1. Jednoznaczne `this`.
    Nie muszę bindować do niczego funkcji, nie muszę się zastanawiać, do czego odwołuje się `this`.
    W ogóle uważam, że to jest wielka zaleta _arrow functions_, że nie trzeba się zastanawiać nad tym, jak działa `this`.


Tak jak wspomniałem, zmiana ma też potencjalnie pewne negatywne konsekwencje związane z wydajnością.
Ale żeby opowiedzieć, dlaczego i jakie, trzeba najpierw odpowiedzieć sobie na pytanie, czym tak naprawdę są klasy w JavaScripcie.

Odpowiedź: To głównie _syntactic sugar_ na funkcje.


## Klasa jako _syntactic sugar_

Przy czym zwracam uwagę na słówko **głównie**, bo oprócz _syntactic sugar_ są jeszcze jakieś dodatkowe restrykcje, np. `"use strict";` _out of the box_, albo to, że dla klas, w przeciwieństwie do funkcji, nie obowiązuje tzw. _hoisting_ (nie możesz użyć klasy przed jej zadeklarowaniem).
Niemniej jednak, jeśli piszesz klasę w JavaScripcie, to wiedz, że tak naprawdę jest ona funkcją.
Weźmy na przykład taką klasę:

```javascript
class User {
  
  constructor(name) {
    this.name = name;
  }
  
  sayHello() {
    console.log('Hello', this.name);
  }
}

const u = new User("Jakub");
u.sayHello();
```

Koncepcyjnie sprowadza się to do następującego kodu (ale uwaga: nie jest to dokładnie to samo -- patrz dodatkowe restrykcje):

```javascript
function User(name) {
  this.name = name;
}

User.prototype.sayHello = function() {
  console.log('Hello', this.name);
}

const u = new User("Jakub");
u.sayHello();
```

I teraz kwestia jest następująca:
Jeśli zmienię metodę `sayHello` na atrybut będący _arrow function_, o tak:

```javascript
class User {
  ...
  sayHello = () => {
    console.log('Hello', this.name);
  };
}
```

To odpowiednik takiego kodu napisany na funkcjach będzie wyglądał tak:

```javascript
function User(name) {
  
  this.name = name;
  
  this.sayHello = function() {
    console.log('Hello', this.name);
  }
}
```

Koncepcyjnie, w javascriptowym programowaniu obiektowym, są to zatem dwie różne rzeczy.
W pierwszym przypadku dodajemy funkcję/metodę do prototypu obiektu, a w drugim dodajemy ją do pojedynczego obiektu w momencie jego utworzenia.
Czyli `sayHello` nie jest już metodą klasy/prototypu `User`, wspólną dla wszystkich obiektów, tylko staje się czymś, co ma każdy obiekt z osobna.
Zamiast jednej funkcji, mamy wiele takich samych -- tyle, ile zostało stworzonych obiektów.

Za każdym razem, kiedy tworzony jest nowy obiekt, trzeba stworzyć nową funkcję i przypisać ją do obiektu, a to ma konsekwencje wydajnościowe, zarówno jeśli chodzi o procesor, jak i pamięć.


## Babel

W praktyce sprawę komplikuje jeszcze Babel, i jego też trzeba włączyć do tego procesu.
Obecne ustawienia Babela w moim projekcie powodują, że w rzeczywistości klasy javascriptowe są tłumaczone na funkcje.

Następująca klasa:

```javascript
class User {
  
  constructor(name) {
    this.name = name;
  }
  
  sayHello() {
    console.log('Hello', this.name);
  }
  
  sayHello2 = () => {
    console.log('Hello', this.name)
  };
}
```

Zostanie przez Babel zmieniona na coś takiego:

```javascript
...

var User = function () {
  function User(name) {
    var _this = this;

    _classCallCheck(this, User);

    this.sayHello2 = function () {
      console.log('Hello', _this.name);
    };

    this.name = name;
  }

  _createClass(User, [{
    key: 'sayHello',
    value: function sayHello() {
      console.log('Hello', this.name);
    }
  }]);

  return User;
}();
```

(Babel dorzuci jeszcze funkcje `_createClass` oraz `_classCallCheck`, które odpowiadają też między innymi za dodatkowe restrykcje przy definiowaniu klas.
Podobnie zostanie dorzucony `'use strict';`.
Tego wszystkiego jednak nie pokazuję, żeby skupić się tylko na tym, co najważniejsze.
Całość można zobaczyć [tutaj](https://babeljs.io/repl/#?babili=false&evaluate=true&lineWrap=true&presets=es2015%2Creact%2Cstage-2&targets=&browsers=&builtIns=false&debug=false&code=class%20User%20%7B%0A%20%20%0A%20%20constructor(name)%20%7B%0A%20%20%20%20this.name%20%3D%20name%3B%0A%20%20%7D%0A%20%20%0A%20%20sayHello()%20%7B%0A%20%20%20%20console.log('Hello'%2C%20this.name)%3B%0A%20%20%7D%0A%20%20%0A%20%20sayHello2%20%3D%20()%20%3D%3E%20%7B%0A%20%20%20%20console.log('Hello'%2C%20this.name)%0A%20%20%7D%3B%0A%7D)).

Jak widać na przykładzie, także i tutaj jest podobne rozróżnienie dla `sayHello` i `sayHello2`.
Ta pierwsza tworzona jest tylko raz, na poziomie całej klasy -- w `_createClass` przy inicjalizowaniu `var User`.
Ta druga, `sayHello2` podawana jest wewnątrz `function User`.
Różnica zatem jest taka sama, jak podawałem wcześniej przy okazji prototypów i atrybutów wewnątrz funkcji.
`sayHello2` tworzone będzie wielokrotnie, za każdym razem, kiedy tworzony jest nowy obiekt.


## Eskperymenty

Zróbmy kilka prostych eksperymentów.
Nic specjalnie dokładnego, ale takie, żeby z grubsza dowiedzieć się, o co chodzi:

```javascript
class Hello1 {
  sayHello() {}
}

class Hello2 {
  sayHello = () => {};
}

// noprotect
const n = 1000000;
const start = new Date().getTime();

for (let i = 0; i < n; i++)
  new Hello1();

const end1 = new Date().getTime();

for (let i = 0; i < n; i++)
  new Hello2();

const end2 = new Date().getTime();

console.log(end1 - start);
console.log(end2 - end1);
```

Czyli najpierw tworzę milion obiektów `Hello1`, które mają metodę, a potem milion obiektów `Hello2`, które mają atrybut będący _arrow function_.
Przy okazji mierzę i wyświetlam, ile czasu to wszystko zajęło.

(Ciekawostka: komentarz `// noprotect` powoduje, że Google Chrome nie przerywa mi automatycznie pętli.
Gdybym nie miał tego komentarza, pętle zostałyby przerwane jako podejrzenie _infinite loop_).


W drugim eksperymencie zmieniłem tylko deklaracje klas na ich odpowiedniki na funkcjach, natomiast pętle wyglądały tak samo.

```javascript
function Hello1() {}

Hello1.prototype.sayHello = function(){};

function Hello2() {
  this.sayHello = function(){};
}

...
```

Pierwszy kawałek kodu odpalałem na Babelu na [JS Bin](https://jsbin.com), drugi też na JS Bin, tyle że zamiast Babela na czystym JavaScripcie.
W obu przypadkach otrzymałem takie same wyniki.
Czas stworzenia miliona instancji obiektów pierwszej klasy -- z metodą `sayHello` wahał się mniej więcej pomiędzy 19 a 22 ms.
W drugim przypadku, kiedy `sayHello` jest atrybutem będącym funkcją, czas wykonania wzrósł do 130 -- 220 ms.
Duży rozstrzał, ale tak czy inaczej przynajmniej sześć razy dłużej.

Zrobiłem jeszcze jeden eksperyment polegający na tworzeniu instancji, ale tym razem były to trzy metody, albo trzy atrybuty:

```javascript
class Hello1 {
  sayHello1() {}
  sayHello2() {}
  sayHello3() {}
}

class Hello2 {
  sayHello1 = () => {};
  sayHello2 = () => {};
  sayHello3 = () => {};
}

...
```

Dla pierwszej klasy czas wykonania nieznacznie się zwiększył, do mniej więcej 20 -- 25 ms.
Dla drugiej klasy z kolei czas podskoczył do 370 -- 440 ms.

W kolejnym, ostatnim już eksperymencie chciałem sprawdzić, ile zajmie nie tworzenie obiektów, ale samo wywoływanie metody.

```javascript
class Hello1 {
  sayHello() {}
}

class Hello2 {
  sayHello = () => {};
}

// noprotect
const h1 = new Hello1();
const h2 = new Hello2();

const n = 100000000;
const start = new Date().getTime();

for (let i = 0; i < n; i++)
  h1.sayHello();

const end1 = new Date().getTime();

for (let i = 0; i < n; i++)
  h2.sayHello();

const end2 = new Date().getTime();

console.log(end1 - start);
console.log(end2 - end1);
```

Instancje od początku są utworzone, teraz w pętlach tylko wywołuję `sayHello` na utworzonych obiektach.
Żeby otrzymać sensowne wyniki musiałem zwiększyć `n` i wywoływałem metodę nie po milion, ale sto milionów razy.
W obu przypadkach osiągnąłem taki sam czas: po mniej więcej 370 ms.


## Czy warto?

Przeprowadzony eksperyment, choć metodologicznie daleki od doskonałości (tylko kilka wywołań, proste przykłady, tylko na moim komputerze), pokazał wyraźnie, że korzystanie z metod jest bardziej wydajne.
Jak to w programowaniu bywa, trudno jednak jednoznacznie rozstrzygnąć, czy refaktoring, polegający na zmianie metody `render` na atrybut-_arrow function_ był dobry, czy zły.
A nawet jeśli to rozstrzygniemy, to czy naprawdę kwestia wydajnościowa jest decydująca?

Na prostych klasach uzyskaliśmy znaczącą różnicę w przypadku tworzenia miliona instancji.
Ale z drugiej strony dla tysiąca obiektów taka różnica była już niedostrzegalna: 0 -- 1 ms, dla obu przypadków.
Z kolei ostatni eksperyment pokazał, że nie ma różnicy w przypadku wywoływania metody i atrybutu-funkcji.
Dla mojego komponentu `ProfileMenu`, konstruktor w rzeczywistości wywołany jest raz, częściej natomiast wywoływana jest metoda `render`.
W przypadku innych komponentów pewnie będzie inaczej.

Ostatecznie sam zostanę jednak przy wersji z `render() { return (...); }`, jednak nie przez wzgląd na wydajność.
Szczegółowa analiza kodu i eksperymenty mnie nie przekonały.
Utwierdziły mnie za to w przekonaniu o ograniczeniach własnej wiedzy i skłoniły do ostrożności.
Być może zamiana na `render = () => ( ... );` niesie za sobą jeszcze inne konsekwencje, których się nie spodziewam.
A skoro do tej pory nie spotkałem w sieci przykładu, w którym metoda była zamieniona na atrybut, może coś jest na rzeczy i jednak nie warto tego zamieniać.

Warto jeszcze zwrócić uwagę na dwa cytaty, na które natknąłem się podczas zbierania materiałów do obu wpisów dotyczących zrozumienia maszyny (poprzedni wpis jest [tutaj](http://dzikowski.github.io/daj-sie-poznac/2017/04/23/zrozumiec-maszyne-cz-1/)).
Pierwszy cytat pochodzi z [tego wątku](http://stackoverflow.com/questions/310870/use-of-prototype-vs-this-in-javascript) na Stack Overflow:

> JavaScript isn't a low-level language. It may not be very valuable to think of prototyping or other inheritance patterns as a way to explicitly change the way memory is allocated.

Drugi cytat pochodzi z [tego wątku](https://github.com/airbnb/javascript/issues/801) na GitHubie z _Airbnb JavaScript Style Guide() {_ i bardziej w sumie dotyczy [pierwszego wpisu](http://dzikowski.github.io/daj-sie-poznac/2017/04/23/zrozumiec-maszyne-cz-1/) o zrozumieniu maszyny.
Tego, w którym zastanawiałem się nad użyciem _arrow functions_ w `props` komponentów.

> imo, a stateless component is so much better than a stateful one, that any potential tiny performance difference (and I suspect there's none) is absolutely worth it - iow, stateless.

Streszczając te dwa cytaty: Trzeba mieć umiar i zachować zdrowy rozsądek.
Albo inaczej: Wszystko zależy.

Szczegółowe dywagacje o wydajności i przewadze jednego rozwiązania nad drugim w jakimś aspekcie mogą zaciemnić obraz całości, być czymś na kształt _premature optimization_.
Korzyści wydajnościowe mogą być na tyle nieznaczne, że nie ujawnią się w większości przypadków, a jednocześnie próby takiej optymalizacji mogą doprowadzić do mniej czytelnego kodu.
Łatwo wpaść w pułapkę zafiksowania się na jednej małej rzeczy i stracić z oczu ogólny obraz.
Zawsze trzeba znaleźć jakiś kompromis: znać maszynę, korzystać z dobrych praktyk, zastanawiać się nad wydajnością i wyrobić sobie nawyk tworzenia wydajnego kodu, ale jednocześnie iść do przodu.
Nie zatrzymywać się nad sprawami, których znaczenie w gruncie rzeczy wcale nie jest takie duże.

Ja chyba wpadłem w tę pułapkę.
Zamiast kodować projekt, poświęciłem kilkanaście godzin na szczegółową analizę tego zagadnienia i napisanie dwóch postów &#128521;.


## Warto przeczytać

 - Wątki na Stack Overflow: [1](http://stackoverflow .com/questions/4508313/advantages-of-using-prototype-vs-defining-methods-straight-in-the -constructor), [2](http://stackoverflow.com/questions/310870/use-of-prototype-vs-this-in-javascript), [3](http://stackoverflow.com/questions/36419713/are-es6-classes-just-syntactic-sugar-for-the-prototypal-pattern-in-javascript/36419728).
 - Dokumentację JavaScriptu na MDN: [1](https://developer.mozilla.org/pl/docs/Web/JavaScript/Wprowadzenie_do_programowania_obiektowego_w_jezyku_JavaScript), [2](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Classes).
 - Sekcję _More than sugar_ z [tego artykułu](https://www.sitepoint.com/object-oriented-javascript-deep-dive-es6-classes/).
 - [Airbnb React/JSX Style Guide](https://github.com/airbnb/javascript/tree/master/react), który ciągle jest przede mną i czeka.
