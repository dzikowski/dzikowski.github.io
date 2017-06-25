---
title: CouchDB i PouchDB. Schematy uwierzytelniania i autoryzacji
layout: post
comments: true
tags: 
description: Załóżmy, że nasza aplikacja korzysta z PouchDB, synchronizowanej ze zdalną CouchDB. Szybko się okaże, że rezygnacja z backendu pozbawia nas komfortu łatwego ukrywania niektórych rzeczy po stronie serwerowej. Kiedy mamy tylko front i bazę, pojawiają się całkiem nowe wyzwania związane z bezpieczeństwem i architekturą aplikacji, a wiele rzeczy trzeba przemyśleć na nowo.
---

Ten wpis w dużej mierze korzysta z dokumentu o uwierzytalnianiu i autoryzacji w PuchDB, dostępnego [tutaj](https://github.com/pouchdb-community/pouchdb-authentication#couchdb-authentication-recipes), z dokumentacji CouchDB związanej z bezpieczeństwem (np. [1](http://docs.couchdb.org/en/2.0.0/intro/security.html) i [2](http://docs.couchdb.org/en/2.0.0/api/server/authn.html)), a był nawet taki moment, że analizowałem RFC (a konkretnie trochę już przestarzałe [RFC 2109](https://tools.ietf.org/html/rfc2109.html)).
Zajrzyj tam, jeśli chcesz poznać więcej szczegółów technicznych i zobaczyć przykłady kodu.
Jeśli natomiat masz ochotę na lżejszą lekturę, przy której ciągle można sporo się dowiedzieć, to ten wpis jest właśnie dla ciebie.


## Niebezpieczne ustawienia domyślne

Część baz NoSQL jest bardzo podatna na zagrożenia związane z bezpieczeństwem, wycieki danych, czy "nieuprawniony" dostęp (cudzysłów celowy).
Nie wynika to jednak z ograniczeń technicznych, czy luk bezpieczeństwa w samym rozwiązaniu.
Wynika to z tego, że zaraz po zainstalowaniu bazy, domyślnie mamy publiczny dostęp do wszystkiego.
Dystrybucje linuksa, albo stare dobre bazy relacyjne, zaraz po instalacji dają ci minimum uprawnień, do tego stopnia, że często samo rozpoczęcie korzystanie jest utrudnione.
Sam na przykład po instalacji Postgresa od razu zaczynam szukać artykułów, jak dodać użytkownika bazy, bo inaczej ciężko się do niej dostać spoza localhosta.

W nowszych bazach NoSQL często stosuje się inne podejście.
Twórcy chcą, żeby można było jak najszybciej zacząć korzystać z ich produktów, dlatego domyślnym użytkownikom, albo nawet publicznie, dają maksymalne uprawnienia odczytu i zapisu.
Developer zaczyna korzystać z takiej bazy, pisze swoją aplikację, wypuszcza ją na świat i okazuje się, że po drodze zapomniał zmienić uprawnienia.
To nie jest nic nietypowego.
Człowiek zapomina.
Zdarza się.
To twórcy powinni podejść do uprawnień bardziej zachowawczo.

Nie inaczej jest też w przypadku CouchDB.
Kiedy zainstalujesz sobie świeżą bazkę, domyślnie pracujesz w trybie, który jest określany jako _Admin Party_.
Każdy jest adminem.
Każdy może wszystko.
Dlatego pierwszym krokiem powinno być od razu wyłączenie tego trybu i utworzenie konta administratora.

Tyle że to nie koniec.
Domyślnie w CouchDB nowo utworzona baza jest publiczna.
Znów każdy może z niej czytać i każdy może w niej zapisywać zmiany.
Teoretycznie taki model może być dopuszczalny, jeśli mamy do czynienia np. z publicznym wiki.
Tyle że tutaj dodatkowo każdy może zmienić historię dokumentu, więc nie polecam.


## Wspólna baza danych

Przejdźmy jednak do konkretów i rozważmy przykład, kiedy korzystamy z bazy CouchDB i mamy wielu użytkowików z różnymi uprawnianiami.
Synchronizacja bazy z PouchDB nas nie interesuje, bo na razie jeszcze nie mamy bazy offline.
Korzystamy z PouchDB tylko jako interfejsu do łączenia się z CouchDB.

Wspomniany na początku dokument o uwierzytelnianiu i autoryzacji w CouchDB pokazuje kilka bardzo ciekawych schematów, kiedy wielu użytkowników korzysta z tej samej bazy danych.
Jeśli twoje doświadczenie z bazami danych zaczęło się od baz relacyjnych (tak jak u mnie), pewnie nie będzie to dla ciebie nic nowego.

Przykład pierwszy: Blog.
Albo dowolna inna aplikacja, w której jedna osoba (lub kilka osób) może modyfikować dowolne dane, a wszyscy mogą te dane odczytywać.
W tym celu ustawia się w bazie odpowiedni tzw. _design doc_ z funkcją `validate_doc_update`, która może wyglądać np. tak:

```javascript
function(newDoc, oldDoc, userCtx) {
  var role = "blogger";
  if (userCtx.roles.indexOf("_admin") === -1 && userCtx.roles.indexOf(role) === -1) {
    throw({forbidden : "Only users with role " + role + " or an admin can modify this database."});
  }
}
```

Taka funkcja będzie wywoływana przy każdej aktualizacji dokumentu, także w przypadku synchronizacji z inną bazą.
Za każdym razem sprawdzone zostanie, czy bieżący użytkownik to `_admin`, albo `blogger`.
Inni użytkownicy nie będą mogli zmodyfikować dokumentu -- CouchDB zwróci status błędu i obiekt ze zdefiniowanym w funkcji komunikatem.

Podobnym przykładem do bloga jest Twitter, albo inna aplikacja, gdzie wielu użytkowników może tworzyć i uaktualniać stworzone informacje, a wszyscy mogą je odczytać.
Tutaj podobnie można zastosować funkcję `validate_doc_update`, jednak nie wystarczy sprawdzać, czy użytkownik ma przypisaną jakąś predefiniowaną rolę -- bo takich predefiniowanych ról nie ma.
Należy za to w każdym dokumencie trzymać nazwę użytkownika, a potem w `validate_doc_update` sprawdzać, czy użytkownik, który chce zmodyfikować dokument, to ten sam użytkownik, który go stworzył.

Oczywiście inna sprawa, kiedy odczyt danych z bazy nie powinien być publiczny.
Jeśli mamy na przykład do czynienia z korporacyjną wiki, w którym każdy pracownik może modyfikować i odczytywać dane, ale nawet odczyt nie jest publiczny, wtedy wystarczy przypisać odpowiednią rolę do bazy.
Dopiero wtedy, po przypisaniu użytkownika, albo roli, baza przestaje być publiczna!

Można jeszcze pójść krok dalej i wymusić autoryzację na poziomie całego serwera CouchDB.
Wtedy przy każdym requeście (jeśli nie masz odpowiednich ciasteczek), zobaczysz okienko, w którym trzeba podać nazwę użytkownika i hasło.


## Osobna baza dla każdego użytkownika

O ile poprzednie schematy autoryzacji dla CouchDB wydają się intuicyjne, schody zaczynają się wtedy, kiedy chcemy mieć CouchDB, która synchronizuje się z lokalną bazą PouchDB.
Czyli kiedy przechodzimy do modelu _offline-first_.

Jeśli mówimy o jednokierunkowej synchronizacji danych z CouchDB do PouchDB, kiedy jedynie chcemy pobrać sobie lokalne kopie danych i nic nie zmieniać na serwerze, problemu jeszcze nie ma.
Centralna baza może najwyżej okazać się za duża, ale wtedy wystarczy skorzystać z tzw. _[filtered replication](https://pouchdb.com/2015/04/05/filtered-replication.html)_.

Problem pojawia się w momencie, kiedy w twojej aplikacji są zarówno dane, które możesz odczytywać i modyfikować, jak i takie, do których nie masz dostępu.
_Filtered replication_ nie jest dobrym rozwiązaniem na autoryzację; zamiast tego zaleca się tworzyć osobne bazy dla użytkowników lub ról.
Brzmi to dziwnie dla osób wywodzących się ze środowiska baz relacyjnych, gdzie baza danych to było coś ciężkiego i gdzie najczęściej występuje jedna baza na całą aplikację.
W CouchDB bazy danych są jednak bardzo lekkie, a jeden z nawiększych dostarczycieli CouchDB w chmurze -- Cloudant -- już kilka lat temu [pisał](https://mail-archives.apache.org/mod_mbox/couchdb-user/201401.mbox/%3C52CEB873.7080404@ironicdesign.com%3E), że świadczy usługi podmiotom, które mają u nich nawet po sto tysięcy baz.

Rozwiązanie takie jest na tyle popularne, że najpierw CouchDB doczekało się odpowiedniego [pluginu](https://github.com/etrepum/couchperuser/), który automatycznie tworzy prywatne bazy każdemu użytkownikowi, a potem ten plugin został włączony do samego CouchDB.
Tyle że ta zintegrowana wersja pluginu... ciągle jeszcze nie działa w najnowszym CouchDB (zob. odpowiednie tickety i pull requesty: 
[1](https://github.com/etrepum/couchperuser/issues/18),
[2](https://issues.apache.org/jira/browse/COUCHDB-3246),
[3](https://github.com/apache/couchdb-peruser/pull/3),
[4](https://github.com/apache/couchdb/pull/570)).

Ale teraz zastanówmy się, jak wiele możliwości daje taka zmiana podejścia.

Aplikacje mobilne z PouchDB (ostatnio nawet o tym [pisałem](http://dzikowski.github.io/2017/06/19/firebase-realm-i-pouchdb/))?
Żaden problem.
Każde urządzenie dostaje swoją dedykowaną bazę, z którą można się synchronizować.

Firmowa strona wiki?
Każda firma to tak naprawdę osobna rola, i każda rola ma swoją bazę danych.

Wiki, w której użytkownicy mogą występować w wielu rolach, a różne role mają różne uprawnienia?
Cóż, tutaj pewnie trzeba będzie jakoś kombinować z różnymi bazami danych dla ról i funkcją `validate_doc_update`, ale ciągle do zrobienia.
Wadą jest oczywiście utrudnione odwoływanie się do dokumentów, które są w innej bazie danych, no ale CouchDB to przecież baza dokumentowa, a nie relacyjna.

W przypadku, kiedy dane zedytowane przez użytkownika mają być widoczne publicznie, najlepiej replikować je do innej bazy, która jest publiczna.
Nie znalazłem na to konkretnego przykładu, ale jestem sobie w stanie wyobrazić, że mam np. aplikację do pisania artykułów i publikowania ich, i w każdym dokumencie jest atrybut `published` (`true`/`false`).
W momencie kiedy chcę opublikować artykuł, zmieniam mu w bazie użytkownika atrybut `published` na `true`.
Jednocześnie mam włączoną synchronizację z publiczną bazą artykułów, która ma zastrzeżone w `validate_doc_update`, że może przyjąć tylko artykuły, które mają `published: true`.
I teoretycznie wszystko powinno zadziałać.

Wadą takiego rozwiązania jest oczywiście redundancja danych.
W przypadku replikacji jednokierunkowej, tylko z baz użytkowników do bazy publicznej, publiczna baza zawiera kopię części danych z baz użytkowników.
Natomiast w przypadku replikacji dwukierunkowej, czyli tak w zasadzie synchronizacji, prywatne bazy danych użytkowników mają zduplikowaną całą bazę publiczną.


## Inne opcje autoryzacji

W [dokumencie](https://wiki.apache.org/couchdb/PerDocumentAuthorization#Possible_solutions) na wiki CouchDB rozważane są jeszcze inne opcje na autoryzację dostępu na poziomie dokumentu, oprócz trzymania osobnej bazy na każdego użytkownika lub rolę.
Jedną z nich jest trzymanie osobnego, _inteligentnego_ proxy, które dodawałoby do dokumentów dane użytkowników i weryfikowało odpowiednie uprawnienia, i dopiero to proxy mogłoby stukać do samego CouchDB.
Rozwiązanie to jest o tyle fajne, że może dać scentralizowane zarządzanie uprawnieniami, jednak z innej strony troszczkę podpada już pod pisanie własnego backendu.
Nietrudno wyobrazić sobie sytuację, kiedy zechcemy do niego dodać troszeczkę ligiki biznesowej, potem jeszcze troszeczkę i skończymy na rozbudowanej warstwie architektonicznej, którą przecież trzeba jakoś utrzymać.
W dodatku warstwie, która jest rozmyta, mało wyspecjalizowana, eklektyczna.

Inne rozwiązanie, to obok `validate_doc_update`, wykorzystanie funkcji `validate_doc_read`, która sprawdza, czy można odczytać dokument.
Wady takiego rozwiązania są dwie.
Pierwsza: duży narzut na wydajności, funkcję trzeba wywołać przy każdym odczycie.
A druga jest taka, że nie ma tego w oficjalnym CouchDB, są ewentualnie jakieś patche.

I wreszcie trzecia opcja, dla mnie odlot, bo nie znam się za bardzo na tej działce: szyfrowanie dokumentów na poziomie użytkownika.
Idea jest taka, że mamy wspólne bazy, które komunikują się ze sobą _peer-to-peer_, a ty szyfrujesz swoje dokumenty kluczem prywatnym i podpisujesz je kluczem publicznym.
Tylko ci użytkownicy, którzy mają klucz, mogą odszyfrować te dane.

Tak naprawdę wszystkie te rozwiązania albo dokładają developerowi dużo pracy, albo są eksperymentalne.
Najdojrzalsze i najbezpieczniejsze wydaje się trzymanie osobnych baz dla użytkowników.


## Reverse proxy

Zauważ, że CouchDB tak w zasadzie należy traktować bardziej jako RESTowy endpoint niż bazę danych.
Skoro chcemy synchronizować lokalne PouchDB ze zdalną instancją CouchDB, to ta druga musi być dostępna publicznie.
Oczywiste w tym momencie jest, że powinniśmy mieć SSL i prawdopodobnie zablokować dostęp do bazy dla niezalogowanych użytkowników.
Tyle że to nie wszystko, bo pytanie, czy faktycznie będziemy stukać tylko do jednej instancji CouchDB, czy będziemy mieli np. kilka instancji w różnych lokalizacjach, żeby minimalizować _latency_.
Jeśli wszystko pójdzie dobrze i twoja aplikacja będzie się rozwijać, pewnie warto pomyśleć o postawieniu proxy pomiędzy CouchDB a światem zewnętrznym, chociażby po to, żeby potem móc je wykorzystać do przekierowania ruchu.
Albo żeby radzić sobie z potencjalnym atakiem DDoS.

Taką wypowiedź można znaleźć na jednym z [wątków](https://stackoverflow.com/questions/1923352/how-to-secure-couchdb) na Stack Overflow:

> I wouldn't think about any performance issues in a real-world application before security problems go unsolved. Thus even deploying nginx to rewrite URLs is much better than deploying fenceless CouchDB on a public server.


## Serverless

W najprostszym podejściu konto użytkownika aplikacji tak naprawdę będzie równoznaczne z kontem użytkownika w bazie danych.
Rejestracja użytkownika -- jeśli każdy może się zarejestrować -- to dodanie nowego nowego konta do bazy danych (czyli `PUT` do bazy `_users`).
Zalogowanie się jest równoznaczne z zalogowaniem do bazy z podanymi wcześniej nazwą użytkownika i hasłem.
W kolejnych zapytaniach do bazy nie trzeba już podawać nazwy użytkownika i hasła, bo autoryzacja w kolejnych zapytaniach może przebiegać z wykorzystaniem odpowiedniego ciasteczka.
Taki mechanizm opisano w [dokumentacji](http://docs.couchdb.org/en/2.0.0/api/server/authn.html) CouchDB, i taki mechanizm jest też wspierany przez wspomniany wcześniej [plugin](https://github.com/pouchdb-community/pouchdb-authentication) do PouchDB.

Innymi słowy, możemy pracować z bazą danych tak samo, jak pracowalibyśmy ze zwykłym backendem.

Tyle że takie podejście ma też wady.
Przede wszystkim należałoby udostępnić możliwość publicznej modyfikacji bazy `_users`, co nie zawsze może być pożądane.
Dlaczego?
Wyobraź sobie, że nagle zaczynają się rejestrować tysiące losowych użytków, generowanych przez jakieś chińskie serwery, i jeszcze w dokumentach -- rejestracja to przecież `PUT` dokumentu -- znajdują się duże ilości danych.
Możesz sobie pozwolić na coś takiego na produkcji?

Lepszym rozwiązaniem jest wykorzystanie dedykowanej usługi do uwierzytelniania, takiej, jak na przykład [Amazon Cognito](http://docs.aws.amazon.com/cognito/latest/developerguide/what-is-amazon-cognito.html).
Dostajesz _out of the box_ walidację _server-side_ nazw użytkownika, maili, haseł, potwierdzanie adresu e-mail, zabezpieczenia przed DDoS i wiele innych.
Wtedy jednak trzeba jakoś synchronizować użytkowników zarejstrowanych w Amazon Cognito z użytkownikami w CouchDB i trzeba by jakoś umożliwić zalogowanemu użytkownikowi w Cognito połączyć się z jego prywatną bazą.

Z mojego wstępnego _researchu_, wydaje się, że jest to jak najbardziej możliwe.
W CouchDB jest coś takiego jak [proxy authentication](http://docs.couchdb.org/en/2.0.0/api/server/authn.html?highlight=authentication#proxy-authentication), co jest stworzone specjalnie na potrzeby zewnętrznych mechanizmów uwierzytelniania, a Cognito może [wywoływać Lambdy](http://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-identity-pools-working-with-aws-lambda-triggers.html) i poprzez Lambdy pozyskiwać tokeny dostępu do CouchDB.

Takie własnie rozwiązanie mam zamiar wprowadzić do mojego [startera](https://github.com/withspace/serverless-webapp-starter).
Jest w tej chwili rejestracja i logowanie w Amazon Cognito, będzie jeszcze lokalne PouchDB synchronizowane ze zdalnym CouchDB, a w uwierzytelnianiu pomogą mi Lambdy.
Ale to jest jeszcze trochę roboty i wykracza poza zakres tego posta.
Daję sobie na to miesiąc i w międzyczasie będę raportować o postępach.
_Stay tuned_ &#128578;.
