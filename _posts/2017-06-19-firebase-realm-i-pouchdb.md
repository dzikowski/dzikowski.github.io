---
title: Firebase, Realm i PouchDB
layout: post
comments: true
tags: 
description: Ostatnio bawiłem się z React Native i Expo i chciałem dołączyć bazę danych, która działałaby offline. Okazało się, że nie jest to wcale takie proste i znane mi rozwiązania albo nie działają, albo nie działają offline. Odrzuciłem Firebase i Realm, Stanęło na starym dobrym PouchDB.
---

Od jakiegoś czasu koduję sobie apkę mobilną w [React Native](https://facebook.github.io/react-native/) i z pomocą [Expo](https://expo.io/).
Przy czym, wiadomo, React Native jest po to, żeby pisać w JavaScripcie aplikacje na urządzenia mobilne, jednak często kończy się tak, że ostatecznie musisz pisać jakiś kod w Javie albo ObjectiveC, bo czegoś nie dało się przeskoczyć.
Expo natomiast jest taką nakładką na projekt w React Native, która ma na celu zwolnić cię z obowiązku pisania kodu natywnego i utrzymywania dwóch aplikacji.
Zawiera mnóstwo kontrolek, które działają zarówno w Androidzie i iOSie, a także definiuje odpowiednie warstwy abstrakcji na niektóre funkcjonalności systemu, których nie ma bezpośredniego dostępu w React Native.
Jednocześnie Expo jest też plaformą, która daje ci podgląd aplikacji, _live reload_ i możliwość bezpośredniego publikowania w AppStore i Google Play (por. [ten wątek](https://stackoverflow.com/questions/39170622/what-is-the-difference-between-expo-and-react-native) na Stack Overflow).

No więc koduję sobię tę apkę i nadszedł taki moment, że trzeba było wybrać, w jaki sposób trzymać dane aplikacji.

Przy czym ważnym dla mnie kryterium była też kompatybilność z Expo.
Nie chciałbym odłączać projektu od Expo, bo podejrzewam, że jego utrzymanie byłoby trudniejsze.
Jeśli to możliwe, zawsze lepiej mieć jedną wersję aplikacji niż kilka.


## Firebase

Najpierw próbowałem z [Firebase](https://firebase.google.com/).
Pomyślałem sobie, że jest rozwiązanie bardzo popularne, ponoć ma ładne API, autoryzację, funkcje w chmurze, żyć nie umierać.
Zainstalowałem paczkę przez NPM i zabrałem się za autoryzację.
Trzeba było od tego zacząć, ponieważ developerzy Firebase słusznie przewidzieli, że najcześciej dostęp do danych w aplikacji ma użytkownik zalogowany.
Dlatego domyślnie wszystko dzieje się w kontekście zalogowanego użytkownika.

Pierwszy zgrzyt -- okropnie ciężko było mi to zrobić dla React Native.
Mówiąc szczerze, nie doszedłem do końca.
Siedziałem kilka godzin, po czym pomyślałem sobie, że coś tu nie gra.
Przecież React Native wydaje się być całkiem popularny, Firebase też, oba rozwiązania teoretycznie powinny się pięknie uzupełniać, więc niemożliwe, że ich zestawienie zajmuje tyle czasu.
Albo ja robię coś źle, albo jednak to ze sobą tak fajnie nie współgra.
(Firebase ma oczywiście rekomendowany sposób autoryzacji, który jednak nie działa dla React Native; ten [issue](https://github.com/firebase/FirebaseUI-iOS/issues/59) wisi już ponad rok).

Wtedy porzuciłem na chwilę eksperymenty i postanowiłem więcej poczytać informacji o Firebase i przede wszystkim poszukać informacji o tym, dlaczego jest złe.
Zawsze, kiedy chcę nabrać dystansu do jakiegoś rozwiązania, szukam informacji punktujących jego wady &#128521;.

Nie zawiodłem się, w sieci można znaleźć kilka dobrych artykułów podchodzących krytycznie do googlowego produktu (np. [ten](https://crisp.im/blog/why-you-should-never-use-firebase-realtime-database/), [ten](https://www.raizlabs.com/dev/2016/12/firebase-case-study/) i [ten](https://medium.freecodecamp.com/firebase-the-great-the-meh-and-the-ugly-a07252fbcf15), z czego szczególnie ten ostatni jest fajny).
Znaczna część wad tak w zasadzie niekoniecznie dotyczy samego Firebase, ale ogólnie rozwiązań tego typu, np. wady rozproszonych baz NoSQL, których nie da się uniknąć ani w Realm, ani w PouchDB.
Interesujące są za to bardziej _miękkie_ rzeczy:

1. Koszty Firebase czasami mogą być nieprzewidywalne, kiedy wpadnie się w odpowiedni przedział wykorzystania danych.
1. Nie ma łatwego sposobu na wyeksportowanie twoich danych (trzymanych na serwerach, których nie posiadasz). Trzeba pisać maile do Firebase.
1. Firebase jest zamknięte. Kiedyś było coś podobnego, co się nazywało [Parse](https://en.wikipedia.org/wiki/Parse_(company)), zostało kupione przez Facebooka i zamknięte po kilku latach.

Prawda jednak jest też taka, że Firebase pewnie nie jest takie złe, tyle że po prostu nie do końca nadaje się do mojego zastosowania, bo stoi za nim trochę inna filozofia.
Robię aplikację mobilną, która z założenia jest offline, a dopiero potem można będzie ewentualnie włączyć synchronizację danych.
Firebase tymczasem ma bazę danych online, która może sobie radzić z chwilowym brakiem połączenia.
Kiedy nie ma połączenia z siecią, Firebase pozwala na odczyt danych z cache (ostatnie 10 MB danych).
Oprócz tego, może trzymać kolejkę zadań zapisu, żeby wysłać je na serwer, kiedy połączenie zostanie przywrócenie.
Nie jest to baza, która może sprawnie działać offline.

Częściowo piszą o tym w [dokumentacji](https://firebase.google.com/docs/database/android/offline-capabilities#section-offline-behavior), a częściowo takie informacje można znaleźć na forach, na przykład [tutaj](https://groups.google.com/forum/#!topic/firebase-talk/l4BO_V4vfmI), albo [tutaj](https://stackoverflow.com/questions/41765799/how-to-use-firebase-offline-feature-to-sync-database-only-at-app-startup-and-mak).
Cytując wypowiedź z ostatniego linka:

> If you want an offline database, I'd recommend using an offline database. Firebase's realtime database is not that: it is primarily an online database, that continues to work during short to medium term connectivity loss.


## Realm

Pamiętam, że jakiś czas temu na Hacker News pojawił się link do informacji, że [Realm](https://realm.io/) wspiera już React Native, i że ten link zebrał sporo plusików.
Cała Realm Mobile Platform to tak naprawdę dwa produkty: Realm Mobile Database, czyli baza danych, która może działać offline na urządzeniach mobilnych i Realm Object Server, który pod wieloma względami bardzo przypomina Firebase.
Umożliwia synchronizację danych, można się zautoryzować, można nawet definiować _cloud functions_, podobnie jak w produkcie Googla.

![Realm architecture](/assets/img/posts/realm-architecture.png)
(Źródło obrazka: [http://realm.io](https://news.realm.io/news/introducing-realm-mobile-platform/))


Realm ma jednak kilka znaczących zalet, które pod pewnymi względami dają istotną przewagę nad Firebase (fajna [dyskusja](https://www.reddit.com/r/Firebase/comments/55ozf0/realm_mobile_platform_vs_firebase/)):

1. Jest otwarte. Firebase to zamknięta usługa, która chodzi sobie gdzieś w googlowej chmurze, natomiast platformę Realm możesz sobie postawić sam na swoim serwerze.
1. Baza danych w Firebase to tak naprawdę jeden wielki obiekt, po którym trzeba się poruszać, żeby wyciągnąć odpowiednie dane. Z kolei baza danych w Realm to baza zorientowana obiektowo -- jest narzucona struktura dla obiektów, można lepiej odpytywać, nie trzeba pisac mapowania obiektów.
1. Baza danych w Realm jest offline first, dzięki czemu wydaje się dużo lepiej niż Firebase pasować do rozwijanej przeze mnie aplikacji mobilnej.

Realm ma jednak również wady:

1. Wysyła zanonimizowane statystyki korzystania z platformy (przynajmniej tak piszą w [licencji](https://realm.io/legal/developer-license-terms/) dla wersji darmowej).
1. Niejasny jest dla mnie cennik platformy. Wydaje się, że we wszystkich wersjach (darmowej i płatnych) trzeba mieć własny serwer z postawionym Realm Object Server. W wersji darmowej można mieć tylko 3 _cloud functions_. Jeśli chcesz mieć więcej, musisz mieć wersję płatną za minimum 1.5 tys. dolarów miesięcznie! (Realm jest jednak produktem ciągle nowym i to się pewnie będzie zmieniać).
1. Nie działa z Expo, o czym możesz poczytać [tutaj](https://stackoverflow.com/questions/42869022/unknown-execution-context-error-importing-realm-to-expo-react-native-ios-app?rq=1) i [tutaj](https://expo.canny.io/feature-requests/p/support-for-realm) w dość lakonicznych wypowiedziach pracowników Expo. 

> We recently added SQLite, and you can use PouchDB (https://pouchdb.com/) on top of it. We may add Realm in the future if there is enough demand!


## PouchDB

W idealnym świecie, gdyby działała integracja z Expo, gdybym nie obawiał się wysokich kosztów, i gdyby nie było jeszcze gromadzenia informacji o użyciu mojej instancji Object Server, postawiłbym na Realm.
Zdefiniowane schema zapisywanych obiektów, przyjaźnie wyglądające API, możliwość autoryzacji i synchronizacji, wszystko to brzmi bardzo fajnie.

Tyle że jest jeszcze jedno fajne, znane mi rozwiązanie, choć ciągle nie rozumiem, dlaczego wydaje mi się tak mało popularne.
Bo nie ma firmy, która by na nim zarabia i która ładowałaby w marketing?
Bo sam nie użyłem tego nigdy na produkcji i nie wiem, jakie są pułapki?

[PouchDB](https://pouchdb.com/) to tak w zasadzie _tylko_ baza danych, jednak ma mnóstwo zalet, które świetnie dostosowują ją do wymagań mojej _offline-fist_ aplikacji mobilnej w React Native.

1. Jest rozwiązaniem otwartym, dojrzałym i darmowym.
1. Działa _offline_ i można ją opcjonalnie synchronizować z dowolną bazą wspierającą protokół CouchDB.
1. Działa z React Native i Expo.
1. Jest rozwiązaniem baaaardzo elastycznym z licznymi pluginami.

Żeby jednak wyjaśnić, czym tak naprawdę jest PouchDB, nie sposób nie odnieść się do CouchDB i głównej zalety CouchDB, którą jest jej protokół synchronizacji.
Wszystkie bazy danych i inne rozwiązania, implementujące ten protokół, mogą się ze sobą synchronizować, i to na zasadzie _master-master_, bez żadnych uprzywilejowanych _node'ów_.
PouchDB z założenia wspiera ten protokół, dzięki temu może się synchronizować tak samo, jak CouchDB.

Druga sprawa, to to, że PouchDB powstało po to, aby działać w przeglądarce internetowej.
To wymusiło specyficzną konstrukcję biblioteki -- PouchDB to tak w zasadzie API, czy też fasada na różne mechanizmy zapisywania danych w przeglądarce.
Wspiera różnego rodzaju bazy w przeglądarkach: [IndexedDB](https://en.wikipedia.org/wiki/Indexed_Database_API), [WebSQL](https://en.wikipedia.org/wiki/Web_SQL_Database), czy [LevelDB](https://en.wikipedia.org/wiki/LevelDB), a także bezpośredni zapis do zdalnej bazy z protokołem CouchDB.

> PouchDB attempts to provide a consistent API that "just works" across every browser and JavaScript environment, and in most cases, you can just use the defaults.

![PouchDB architecture](/assets/img/posts/pouchdb-adapters.svg)
(Źródło cytatu i obrazka: [https://pouchdb.com](https://pouchdb.com/adapters.html))

Ponieważ samo PouchDB jest takie elastyczne, możliwe było sworzenie wersji, która działała na React Native ([pouchdb-react-native](https://github.com/stockulus/pouchdb-react-native)).
Ma to wszystko sens, ponieważ skoro piszemy aplikacje mobilne w JavaScripcie, to dlaczego by nie korzystać z bibliotek, które działają w przeglądarkach?
Samo PouchDB nie działa bezpośrednio w React Native, ale _podpimpowane_ wspomnianą biblioteką już świetnie sobie radzi.

Wersja ta korzysta z [AsyncStorage](https://facebook.github.io/react-native/docs/asyncstorage.html), które jednak ma ustawiony [limit](https://github.com/facebook/react-native/issues/3387) 6MB.
Można jednak w stosunkowo prosty sposób skorzystać z adaptera na SQLite, które niedawno zostało dorzucone do Expo.

_Simple is not easy_, trochę czasu mi zajęło, żeby dojść do tego prostego rozwiązania, dlatego od razu podaję przykład, bo nie znalazłem takiego w sieci (będziesz potrzebować bibliotek: [pouchdb-react-native](https://github.com/stockulus/pouchdb-react-native) oraz [pouchdb-adapter-react-native-sqlite](https://github.com/craftzdog/pouchdb-adapter-react-native-sqlite) i aplikacji na Expo):

```javascript
import PouchDB from 'pouchdb-react-native';
import {SQLite}  from 'expo';
import SQLiteAdapterFactory from 'pouchdb-adapter-react-native-sqlite';

const SQLiteAdapter = SQLiteAdapterFactory(SQLite);
PouchDB.plugin(SQLiteAdapter);

const db = new PouchDB('my.db', {adapter: 'react-native-sqlite'});
```

Ciekawostka: kiedy sam to implementowałem kilka dni temu, ta druga biblioteka nie działała.
Zaimportowałem więc kod źródłowy (nie ma tego dużo), trochę się pomęczyłem, naprawiłem, zaczęło działać.
Chciałem się podzielić i zrobić issue, ale okazało się, że dokładnie godzinę wcześniej problem został [naprawiony](https://github.com/craftzdog/pouchdb-adapter-react-native-sqlite/issues/3).
Szansa na _commitment_ przeszła mi koło nosa &#128521;.

---

No dobra, ale jakie są wady tego całego podejścia z PouchDB?

Po pierwsze, zauważ, jak bardzo różna jest ta sekcja od sekcji o Firebase i o Realm.
Tam pisałem bardziej ogólnie i miękko, tutaj znajdziesz dużo technicznych konkretów.
Może to wynikać na przykład z tego, że lepiej orientuję się w PouchDB niż w Firebase i Realm, albo że tutaj dalej zaszedłem w implementacji i natrafiłem na różne problemy, które w przypadku tamtych narzędzi pozostały jeszcze przede mną.
Może jednak też być tak, że nad takimi niskopoziomowymi zagadnieniami w ogóle nie musiałbym się zastanawiać, gdybym skorzystał z Firebase i Realm, bo to są po prostu rozwiązanie bardziej kompleksowe i wygodniejsze w użyciu.

Po drugie, zarówno Firebase, jak i Realm, dają dodatkowo platformę z autoryzają, synchronizacją i jakimś podstawowym poziomem bezpieczeństwa.
W przypadku konfiguracji PouchDB/CouchDB nie mam plaformy, tylko kilka klocków, które będę musiał sam poskładać w całość.
Istnieją jakieś rozwiązania, które mogą zapewnić część funkcjonalnoći, np. [Cloudant](https://cloudant.com/), albo nawet projekt open source z ambicjami stania się następcą Firebase -- [Hoodie](http://hood.ie/) (zob. też, jak sami [porównują się](http://faq.hood.ie/#/question/50707429) z Firebase), jednak to ciągle nie jest to; to tak jakby porównywać Libre Office z Ms Office &#128521;.

Wreszcie trzecia kwestia -- synchronizacja.
Jest ona oczywiście świetnie rozwiązana i sprawdzona, problem za to polega na tym, że synchronizacja jest na poziomie bazy.
W związku z tym stosuje się nieco nietypowe podejścia, np. osobna baza dla każdego użytkownika, albo roli.
Nie ma z tym problemów wydajnościowych, bo bazy CouchDB są bardzo lekkie, jednak mogą być problemy koncepcyjne, kiedy okaże się, że jakieś dane mają być współdzielone pomiędzy użytkownikowi, albo rolami.
Jest coś takiego jak _selective replication_, tyle że ono służy raczej do innych rzeczy niż zapewnienie _security_.

W ogóle bezpieczeństwo i dostęp do danych w _stacku_ PouchDB/CouchDB to jest całkiem ciekawe zagadnienie i wymaga trochę przestawienia swojego sposobu myślenia.
Ale to już materiał na odrębny wpis, na razie odsyłam tylko [tutaj](https://github.com/pouchdb-community/pouchdb-authentication#couchdb-authentication-recipes).


## Podsumowanie

Zamiast jednoznacznego posta z tezą _korzystajcie z PouchDB, bo jest najlepsze_, wyszło jak zawsze w IT: _to zależy_.
Dla moich potrzeb, dla aplikacji, którą tworzę, rozpoczęcie przygody z PouchDB wydaje się najlepszym rozwiązaniem.
Szukałem czegoś offline dla Expo z możlwością dalszego rozwoju, a pomijając kwestie miękkie, finansowe i prawne, ani Firebase, ani Realm nie były w stanie mi tego zaoferować.

