---
title: Współbieżne zmywanie naczyń
layout: post
tags: 
description: |
    Meetup Concurrency Lightning Tasks o różnych podejściach do współbieżności w Tech Space zapowiadał się bardzo interesująco. 
    Sześć prezentacji w dwie godziny (które rozciągnęły się ostatecznie do trzech), istne bombardowanie, może niekoniecznie czymś dla mnie nowym, ale systematyzującym posiadaną wiedzę.
    Niemniej jednak dowiedziałem się kilku nowych rzeczy.
---



## Multithreading, parallelism, concurrency

Myślą przewodnią były różne podejścia do współbieżności (_concurrency_), równoległego wykonywania zadań (_parallelism_), i wielowątkowości (_multithreading_).
Już na samym początku zaznaczone zostało, że to są różne rzeczy, a ja może przy okazji pokażę kilka obrazków, na których widać te różnice.
Obrazki pochodzą z wpisu [Understanding Async, Non-Blocking, Concurrent, Parallel and More](https://www.typesafe.com/blog/7-ways-washing-dishes-and-message-driven-reactive-systems) na blogu Typesafe, a słowa kluczowe, które pozwoliły mi go ponownie odnaleźć, to _concurrency_, _parallelism_, _multithreading_ i... _dishwashing_.

Na początku jest proces samodzielnego zmywania naczyń.
Czyli po kolei: biorę talerze, spłukuję je wodą, potem zdrapuję resztki jedzenia, jeszcze raz spłukuję, a potem wstawiam do zmywarki.
Zauważ, że biorę po kilka talerzy, więc już dokonuję jakiejś tam optymalizacji.
(Wiem, możesz robić całkiem inaczej, sam robię inaczej i ciągle nie mam zmywarki, ale przykład przykładem, pochodzi z bloga Typesafe).

![Pipeline](http://downloads.typesafe.com/website/blog-images/01-synchronous-and-sequential-pipeline.png)

Co mogę zrobić?
Wprowadzić nowy wątek, żeby zmywanie przebiegało szybciej.
Przechodzimy do _multithreading_.

![Multithreading](http://downloads.typesafe.com/website/blog-images/03-asynchronous-and-blocking.png)

Mamy już kilka wątków, czyli spełniamy definicję wielowątkowości.
A że jeden czeka i nie może dopchać się do procesu zmywania naczyń?
Zatrzymajmy się na chwilę.

Taka sytuacja może mieć miejsce, kiedy mamy tylko jeden procesor, albo kiedy nie do końca dobrze zaprojektowaliśmy aplikację.
Może być jednocześnie obsługiwanych wiele wątków, ale tylko jeden w danym czasie faktycznie coś robi.
Czyli może dojść do sytuacji, kiedy mamy aplikację, która jest wielowątkowa, ale nieefektywnie korzysta z wielu wątków.
Pomyśleliśmy o wielowątkowości (_multithreading_), ale nie pomyśleliśmy o zrównolegleniu operacji (_parallelism_).

Żeby jeszcze bardziej uwypuklić tę różnicę pomiędzy wielowątkością, a przetwarzaniem równoległym: zauważ, że możemy mieć aplikacją wielowątkową na maszynie jednoprocesorowej (z jednym wątkiem procesora). Wtedy też, mimo wielowątkowości, nie może być mowy o przetwarzaniu równoległym.

Na obrazku mężczyzna być może poczeka, aż kobieta włoży do zmywarki część naczyń (aż skończy wykonywać sekwencję działań), a potem się zamienią.
Jednak ciągle nie mogą wykonywać tych czynności równocześnie.
Co można zmienić?

Przechodzimy na nowy model, udaje nam się zmywać naczynia we dwójkę.
Jeden z prostych przykładów, jak możemy do tego dojść: _fork_ i _join_, znany na przykład z Javy.

![ForkJoin](http://downloads.typesafe.com/website/blog-images/06-fork-and-join.png)

Ponieważ udało nam się wygospodarować dwa stanowiska do zmywania naczyń, mamy wreszcie przetwarzanie równoległe (_parallelism_).
Dwa wątki (mężczyzna i kobieta), w tym czasie robią to samo.
Trzeba tylko pamiętać o tym, żeby włożyć wszystko do jednej zmywarki.

A współbieżność?
To coś bardziej ogólnego.

Współbieżność nie wymaga faktycznie jednoczesnego przetwarzania zadań.
Można mówić nawet o współbieżności na jednym procesorze, gdzie nie ma możliwości wykonywania kilku operacji jednocześnie.
W zasadzie można nawet znaleźć opinie, że wielowątkowość i współbieżność to to samo.
A nie do końca.


## Meetup #96

[Meetup #96](http://www.meetup.com/sc-krk/events/225489875/) składał się w sumie z siedmiu prezentacji.
Dla porządku poniżej wrzucam linki do poszczególnych pojęć i prezentujących:

 1. Prezentacja wprowadzająca -- [Tomasz Borek](https://lafkblogs.wordpress.com/)
 2. [Actor Model](http://www.meetup.com/sc-krk/events/114314972/) -- [Marcin Piotr Miszczyk](http://www.meetup.com/sc-krk/members/65878482/)
 3. [Communicating Sequential Processes](http://www.meetup.com/sc-krk/events/161945322/) -- [Marcin Kostrzewa](https://twitter.com/mmkostrzewa)
 4. [Software Transactional Memory](https://en.wikipedia.org/wiki/Software_transactional_memory) -- [Konrad Garus](http://squirrel.pl/blog/)
 5. [Threads and Mutexes](https://en.wikipedia.org/wiki/Thread_(computing)) -- [Tomasz Borek](https://lafkblogs.wordpress.com/)
 6. [Data Parallelism](https://en.wikipedia.org/wiki/Data_parallelism) -- [Andrzej Brożek](http://www.craftinity.com/)
 7. [Lambda Architecture](http://www.meetup.com/sc-krk/events/217640382/) -- [Norbert Wójtowicz](https://twitter.com/pithyless)

Prezentacje są raczej w kolejności, w jakiej się pojawiały, nie jestem tylko pewien czwórki i piątki, być może były odwrotnie.


## Actor model

Jeśli rozważamy współbieżność, warto wprowadzić jeszcze jedno pojęcie, pojęcia asynchroniczności.
W uproszczeniu: jeśli coś jest synchroniczne, czekamy na rezultat.
Jeśli coś jest asynchroniczne, możemy poczekać na część rezultatu, potem na kolejną część i tak dalej.

Kiedy na początku tego wpisu pokazałem dwa obrazki, jeden miał podpis "synchroniczny", a drugi "asynchroniczny".
Zobacz jeszcze raz:

![Pipeline](http://downloads.typesafe.com/website/blog-images/01-synchronous-and-sequential-pipeline.png)

![Multithreading](http://downloads.typesafe.com/website/blog-images/03-asynchronous-and-blocking.png)

Zwróć uwagę, że oba procesy nie są wykonywane równolegle.
Tym, co je tak naprawdę różni jest to, że w drugim przypadku zmywający mogą się zmienić.
Zatem nie musimy przeprowadzić procesu zmywania naczyń od początku do końca.
Nie musimy zrobić wszystkiego naraz.

W ten _podział na kawałki_ można wejść głębiej i usprawnić proces zmywania naczyń.
Można na przykład rozdzielić poszczególne czynności z procesu zmywania naczyń, o tak:

![Actor Model](http://downloads.typesafe.com/website/blog-images/05-asynchronous-and-non-blocking-and-productive.png)

Ten przykład można łatwo rozpisać na modelu aktorowym.
Już chyba samo nasuwa się, że mamy dwóch aktorów, kobietę (```K```) i mężczyznę (```M```).
Ci aktorzy mogą obsługiwać zdarzenia, które do nich docierają.
W naszym procesie zmywania naczyń zdarzeniami będą brudny talerz (```t_br```) i talerz wstępnie oczyszczony (```t_wo```)

Kobieta bierze brudne talerze, wstępnie je płucze, usuwa resztki jedzenia i odkłada.
Mężczyzna bierze wstępnie oczyszczone talerze, jeszcze raz je płucze i wkłada do zmywarki.
Czyli przekładając to na język aktorów: ```K``` przyjmuje zdarzenia ```t_br```, przetwarza je na zdarzenie ```t_wo``` i przesyła ```M```.
```M``` przyjmuje zdarzenia ```t_wo``` i je przetwarza.

Oczywiście poprzedni przykład (kiedy mężczyzna czeka) też można opisać na modelu aktorowym.
Znów mamy dwóch aktorów, ```K``` i ```M```, i mamy też zdarzenia ```t_br```, które każdy z aktorów może przeprowadzić _do końca_.
Więcej, a w zasadzie wszystko, dzieje się _wewnątrz_ aktorów.


## (dygresja osobista) 

Kiedy po raz pierwszy, w sumie już jakieś 6-7 lat temu, zetknąłem się z modelem aktorowym programowania współbieżnego, zapragnąłem nauczyć się Erlanga. Jeszcze jako student, przeładowany byłem nie do końca zrozumiałymi pojęciami wątków, muteksów i tym podobnych. Kiedy dowiedziałem się o lekkich wątkach i przesyłaniu komunikatów, zamiast synchronizacji wątków, doznałem obiawienia.

W zasadzie od tego zaczęła się moja historia ze Scalą. Kilka miesięcy potem zrobiłem pierwszy eksperyment, porównujący dwie technologie. Wyświetlałem na standardowym wyjściu komunikaty pochodzące z różnych wątków, takie rozproszone Hello World. W Javie to były chyba trzy klasy i ponad dwieście linijek kodu. W Scali -- czterdzieści osiem linijek. (Sprawdziłem na Wikipedii: pierwsza wersja Akka wyszła w lipcu 2009, więc pewnie wydarzyło się to wszystko jakoś w 2010 roku).

Po dwóch latach, kiedy w zasadzie nie miałem ze Scalą kontaktu, zrobiłem na Courserze Functional Programming Principles in Scala, które diametralnie zmieniło moje podejście do programowania. Jakiś czas później skończyłem Reactive Programming, który był częsciowo poświęcony Akka, potem byłem już na prezentacjach z Akka kilka razy, raz nawet prowadzonej przez samego Jonas Bonéra, kiedy przygotowywał się przed Geekonem w Krakowie, więc trudno powiedzieć, żebym dowiedział się czegoś nowego.

Niemniej jednak podobała mi się prezentacja o Aktorach.
Marcin Piotr Miszczyk pokazywał proste programiki w Erlangu i opowiadał o zaletach korzystania z tego modelu współbieżności.


## To co z tą współbieżnością?

Przekładając wprost na polski słowa z jednego z wątków na [Stack Overflow](http://stackoverflow.com/questions/1050222/concurrency-vs-parallelism-what-is-the-difference): Współbieżność jest wtedy, kiedy dwa zadania mogą się rozpocząć, trwać i zakończyć w nakładających się na siebie przedziałach czasu.
(Zauważ, że to wcale nie znaczy, że coś musi się dziać równocześnie).

Wróćmy do przykładu z _fork join_:

![ForkJoin](http://downloads.typesafe.com/website/blog-images/06-fork-and-join.png)

Dla tego przykładu możemy rozpatrywać współbieżność przede wszystkim w kontekście tego, co się stanie, kiedy jednocześnie mężczyzna i kobieta będą chcieli włożyć naczynia do zmywarki.
To jest potencjalne miejsce konfliktu, kiedy dwa wątki potrzebują w tym samym czasie dostępu do tego samego zasobu.
Dany system będzie współbieżny (przypominam: _concurrent_), kiedy będzie mógł sobie z taką sytuacją poradzić.


Wróćmy jeszcze do przykładu z podziałem odpowiedzialności, na którym opisałem na modelu aktorowym:

![Actor Model](http://downloads.typesafe.com/website/blog-images/05-asynchronous-and-non-blocking-and-productive.png)

Zarówno w _fork join_, jak i tutaj można jeszcze mówić o współbieżności na poziomie całego procesu.
Czy może dojść do sytuacji, kiedy do procesu wchodzą nowe naczynia, a poprzednie jeszcze nie znalazły się w zmywarce?
Jeśli mogą, możemy mówić o współbieżności.

Gdybym miał w kilku prostych słowach podumować różnicę pomiędzy tymi trzema pojęciami:

  * Wielowątkowość (_multithreading_) -- zdolność do wykonywania w wielu wątkach (nacisk na **izolację**).
  * Przetwarzanie równoległe (_parallelism_) -- proces równoczesnego wykonywania operacji (nacisk na **równoczesność**).
  * Współbieżność (_concurrency_) -- zdolność do obsługi wielu zapytań jednocześnie (nacisk na **komunikację**).

I na koniec jeszcze dwa pytania, nad którymi możesz się zastanowić:
_Co może być współbieżne i wielowątkowe, ale nie ma w nim przetwarzania równoległego?_
_Co może być współbieżne, ale ani nie jest wielowątkowe, anie nie ma w nim przetwarzania równoległego?_ 


## O kilku innych prezentacjach

W prezentacji **Communicating Sequential Processes** było o czymś, czego jeszcze nie znałem, a tylko gdzieś obiło mi się o uszy; o modelu programowania współbieżnego, gdzie anonimowe nie są komunikaty, ale aktorzy.
W taki sposób działają właśnie _channels_ w Go. 
Nie miałem do tej pory jeszcze rozeznania w tym podejściu, więc podążanie za tokiem prezentacji okazało się stosunkowo trudne.
Źródło, które wydaje się być dobre na początek, to ta [prezentacja](http://concur.rspace.googlecode.com/hg/talk/concur.html#landing-slide) i [wideo](https://blog.heroku.com/archives/2013/2/24/concurrency_is_not_parallelism) do niej.

W **Threads and Mutexes**, która też była dość ciekawa, dowiedzieliśmy ponownie, że programowanie wielowątkowe jest strasznie trudne i bardzo łatwo w nim coś zepsuć.

**Lambda Architecture** to była prezentacja z gatunku tych inspirujących.
Mało tekstu, dużo obrazków i dużo ciekawego opowiadania.
Podejście całkiem inne niż w pozostałych prezentacjach, bardziej ogólne.
Dużo materiałów można znaleźć na stronie innego spotkania: [Meetup #85 - Lambda Architecture](http://www.meetup.com/sc-krk/events/217640382/).


## Do poczytania

  * O zmywaniu naczyń z blogu Typesafe: [Understanding Async, Non-Blocking, Concurrent, Parallel and More](https://www.typesafe.com/blog/7-ways-washing-dishes-and-message-driven-reactive-systems)
  * Wideo [Concurrency is not Parallelism](https://blog.heroku.com/archives/2013/2/24/concurrency_is_not_parallelism) z konferencji Waza 2013 (+ [prezentacja](http://concur.rspace.googlecode.com/hg/talk/concur.html#landing-slide))
  * Dyskusja na [Stack Overflow](http://stackoverflow.com/questions/1050222/concurrency-vs-parallelism-what-is-the-difference)
  * Między innymi o tym, jak się ma _concurrency_ do _mulithtreading_: [Concurrency vs Multi-threading vs Asynchronous Programming : Explained](http://codewala.net/2015/07/29/concurrency-vs-multi-threading-vs-asynchronous-programming-explained/)
  * O mitologii, która kryje się za Akka: [Akka (spirit)](https://en.wikipedia.org/wiki/Akka_(spirit)). Serio. Wiedzieliście, że Akka to duch w mitologii fińskiej i lapońskiej?


## Przykładowe odpowiedzi na pytania

 1. Np. system operacyjny na maszynie jednoprocesorowej.
 2. Np. JavaScript w przeglądarce internetowej (nie zawsze, ale _generalnie_; por: [Stack Overflow](http://stackoverflow.com/questions/2734025/is-javascript-guaranteed-to-be-single-threaded)). Albo sposób, w jaki piszę tego bloga: jednocześnie mogę zajmować tylko jednym wpisem, choć mam kilka niedokończonych.

