---
title:  CD z Travisem i GitHubem
layout: post
comments: true
tags: 
category: daj-sie-poznac
description: Całe środowisko continuous deployment możesz postawić za darmo dla publicznego projektu. Fajną opcją dla aplikacji frontendowej jest repozytorium na GitHubie, CI na Travisie i automatyczny deployment na GitHub Pages.
---

O Tavisie w sumie pisałem już w kwietniu ([tutaj](http://dzikowski.github.io/daj-sie-poznac/2017/04/14/github-ci-czyli-badge/)), kiedy konfigurowałem go dla [startera](https://github.com/withspace/serverless-webapp-starter) aplikacji _serverless_ w React.js.
Teraz będę pracował na tym samym projekcie, tyle że dokończę cały flow.
Po pomyślnym zbudowaniu projektu, demo aplikacji będzie wrzucane na GitHub Pages.

[GitHub Pages](https://pages.github.com/) to taki darmowy hosting.
Możesz sobie zdefiniować stronę na poziomie całego użytkownika GitHuba (tak działa mój blog), albo na poziomie projektu.
Idealny darmowy hosting dla twojej publicznej aplikacji frontendowej.

Co prawda na głównej stronie GitHub Pages w tej drugiej opcji opisany tylko jest sposób, kiedy cały `master` projektu, albo sam folder `docs` serwowany jest jako _pages_, ale jest jeszcze inny sposób, z którego właśnie skorzystam.
Można trzymać stronę projektu w tym samym repozytorium, tyle że na _branchu_ `gh-pages`.
Wtedy ten _branch_ automatycznie zostanie przez GitHuba zinterpretowany jako źródła z plikami _pages_.

Sam proces _continouos deployment_ będzie wyglądał następująco:

1. Robię _push_ do `master` do repozytorium projektu.
1. Travis testuje projekt.
1. Travis buduje projekt i wrzuca zbudowaną aplikację do folderu `dist`.
1. Travis _pushuje_ folder `dist` do _brancha_ `gh-pages`.

Pierwsze dwa kroki obsłużone są już teraz, trzeci wydaje się trywialny, bo wystarczy dodać do `travis.yml` linijkę z komendą na budowanie projektu, czyli `yarn build`.
Tyle że trzeba jeszcze pamiętać o zmiennych środowiskowych do Amazon Cognito, czyli `COGNITO_POOL_ID` i `COGNITO_APP_CLIENT_ID`.
Ich wartości nie są żadną tajemnicą, bo mamy aplikację serverless, więc i tak będą widoczne na froncie.
W związku z tym do pliku `.travis.yml` można dodać wartości tych zmiennych, przy czym muszą to być te same wartości, które znajdą się w docelowej aplikacji, żadne dane testowe.
(Podczas budowania aplikacji odpowiedni plugin do Webpacka podmienia w plikach odwołania do zmiennych globalnych na wartości ze zmiennych środowiskowych).

Ostatecznie, po tym kroku, plik `.travis.yml` wygląda tak:

```
language: node_js
node_js:
  - "stable"
sudo: false
cache:
  yarn: true
  directories:
    - node_modules
env:
  global:
    - COGNITO_POOL_ID="???"
    - COGNITO_APP_CLIENT_ID="???"
script:
  - yarn lint
  - yarn test
  - yarn build
```

Teraz musimy jeszcze tylko kazać Travisowi _pushować_ zbudowaną aplikację na osobny _branch_.
Okazuje się to bardzo proste, bo twórcy Travisa przewidzieli coś takiego i można posłużyć się [gotowym przykładem](https://docs.travis-ci.com/user/deployment/pages/).
Wystarczy do pliku `.travis.yml` dodać linijki:

```
deploy:
  provider: pages
  skip_cleanup: true
  github_token: $GITHUB_TOKEN
  local_dir: dist
  on:
    branch: master
```

Ważne jest ustawienie flagi `skip_cleanup`, ponieważ dzięki temu, w momencie kiedy dochodzimy do fazy `deploy`, zbudowane pliki aplikacji pozostają na serwerze.
W przeciwnym wypadku zostałyby automatycznie usunięte przez Travisa.

Oprócz tego w powyższym listingu ustawiam, że zawartość, która ma być _zdeployowana_ to folder `dist`, a _deployment_ ma mieć miejsce tylko z _brancha_ `master`.

Pozostaje jeszcze `github_token`, który jest tutaj brany ze zmiennej środowiskowej.
Jest to token, który pozwala danej aplikacji na dostęp do GitHuba.
Możesz wejść na ustawienia swojego profilu w _Personal access tokens_ ([tutaj](https://github.com/settings/tokens)) i wygenerować taki token specjalnie dla Travisa.
Uprawnienia, które musiałem wybrać na potrzeby startera to `public_repo`, ponieważ projekt jest publiczny.

Pod żadnym pozorem nie powinno się podawać tokena w publicznie dostępnym miejscu.
Takie z pozoru niewinne uprawnienie jak `public_repo` pozwala osobom i usługom zmieniać zawartość wszystkich twoich publicznych repozytoriów (także repozytoriów organizacji).
Przyznaję, że sam czuję się niekomfortowo, podając mój token Travisowi, jednak innej drogi nie znalazłem -- przynajmniej na szybko.

Pewnie można by zrobić to bezpieczniej, np. utworzyć nowego użytkownika GitHuba z dostępem tylko do repozytorium z demo (i to innego niż repozytorium projektu) i to dla niego wygenerować token.
Tą ścieżką jednak nie poszedłem, choć ciągle zastanawiam się, czy słusznie.
Niby `public_repo` nie pozwala na usunięcie całego repozytorium, ale przecież i bez tego można usunąć wszystkie pliki i całą historię (zob. [ten wątek](https://stackoverflow.com/questions/13716658/how-to-delete-all-commit-history-in-github)).
W scenariuszu, kiedy ktoś uzyska dostęp do tokenów zapisanych na Travisie, ma techniczne możliwości, żeby zacząć usuwać zawartość wszystkich repozytoriów.
Tyle że wtedy pewnie GitHub odkryje, że coś nie działa, zacznie blokować Travisa i pewnie będzie mógł przywrócić jakieś dane z _backupów_, prawda?

Teraz i tak tego nie rozstrzygnę, bo zaraz pewnie dojdę do tego, co się stanie kiedy padnie GitHub (macie backupy swoich repo?), albo wskutek trzeciej wojny światowej wyłączą internet.
Tak czy inaczej, żeby wrzucić zbudowaną aplikację do repozytorium, Travis musi mieć dostęp do _Personal access token_ dla użytkownika, który ma dostęp do repozytorium. 

Dostęp od tego tokena można dać na dwa sposoby.
Albo wprost dla projektu zdefiniować zmienną środowiskową (tak jak piszą o tym [tutaj](https://docs.travis-ci.com/user/environment-variables#Defining-Variables-in-Repository-Settings)), albo dodać do `.travis.yml` zmienną zaszyfrowaną, co wyglądałoby mniej więcej tak:

```
env:
  global:
    - secure: dlUgi/IbeZsenSownY+cIAg/znAk03
```

Ja wybrałem opcję pierwszą.
W drugiej i tak Travis musi mieć możliwość rozszyfrowania wartości zmiennej, a w sumie nawet zaszyfrowanej zmiennej nie chciałbym udostępniać publicznie, tak samo jak nie chciałbym udostępniać publicznie zaszyfrowanych haseł użytkowników.
(Zresztą kiedyś był już [leak](https://blog.travis-ci.com/2016-11-23-security-vulnerability-environment-variables/), choć niespecjalnie duży).

Po dokonaniu zmian w pliku `.travis.yml`, _commicie_ i _pushu_ do _mastera_, Travis powinien zbudować aplikację i wrzucić ją do tego samego repozytorium do _brancha_ `gh-pages`.
Oczywiście i projekt, i _branch_, i kilka innych ustawień można [zmieniać](https://docs.travis-ci.com/user/deployment/pages/).

U mnie zadziałało &#128521;.

Możesz zajrzeć na odpowiednie _branche_: `master` ([link](https://github.com/withspace/serverless-webapp-starter)), gdzie znajdziesz kod źródłowy projektu i `gh-pages` ([link](https://github.com/withspace/serverless-webapp-starter/tree/gh-pages)), gdzie są pliki wrzucone przez Travisa.
Wreszcie możesz też zajrzeć na [demo aplikacji](https://withspace.github.io/serverless-webapp-starter/#/), które jest hostowane na GitHub Pages.

