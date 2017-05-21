---
title: Struktura katalogów
layout: post
comments: true
tags: 
category: daj-sie-poznac
description: Oprócz wspólnego stylu, warto mieć jeszcze ustaloną strukturę katalogów. Dla Reacta nie znalazłem żadnych spójnych konwencji, jedynie powtarzające się od jakiegoś czasu rekomendacje, by utrzymywać funkcjonalny podział pakietów, a pliki z testami znajdowały się razem z pozostałymi plikami źródłowymi.
---

Obecnie moja struktura katalogów wygląda następująco:

```
├── app
│   ├── common
│   │   ├── messages.jsx
│   │   └── routes.jsx
│   ├── header
│   │   ├── Header.jsx
│   │   └── ProfileMenu.jsx
│   ├── home
│   │   └── Home.jsx
│   ├── profile
│   │   ├── Auth.js
│   │   ├── CognitoService.js
│   │   ├── ConfirmRegistration.jsx
│   │   ├── Profile.jsx
│   │   ├── ProfileRoutes.jsx
│   │   ├── Register.jsx
│   │   ├── SignIn.jsx
│   │   └── User.js
│   ├── styles
│   │   └── app.css
│   ├── App.jsx
│   ├── config.js
│   ├── index.html
│   ├── index.jsx
│   └── Routes.jsx
├── npm-shrinkwrap.json
├── package.json
├── postcss.config.js
└── webpack.config.js
```

Ciągle nie ma tego dużo i panuje względny porządek.
Najwyższy czas, żeby zdecydować się na jakąś konwencję, bo im plików będzie więcej, tym trudniej będzie je przeorganizować.

W internecie można znaleźć całkiem sporo artykułów na temat tego typu konwencji, ale zdecydowana większość jest po łebkach i ogranicza się do wniosku, że -- jak już pisałem -- jeśli tylko się da, dzielimy pakiety funkcjonalnie.
Czyli mamy na przykład na `profile`, `notifications` i `tasks`, tak aby każda grupa funkcjonalności była względnie niezależna od pozostałych.
Podział techniczny, np. na `actions`, `components` i `containers` jest odradzany, ponieważ w miarę jak aplikacja rośnie, okazuje się, że nagle w katalogach jest po kilkadziesiąt niezwiązanych ze sobą plików.
Taka struktura z czasem staje się nie do utrzymania.

Inna sprawa, że w projektach zawsze są takie komponenty, które muszą być dostępne w wielu miejscach.
Stąd w praktyce często pojawia się jakiś taki katalog, który nazywa się `commons`, albo `utils` i z czasem panuje w nim, delikatnie mówiąc, nieporządek.
Albo jeszcze inaczej -- jeśli upieramy się przy sztywnych podziałach na funkcjonalności, to z czasem może się okazać każdy pakiet importuje komponenty z wszystkich innych pakietów i mamy spaghetti w importach.

Druga z praktyk, która obecnie wydaje się obowiązująca, to to, że pliki ze specyfikacją testów, trzymamy razem z kodem komponentów, w tych samych katalogach.
Przyznam, że to była dla mnie nowość, jak zobaczyłem to w Reactcie, ale bardzo mi się podoba.


## Bardziej skomplikowane przypadki

