---
title: GitHub CI, czyli badge
layout: post
comments: true
tags: 
category: daj-sie-poznac
description: Bardzo podoba mi się sposób, w jaki często prezentowany jest status CI projektu na GitHubie. Zamiast konieczności przechodzenia do odrębnej aplikacji, pokazywany jest badge. Możesz oczywiście na niego kliknąć i zostaniesz przekierowany na stronę, gdzie jest już więcej informacji, ale sama idea takiego badge'a w projekcie -- genialna.
---

Badge na GitHubie wyglądają na przykład tak ([źródło](https://github.com/callemall/material-ui)):

![Badge](/assets/img/posts/github-badges.png)

Jak widzisz, już na pierwszy rzut oka można znaleźć kilka kluczowych informacji o projekcie.
Jaka jest wersja NPM, czy zbudowanie aplikacji w środowisku CI się powiodło, możesz wejść na czat projektu itd.
Takie informacje twórcy zamieszczają zazwyczaj na samej górze pliku `README`.
Filozofii w tym żadnej nie ma, prosty Markdown, odnośnik do obrazka + link:

```markdown
[![npm package](https://img.shields.io/npm/v/material-ui.svg?style=flat-square)](https://www.npmjs.org/package/material-ui)
[![Build Status](https://travis-ci.org/callemall/material-ui.svg?branch=master)](https://travis-ci.org/callemall/material-ui)
...
```

Inna sprawa, że aby taki obrazek zamieścić dla własnego projektu, trzeba skorzystać z odpowiedniej usługi, specyficznej dla każdego badga.

Przykładowo, jeśli chcesz wyświetlić wersję NPM, tak jak w pierwszym badgu na obrazku, możesz opublikować swoją bibliotekę w NPM, a potem na przykład skorzystać z [tej stronki](https://badge.fury.io/), wpisać nazwę pakietu NPM i wygenerować sobie badga.
Stronka pokaże nawet kod Markdown, który możesz wrzucić do `README` swojego projektu.

W [starterze](https://github.com/withspace/serverless-webapp-starter) chciałbym zamieścić na razie tylko dwa rodzaje badgy -- na wyświetlanie informacji o tym, czy mam aktualne zależności, a także o statusie CI.


## David.

Do inspekcji zależności w projekcie i tworzenia na tej podstawie badgy służy projekt o wdzięcznej nazwie [David.](https://david-dm.org/)
David. nie tylko tworzy badge, ale też wyświetla podsumowanie wszystkich zależności w projekcie i oznacza czerwonym kolorem przestarzałe zależności, a zielonym, jeśli wszystko jest w porządku.
Przykład możesz zobaczyć [tutaj](https://david-dm.org/withspace/serverless-webapp-starter).

Aby skorzystać z David., należy najpierw zalogować się przez konto na GitHubie.
I tutaj niemiła niespodzianka.
David. chce dostępu także do moich prywatnych repozytoriów i **do prywatnych repozytoriów organizacji**, w których jestem.
(Zob też [tutaj](https://github.com/alanshaw/david-www/issues/44#issuecomment-249341527)).

Na szczęście problem ten udało się łatwo obejść.
Tak jak piszą [tutaj](https://superuser.com/questions/1064723/how-to-connect-to-github-only-for-public-repositories), na stronce, na której GitHub pyta o dostęp, można w linku podmienić scope autoryzacji z `repo` na `public_repo`.
Po takiej zmianie GitHub pyta już tylko o uprawnienia do publicznych repozytoriów, a z tym można żyć.

Teraz wystarczy podać użytkownika albo organizację, a także nazwę projektu i można wygenerować sobie piękne badge: 

[![dependencies Status](https://david-dm.org/withspace/serverless-webapp-starter/status.svg)](https://david-dm.org/withspace/serverless-webapp-starter)
[![devDependencies Status](https://david-dm.org/withspace/serverless-webapp-starter/dev-status.svg)](https://david-dm.org/withspace/serverless-webapp-starter?type=dev)


## Travis CI

Najpopularniejszym narzędziem _Continuous Integration_ na GitHubie jest chyba [Travis CI](https://travis-ci.org/).
Podobnie jak David., Travis CI jest narzędziem darmowym dla projektów Open Source, i podobnie jak w David., trzeba zalogować się kontem z GitHuba.
Uprawnienia, których wymaga Travis są jednak inne.
Przede wszystkim nie trzeba dawać dostępu do kodu i prywatnych repozytoriów, a inne wymagane uprawnienia nie są strasznie inwazyjne.
Nic, czego -- moim zdaniem -- należałoby się obawiać.

Po zalogowaniu pokazana jest prosta instrukcja, jak w trzech krokach skonfigurować swój projekt.

Najpierw należy wejść na swój profil, znaleźć repozytorium, które ma być obsługivane przez Travisa i aktywować je.
Przy okazji można jeszcze podejrzeć konfigurację Travisa dla projektu.
Mnóstwo użytecznych rzeczy: czy budować też branche i pull requesty, jakie zmienne środowiskowe mają być dodane, można nawet zdefiniować _Cron Jobs_.
Fajne to jest.

Drugi krok: trzeba dodać plik `.travis.yml` do projektu, zawierający podstawową konfigurację CI.
Obszerną dokumentację, jak zrobić to dla projektu javascriptowego można znaleźć [tutaj](https://docs.travis-ci.com/user/languages/javascript-with-nodejs/).
U mnie ten plik będzie wyglądał więcej tak:

```yaml
language: node_js
node_js:
  - "stable"
sudo: false
cache:
  directories:
    - node_modules
script:
  - npm test
```

Nic magicznego tutaj się nie dzieje.

 - Najpierw podaję, że projekt jest oparty na Node.js i wersję Node.js (ostatnią stabilną).
 - Dla pewności zaznaczam, że build nie ma uprawnień administratora.
 - Zaznaczam, żeby folder `node_modules` z zależnościami projektu był cache'owany, żeby nie trzeba było go pobierać za każdym razem.
 - Podaję komendę na odpalanie testów: `npm test`, która tak w zasadzie jest równoważna z domyślną, ale wydaje mi się, że w tym kontekście _explicite_ będzie lepsze niż _implicite_.

W tym wypadku oczywiście Travis CI będzie pokazywał błąd na badgu, ponieważ wywołanie testów, zdefiniowane w `package.json` wygląda tak:

```json
"scripts": {
  ...
  "test": "echo \"Error: no test specified\" && exit 1"
},
```

Czyli wyświetlamy komunikat, że nie mamy testów i kończymy z kodem błędu.
Bardzo dobrze, nie ma sensu tego zmieniać.
Ponieważ nie mamy testów, CI nie powinno kończyć się na zielono.
**Brak testów to błąd builda**.

Wreszcie trzeci krok, czyli `git push`.
Po tym Travis CI dostanie Git Hooka i zbuduje projekt.
Można w `README` zamieścić ostatniego badga:
[![Build Status](https://travis-ci.org/withspace/serverless-webapp-starter.svg?branch=master)](https://travis-ci.org/withspace/serverless-webapp-starter)


