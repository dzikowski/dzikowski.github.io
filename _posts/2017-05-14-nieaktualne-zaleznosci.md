---
title: Nieaktualne zależności?
layout: post
comments: true
tags: 
category: daj-sie-poznac
description: Ekosystem javascriptowy jest niezwykle dynamiczny. Ostatnio przez tydzień z hakiem nie sprawdzałem badgy na GitHubie, dzisiaj wchodzę i nagle okazało się, że David. raportuje o sześciu nieaktualnych zależnościach. Co z tym zrobić? Da się automatycznie, ale też nie obejdzie się bez Shrinkwrapa.
---

Tak naprawdę mój [starter](https://github.com/withspace/serverless-webapp-starter) jest jeszcze malutki.
Tylko kilkaset linijek kodu, brak postawionego środowiska testowego, brak fajerwerków i tylko kilka kluczowych funkcjonalności.
W takim projekcie mam już w sumie 20 zależności (4 jako `dependencies` i 16 jako `devDependencies`).
Po ponad tygodniu okazało się, że sześć z nich jest już przestarzała.

Zależy mi na tym, żeby zależności były aktualne ze względów praktycznych, nie dlatego, żeby _badge_ na GitHubie był pięknie zielony.
Wydaje mi się, że takie utrzymywanie aktualnych zależności w projekcie jest szczególnie ważne w ekosystemie JavaScriptu -- właśnie dlatego, że jest on taki dynamiczny.

Jeśli mamy w projekcie dużo zależności do różnych bibliotek, a bieblioteki dynamicznie się zmieniają, to wystarczy, że przez chwile zaczniesz zwlekać z aktualizacjami i zostaniesz z tyłu.
Kiedyś w końcu będziesz musiał uaktualnić zależności i kiedy do dojdziesz do tego momentu, okaże się, że:

 1. Zależności do zaktualizowania jest dużo.
 1. W wielu przypadkach trzeba będzie przeskoczyć o kilka wersji.
 1. Niektóre zmiany nie będą kompatybilne wstecz.
 
Im dłużej będziesz zwlekać z aktualizacją, tym większe jest ryzyko, że aktualizacja będzie kłopotliwa i będzie wymagała większego nakładu pracy.
W przypadku częstych aktualizacji, małymi kroczkami dostosowujesz się do zmian w bibliotekach, z których korzystasz.
Bezbolesna ewolucja zamiast radykalnej rewolucji.

Inna sprawa, że skoro w projektach javascriptowych mamy sporo zależności bibliotek, a w dodatku te bibioteki szybko się zmieniają, manualne sprawdzanie, czy coś nie zdezaktualizowało jest bardzo kłopotliwe.
Stąd przydatność takich usług jak [David.](https://david-dm.org/), które sprawdzają to wszystko za ciebie.

Idąc tym tropem, można założyć, że da się pewnie też przeprowadzić automatycznie samą aktualizację zależności.
Nieoceniony Stack Overflow [potwierdza](http://stackoverflow.com/questions/16073603/how-do-i-update-each-dependency-in-package-json-to-the-latest-version) te przypuszczenia.
Wystarczy zainstalować pakiet [npm-check-updates](https://www.npmjs.com/package/npm-check-updates) i wywołać go w katalogu projektu:

```bash
npm i -g npm-check-updates
npm-check-updates -u
npm install
```

---

Niby wszystko pięknie, ale po całym zabiegu okazało się, że wpadłem na błąd związany z React Toolbox, który pojawił się prawdopodobnie po zmianie wersji Reacta.
A React pewnie się zmienił (uaktualnił), dzięki temu, w jaki sposób definiujemy zależności w projekcie -- miałem ustawione na `^15.4.2`.

I kilka tygodni temu to mogła być faktycznie wersja `15.4.2`, ale teraz mamy już Reacta `15.5.4` i pewnie taka mi się pobrała (znaczek `^` przed numerem wersji mówi, że to jest wersja minimalna i wyższe są OK).
Błąd w React Toolbox, na który się natknąłem jest już rozwiązany (por. [tutaj](https://github.com/react-toolbox/react-toolbox/issues/1410) i [tutaj](https://github.com/react-toolbox/react-toolbox/pull/1448)), jednak wersja zawierająca rozwiązanie nie została jeszcze opublikowana w NPM.

Innymi słowy, problem z zależnościami i automatyczną ich aktualizacją komplikuje się, bo w nowszych komponentach mogą pojawić się problemy znajdujące się poza rozwijanym projektem -- związane z tym, że nowsze wersje różnych bibliotek przestają ze sobą dobrze współpracować.
A w dodatku, kiedy instalujesz zależności w projekcie, nie masz żadnej gwarancji, że pracujesz na tych samych wersjach, co inny developer (albo ty sam kilka dni wcześniej).
Tutaj z pomocą przychodzi nam Shrinkwrap.

[Shrinkwrap](https://docs.npmjs.com/cli/shrinkwrap) to w sumie nawet nie biblioteka, tylko polecenie w NPM, które sprawdza, jakie są zależności w projekcie i blokuje je.
Na moim przykładzie:

 1. W `package.json` miałem wersję Reacta zdefiniowaną jako `^15.4.2`, czyli od `15.4.2` wzwyż.
 1. Ponieważ NPM instaluje najnowszą możliwą wersję, w pewnym momencie w moim projekcie pojawił się React z serii `15.5.x`, który już nie był kompatybilny z React Toolbox. W `npm install` pojawiały się błędy.
 1. Ponieważ zależności nie były poprawne, Shrinkwrap i tak by nie zadziałał. Musiałem najpierw je naprawić -- zmieniłem wersje Reacta i React DOM na `~15.4.2`, a dodatkowo musiałem dodać wprost zależność do `react-addons-css-transition-group`, też w wersji `~15.4.2`.
 1. Wywołałem `npm shrinkwrap`, dzięki czemu Shrinkwrap sprawdził wszystkie zależności w `package.json` i folderze `node_modules` i na tej podstawie utworzył plik `npm-shrinkwrap.json` z opisem zależności. Przykładowo, zależność do Reacta wygląda w tym pliku następująco:
 
```javascript
    "react": {
      "version": "15.4.2",
      "from": "react@>=15.4.2 <15.5.0",
      "resolved": "https://registry.npmjs.org/react/-/react-15.4.2.tgz"
    }
```

Teraz przy każdym wywołaniu `npm install` NPM będzie najpierw sprawdzał plik `npm-shrinkwrap.json` i w nim szukał, jakie mają być wersje bibliotek w projekcie.
Każdy developer po instalacji zależności, powienien pracować na takich samych wersjach.

Mówiąc trochę przewrotnie:

 1. NPM ma system wersjonowania, który pozwala na elastyczne definiowanie wersji bibliotek.
 1. Czasami najnowsze wersje bibliotek ze sobą nie współpracują, a takie samo wywołanie `npm install` powoduje instalację różnych wersji w zależności od czasu -- wersjonowanie może być nieprzewidywalne.
 1. Korzystamy ze Shrinkwrapa, żeby wymusić konkretne zależności w projekcie, czyli w pewnym sensie, zrezygnować z tej elastyczności, która powinna być zaletą.

Nic dziwnego, że Shrinkwrap doczekał się [krytyki](http://jonnyreeves.co.uk/2016/npm-shrinkwrap-sucks/).
Krytyki, która ostatecznie została przekierowana na sposób wersjonowania w NPM, a Shrinkwrap to zło konieczne, służące do łatania dziur w tej oryginalnej koncepcji wersjonowania.
Teoretycznie możesz sam wpisywać na sztywno wersje bibliotek w `package.json`, ale nie masz żadnej gwarancji, że zależności twoich zależności będą zdefiniowane w taki sam sposób.

Inna sprawa -- czy musimy trzymać w `npm-shrinkwrap.json` i blokować wersje wszystkich zależności w projekcie?
Bo może wystarczyłoby blokować tylko te problematyczne biblioteki?
Nie wiem, nie znalazłem jeszcze tego typu instrukcji, czy rekomendacji.

A u mnie?
U mnie pojawił się kolejny problem z React Toolbox.
Zepsuły się jeszcze labelki pól tekstowych, prawdopodobnie dlatego, że coś gdzieś pozmieniało się
pod spodem w zależnościach...
Trzeba było używać Shrinkwrapa od samego początku.

---

Jeśli chcesz poczytać więcej o Shrinkwrapie, to został całkiem fajnie opisany [tutaj](https://medium.com/front-end-hacking/conquering-npm-shrinkwrap-in-laymans-terms-afa302b3363).