Interesującą propozycję na strukturę aplikacji reactowej znalazłem w artykule [How to better organize your React applications?](https://medium.com/@alexmngn/how-to-better-organize-your-react-applications-2fd3ea1920f1).
Myślę, że do dobry pubkt wyjścia, żeby przyjrzeć się potencjalnym pułapkom organizacji projektu, a potem próbować uprościć zaproponowany schemat, by pasował do obecnych rozmiarów mojego [startera](https://github.com/withspace/serverless-webapp-starter).

Artykuł zaczyna się bardzo obiecująco:

> I’ve been working on very large web applications for the past few years, starting from ground zero and, with a dozen other developers, making them scale up to now be used by millions of people. And sometimes, if you didn’t start with a good architecture, it can become difficult to keep your code organized.

Podstawą całej propozycji jest podział na cztery pakiety: `components`, `data`, `scenes` i `services`, a także wprowadzenie ścisłych zasad dostępności komponentów.
Przede wszystkim "publicznie" dostępne powinny być tylko te komponenty, które są bezpośrednio w wymienionych pakietach (w głównym katalogu pakietu).
Wszystkie te, które są głębiej, nie powinny być używane poza pakietem.
Nie da się niestety tego zastrzec na poziomie JavaScriptu, nie ma czegoś takiego jak plik dostępny tylko w ramach pakietu.
Mówimy tutaj o "prywatności" na zasadzie zachowania konwencji.

```
src
├── components 
│   └── ...
├── data
│   └── ...
├── scenes
│   └── ...
├── services
│   └── ...
└── index.js
```

## Components

Bezpośrednio w pakiecie `components` znajdują się te komponenty, którą mogą być wykorzystane w dowolnym miejscu aplikacji.

W poniższym przykładzie komponent `Notifications` będzie zawierać `ButtonDismiss`.
Jednak ponieważ `ButtonDismiss` nie jest bezpośrednio w pakiecie `components`, tylko w `Notifications`, nie może być używany w całej aplikacji.
Jest tak jakby komponentem "prywatnym" dla `Notifications`.
Z kolei `Button`, podobnie jak `Notifications` może być używany wszędzie.

```
src
├── components 
│   ├── Button 
│   └── Notifications
│       ├── components
│       │   └── ButtonDismiss  
│       │       ├── images
│       │       ├── locales
│       │       ├── specs 
│       │       ├── index.js
│       │       └── styles.scss
│       ├── index.js
│       └── styles.scss
...
```

Zauważ, że komponenty są jak najbardziej samowystarczalne i ich logika nie _wycieka_ na zewnątrz.
W tej samej strukturze katalogów, tuż przy odpowiednich plikach, zdefiniowane są obrazki, style, pliki z testami, a nawet tłumaczenia.


## Data

Pakiet `data` to miejsce na potencjalną integrację z backendem, na wszelkiego rodzaju wywołania REST API, by pobrać i zapisać dane, a także odwołania do Reduxa i innych tego typu _storages_.
Szczerze mówiąc, jakoś średnio do mnie przemawia ta koncepcja, trudno mi wyczuć granicę pomiędzy `data` a `services`.
Zresztą autor sam przyznał, że są to pakiety bardzo podobne, a on sam zdecydował się dodać `data` dopiero po czasie.
Myślę, że na razie zrezygnuję z tego pakietu w starterze, tym bardziej, że nie mam też Reduxa.

```
src
├── components 
│   └── ...
├── data
│   └── users
│       ├── actions.js
│       ├── api.js
│       └── reducer.js
...
```

## Scenes

Robi się ciekawie -- i tak w zasadzie mamy ten podział na funkcjonalności, o którym pisałem już wcześniej, tyle że funkcjonalności to w tym wypadku podstrony aplikacji.
Komponenty tutaj mogą być również pogrupowane hierarchicznie, np. w `Sign` są _scenes_ zarówno na logowanie i rejestrację.

Obowiązują tutaj podobne zasady dostępu komponentów.
Jeśli w `Home` mamy zagnieżdżone `ButtonLike` i jakieś usługi, zostają one w `Home` i nie wyciekają na zewnątrz.
Są "prywatne" dla danej _scene_.

Zauważ, że _scenes_ mogą też mieć swoje prywatne _services_, które również nie powinny być dostępne dla reszty projektu.

```
src
├── components 
│   └── ...
├── data
│   └── ...
├── scenes
│   ├── Home 
│   │   ├── components 
│   │   │   └── ButtonLike
│   │   ├── services
│   │   │   └── processData
│   │   ├── index.js
│   │   └── styles.scss
│   └── Sign 
│       ├── components 
│       │   └── FormField
│       └── scenes
│           ├── Login
│           └── Register 
│               ├── locales
│               ├── specs
│               ├── index.js
│               └── styles.scss
...
```


W analizowanym artykule autor bardzo mało wspomina o `Routes`.
Sugeruje, że można wszystkie komponenty ze `scenes` zaimportować do pliku `Routes` w głównym katalogu projektu.
Takie podejście jednak wydaje mi się niepraktyczne dla mojego [startera](https://github.com/withspace/serverless-webapp-starter), gdzie na samą rejestrację i logowanie użytkownika są już 3 _routes_.
Wolałbym to pozagnieżdżać na poziomie funkcjonalnym i tak jak do tej pory trzymać wszystkie tematycznie związane _routes_ w jednym pliku.


## Services

Ostatni pakiet, czyli `services`.
Tutaj tak w zasadzie może dziać się wszystko.
Mogą to być zwykłe tzw. _utility finctions_, mogą to być odwołania do zewnętrznych usług, albo do API przeglądarki.
W moim starterze wydaje się, że jest to naturalne miejsce dla autoryzacji i podłączenia do Amazon Cognito.

```
src
├── components 
│   └── ...
├── data
│   └── ...
├── scenes
│   └── ...
├── services
│   ├── api
│   ├── geolocation
│   └── session
│       ├── actions.js
│       ├── index.js
│       └── reducer.js
...
```

## Stop!

Oczywiście nie będę korzystać z takiej konwencji na ślepo.
To jest po prostu propozycja z jakiegoś artykułu na Medium, który dostał dużo serduszek.
Wiele koncepcji mi się w niej podoba, dlatego sporo zaadaptuję, ale jednak nie wszystko.
Bardzo mi się podobają:

1. Koncepcja "prywatności" komponentów. Zasada jest prosta: w innych miejscach jest dostępny tylko komponent, _scene_, albo _service_ z głównego katalogu.
1. Samowystarczalność komponentów.
1. Osobne miejsce na "publiczne" komponenty i "publiczne" services.
1. Funkcjonalności podzielone na zasadzie podstron aplikacji, czyli _scenes_. Mam wrażenie, że to pasuje do filozofii Reacta, który jest przecież bardzo skupiony na warstwie prezentacji.

Dodatkowo pliki z testami będę trzymać w tych samych katalogach, co testowane komponenty, choć autor nie proponował tego wprost (a w projektach, które znalazłem, wręcz robił inaczej i trzymał testy w osobnym katalogu).
Zmienię też strukturę `scenes` -- nazwy podpakietów nie będą takie same jak nazwy komponentów; będa za to takie same jak odpowiedni kawałek ścieżki do danej strony.
Wreszcie, pominę pakiet `data`, ponieważ wydaje mi się on na tym etapie rozwoju startera jeszcze niepotrzebny.

Ostatecznie zdecydowałem się na następującą strukturę:

```
├── app
│   ├── components
│   │   ├── Header
│   │   │   ├── Header.jsx
│   │   │   ├── index.js
│   │   │   └── ProfileMenu.jsx
│   │   ├── messages.jsx
│   │   └── routes.jsx
│   ├── scenes
│   │   ├── home
│   │   │   ├── Home.jsx
│   │   │   ├── HomeRoutes.jsx
│   │   │   └── index.js
│   │   └── profile
│   │       ├── ConfirmRegistration.jsx
│   │       ├── index.js
│   │       ├── Profile.jsx
│   │       ├── ProfileRoutes.jsx
│   │       ├── Register.jsx
│   │       └── SignIn.js
│   ├── services
│   │   └── auth
│   │       ├── Auth.js
│   │       ├── CognitoService.js
│   │       ├── index.js
│   │       └── User.js
│   ├── app.css
│   ├── App.jsx
│   ├── index.html
│   ├── index.jsx
│   └── Routes.jsx
├── npm-shrinkwrap.json
├── package.json
├── postcss.config.js
└── webpack.config.js
```

Jak widzisz, wprowadziłem jeszcze dodatkowo pliki `index.js`, które są takim rejestrem -- to w nich będa importowane komponenty i eksportowane na zewnątrz.
Innymi słowy będzie to takie API, czy fasada, dla każdego z pakietów.
Na razie zdecydowałem się też spłaszczyć trochę strukturę i np. w `scenes` nie mam osobnych podpakietów na komponenty, tylko trzymam je wszystko w tym samym miejscu.
Jeśli się okaże, że gdzieś tych komponentów się namnoży, pewnie warto będzie wprowadzić ten dodatkowy szczebel w hierarchii, jednak na razie takiej potrzeby nie widzę.


---

Zastanawiam się, czy dałoby się napisać takie reguły do ESLinta, żeby wymusić "prywatność" komponentów i odpowiednią strukturę katalogów (albo czy już są takie reguły).
Ale to już historia na inną okazję.

