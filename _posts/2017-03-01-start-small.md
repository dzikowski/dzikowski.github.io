---
title: Start small
layout: post
tags: 
category: daj-sie-poznac
description: |
  Jakiś czas temu kolega napisał do mnie na Slacku wiadomość w stylu "Hej, widziałeś konkurs Daj Się Poznać? Startujesz? Bo mówiłeś, że chcesz częściej pisać bloga".
  Wcześniej coś gdzieś mi mignęło o tym konkursie, ale tylko tyle, nie wiedziałem dokładnie na czym on polega.
  Po tej rozmowie zajrzałem jednak na stronkę i okazało się, że trzeba pisać dwa posty tygodniowo (!).
  Pierwsza myśl: Nie dam rady.
  Druga: Spróbuję.
  A więc jestem i zobaczymy, co będzie.
---

Konkurs [Daj Się Poznać](dajsiepoznac.pl) to jednak nie tylko pisanie bloga.
To pisanie dwóch postów tygodniowo, z czego przynajmniej jeden jest o rozwijanym projekcie Open Source.
Czyli, podkreślam, jednocześnie należy rozwijać jakiś projekt Open Source.
 
Ponieważ do tej pory jeszcze czegoś takiego nie robiłem, a nie mam żadnego pomysłu na jeszcze jednego liba, albo na jeszcze jeden framework, postanowiłem wystartować ze starterem aplikacji (_boilerplatem_) i dorzucić kamyczek do tych [dziesiątek milionów](https://github.com/blog/1724-10-million-repositories) (setek milionów?) repozytoriów na GitHubie.
Tego typu projekty już kilka razy pozwalały mi szybko zacząć projekt i prawie od razu tworzyć _business value_.
Szczególnie dobrze wspominam już raczej porzucony googlowy [Web Starter Kit](https://github.com/google/web-starter-kit) (kto w dzisiejszych JSach korzysta jeszcze z Gulpa? &#128521;), albo na przykład naszą firmową [Bootzookę](https://github.com/softwaremill/bootzooka) na Akka HTTP i Angularze 1.5.

Zaletą tej drugiej jest szczególnie to, że ma wbudowaną obsługę użytkowników (rejestracja, logowanie, przypominanie hasła itd.), co w zasadzie potrzebne jest w większości aplikacji.
Stosunkowo pracochłonna funkcjonalność (nawet przy wsparciu libów), tutaj dostępna jest _out of the box_, dzięki czemu znacznie szybciej można zacząć implementować coś konkretniejszego.
Mój starter zdecydowanie będzie miał wbudowane zarządzanie kontem użytkownika.

Po drugie, mój starter nie będzie miał backendu.

Obecnie chyba większość aplikacji webowych tworzy się w taki sposób, że mamy rozdzielony backend i frontend.
Backend jest w Scali, Javie, Pythonie, Rubym, Node.js, czy też czymkolwiek innym, a front w JavaScripcie, albo jakiejś pochodnej.
Skutek tego taki, że trzeba utrzymywać dwa całkiem różne środowiska i dbać o to, by mogły się ze sobą komunikować.
W pewnym sensie to tak, jakbyśmy mieli dwa bardzo silnie powiązane ze sobą komponenty i nie mogli nic zrobić, żeby osłabić te powiązania.
Utrzymywanie takich dwóch komponentów to hardkor, prawda?

Jeśli chcesz dodać nową funkcjonalność do takiego systemu, to musisz zaimplementować logikę biznesową zarówno we froncie, jak i w backendzie, walidację musisz obsłużyć i tam, i tam, podobnie testy na froncie i na backendzie, a jeszcze przydałoby się pewnie coś naklepać w Selenium, żeby sprawdzić, czy wszystko razem ze sobą dobrze działa.
Mnóstwo roboty.

Potem jeszcze kwestie DevOps -- deployment dwóch środowisk, sharding baz danych, load balancing itd.
Jeśli aplikacja ma tylko front, to wystarczy że kod źródłowy zostanie zbudowany jakimś Webpackiem z babelami i spółką, a potem to wszystko można wrzucić na zwykły hosting.
Żadnego Heroku, czy własnych serwerów aplikacji.

(Na marginesie: oczywiście wiem, że backendy mają swoje zalety i często nie da się bez nich obejść... jednak może nie tak często, jak się może wydawać).

W pewnym sensie będzie mój starter będzie gdzieś miał backend, bo te dane użytkownika trzeba gdzieś trzymać.
Tyle, że nie ja będę go utrzymywać.
Do zarządzania użytkownikami mam zamiar wykorzystać usługę [Amazon Cognito](https://aws.amazon.com/cognito/), której ostatnio miałem okazję trochę liznąć i byłem pod dużym wrażeniem.
W starterze pewnie tego jeszcze nie będzie, ale w apkach zbudowanych na nim do przechowywania danych skorzystałbym pewnie z S3 albo DynamoDB, a do ich obróbki z AWS Lambdy.
Wszystko po to, by uniknąć swojego backendu i żeby aplikacja była w [_serverless architecture_](https://martinfowler.com/articles/serverless.html).

Głównym powodem, dla którego chcę to zrobić właśnie w taki sposób, jest oszczędność czasu.
Kiedy chcę szybko wystartować z jakiś projektem (zwłaszcza takim _lekkim_), szkoda mi czasu na pisanie backendu i zajmowanie się tymi wszystkimi zagadnieniami wokół utrzymania środowiska.

<script type="text/javascript" src="https://ssl.gstatic.com/trends_nrtr/925_RC01/embed_loader.js"></script> <script type="text/javascript"> trends.embed.renderExploreWidget("TIMESERIES", {"comparisonItem":[{"keyword":"serverless","geo":"","time":"today 5-y"}],"category":0,"property":""}, {"exploreQuery":"q=serverless","guestPath":"https://trends.google.pl:443/trends/embed/"}); </script>

&nbsp;

Po trzecie wreszcie, uważam, że to jest dobry moment, żeby się czegoś nauczyć.
W tym wypadku -- wejść w ekosystem Reacta.

Do tej pory, jeśli chodzi o front, robiłem sporo aplikacji z Bootstrapem i Angularem 1.x.
Podejrzewam, że Angular 1.x będzie się coraz bardziej starzeć, a z kolei Angular 2 to dla mnie taki trochę znany z branży muzycznej "syndrom drugiej płyty".
Innymi słowy, wydaje mi się, że twórcy trochę przedobrzyli i nie przyjmie się tak dobrze jak jedynka.
Dlatego też nie zamierzam się uczyć nowego Angulara w najbliższej przyszłości (trójki, czwórki i dziesiątki też na razie nie).
Przez jakiś czas zastanawiałem się, czy nie wchodzić w [Vue.js](https://vuejs.org/) (mniej więcej w tym czasie, kiedy wyszła 2 i GitLab się tak chwalił, że korzystają z Vue), jednak ostatecznie zdecydowałem się na Reacta.
A żeby jeszcze dodać wisienkę do tego tortu, to zamiast Bootstrapa będzie pewnie [Material Design](https://getmdl.io/).

Innymi słowy, w ramach tego konkursu chciałbym stworzyć taki starter dla startupów.
Jeśli chcesz szybko zacząć od [czegoś małego](https://hackernoon.com/the-mvp-is-dead-long-live-the-rat-233d5d16ab02#.glduoqnwc), ale [potencjalnie skalowalnego](https://medium.com/unboxd/how-i-built-an-app-with-500-000-users-in-5-days-on-a-100-server-77deeb238e83#.nkz943g6e), to właśnie [ten projekt](https://github.com/withspace/serverless-webapp-starter) może być dla Ciebie.

