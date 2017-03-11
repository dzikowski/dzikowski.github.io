---
title: Moja droga do offline first
layout: post
comments: true
tags: 
category: daj-sie-poznac
description: Jakiś czas temu miałem okres fascynacji PouchDB. Zrobiłem sobie nawet prostą apkę, taką TODO listę w stylu Kanban na Angularze i PouchDB, w której kiedy zmieniało sie zadania, zmiana w jednym oknie od razu powodowała zmiany w drugim. Kodu na to było bardzo mało, ledwie dwa pliki, całość możecie zobaczyć <a href="/demo/pouchdb/">tutaj</a> (kod jest w źródłach, nic nie minifikowałem).
---

## Serverless

PouchDB, chociaż ma pewne niewygodne [ograniczenia](https://pouchdb.com/faq.html#data_limits), z automatu zachowuje dane w [LocalStorage/IndexedDB](http://softwareengineering.stackexchange.com/questions/219953/how-is-localstorage-different-from-indexeddb), czyli w lokalnych danych przeglądarki internetowej.
Dzięki temu -- jeśli nie usuwasz danych przeglądarki -- możesz spokojnie używać tej aplikacji, tak jakby miała gdzieś swój backend.
Dane nie znikną.
Jeśli potrzebujesz czegoś więcej, PouchDB może synchronizować się z dowolną bazą danych, która oparta jest na protokole CouchDB (czyli też np. z Cloudant lub Couchbase).

Dodatkowo można podpiąć się do PouchDB pod wydarzenie `change`, dzięki czemu możemy automatycznie zmienić dane we wszystkich otwartych oknach z aplikacją.
A to wszystko bez serwera.

Zacząłem się wtedy zastanawiać, jak moją prostą apkę kanbanową przenieść, żeby działała w trybie online.
I stanąłem pod ścianą, bo zatrzymały mnie dwie rzeczy:

 1. Zarządzanie kontem użytkownika i logowanie.
 1. Jak trzymać dane online.

Nie wiedziałem za bardzo jak się do tego zabrać, nie znałem Amazon Cognito (zresztą wtedy chyba jeszcze nie było dostępne dla aplikacji webowych), nie wiedziałem jak rozwiązać problem z ograniczeniem, polegającym na tym, że PouchDB synchronizuje całą bazę.

Doszedłem w sumie do tego, że każdy użytkownik powinien mieć swoją indywidualną bazę CoachDB, co samo w sobie nie jest problemem, bo bazy CoachDB są ponoć bardzo _lekkie_, i tego typu rozwiązania się sprawdzają.
Problem pojawia się wtedy, kiedy chciałbym część rzeczy współdzielić pomiędzy użytkownikami, i na ten problem rozwiązania nie znalazłem.

Jeśli zaś chodzi o uwierzytelnianie i autoryzację, totrochę  zainspirowałem się fajnym, choć już prawie nie rozwijanym projektem [SecureSocial](https://github.com/jaliss/securesocial/graphs/contributors).
Napisałem sobie prostą aplikację w Play Framework, która pozwalała użytkownikowi na zalogowanie się poprzez konto Googlowe, a po zalogowaniu łączyła się z API [Cloudant](https://cloudant.com/) (w skrócie: taki hosting CounchDB, obecnie IBMowy), żeby wygenerować klucze dostępowe dla indywidualnej bazy użytkownika.
Czyli było logowanie przez Google i indywidualna instancja CouchDB, do której użytkownik miał dostęp.

Aplikacja powstała na zasadzie _proof of concept_ i działała jak powinna (i właśnie odkryłem, że jeszcze gdzieś chodzi sobie w chmurze i ciągle działa), jednak nigdy jej nie ukończyłem i nie połączyłem z kanbanowym demo.
Fajnie było, dużo się nauczyłem, jednak teraz widzę, że część rozwiązań próbowałem wymyślić sam, a okazały się już wymyślone.
Dlatego w przypadku startera idę w Amazon Cognito i AWS -- żeby nie odkrywać koła na nowo.


## Offline first

Tak naprawdę dopiero niedawno zdałem sobie sprawę z tego, że tworząc tamtą aplikację na PouchDB, próbowałem jednoczesnie rozwiązać nie jeden a dwa problemy.
Pierwszy polegał na tym, jak stworzyć aplikację, żeby nie trzeba było pisać swojego backendu (czyli _serverless_).
Drugi związany był bardziej z samym frontem, a nie całościową architekturą i polegał na tym, jak zrobić, żeby aplikacja działała nawet wtedy, kiedy zabraknie internetu.
Ma to swoją nazwę: _offline development_, albo [_offline first_](https://github.com/pazguille/offline-first).

[![What does offline-first really mean](/assets/img/posts/offline-first-the-painless-way-5-638.jpg)](https://www.slideshare.net/MarcelKalveram/offline-first-the-painless-way)

(Polecam [prezentację](https://www.slideshare.net/MarcelKalveram/offline-first-the-painless-way), z której pochodzi powyższy obrazek, choć trzeba wziąć poprawkę na niektóre treści, które się zdezaktualizowały od maja 2015.
Np. warto co jakiś czas sprawdzać [wsparcie](http://caniuse.com/#feat=serviceworkers) przeglądarek dla Service Workers).

W tym momencie wchodzimy w całkiem nowy świat i całkiem nową terminologię, i okazuje się, że PouchDB to jedynie kawałek w tym ekosystemie, w dodatku wcale nie niezbędny.
Po prostu pozwala na ujednolicenie API do persystencji w lokalnych danych przeglądarki i umożliwia synchronizację.
A można zrobić nawet tak, że sama stronka załaduje się, pomimo tego, że nie ma dostępu do internetu.
I tutaj na scenę wkraczają [Service Workers](https://developers.google.com/web/fundamentals/getting-started/primers/service-workers).

A wszystko pięknie i interesująco przedstawiono w tej godzinnej prezentacji na konferencji Google I/O 2016.
Jeśli interesujesz się tym zagadnieniem i masz chwilę -- naprawdę warto.

<div style="position:relative;height:0;padding-bottom:56.25%"><iframe src="https://www.youtube.com/embed/cmGr0RszHc8?ecver=2" width="640" height="360" frameborder="0" style="position:absolute;width:100%;height:100%;left:0" allowfullscreen></iframe></div>


