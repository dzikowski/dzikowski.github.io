---
title: Współbieżne zmywanie naczyń
layout: post
tags: 
description: |
    Meetup Concurrency Lightning Tasks o różnych podejściach do współbieżności w Tech Space zapowiadał się bardzo interesująco. 
    Sześć prezentacji w dwie godziny (które rozciągnęły się ostatecznie do trzech), istne bombardowanie, może niekoniecznie czymś dla mnie nowym, ale systematyzującym posiadaną wiedzę.
    Niemniej jednak dowiedziałem się kilku nowych rzeczy.
---



## Concurrency, parallelism, multithreading

Myślą przewodnią były różne podejścia do współbieżności (_concurrency_), równoległego wykonywania zadań (_parallelism_), i wielowątkowości (_multithreading_).
Już na samym początku zaznaczone zostało, że to są różne rzeczy, a ja może przy okazji pokażę kilka obrazków, na których widać te różnice.
Obrazki pochodzą z wpisu [Understanding Async, Non-Blocking, Concurrent, Parallel and More](https://www.typesafe.com/blog/7-ways-washing-dishes-and-message-driven-reactive-systems) na blogu Typesafe, a słowa kluczowe, które pozwoliły mi go ponownie odnaleźć, to _concurrency_, _parallelism_, _multithreading_ i... _dishwashing_.


### Multithreading

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

Taka sytuacja może mieć miejsce, kiedy mamy tylko jeden procesor.
Może być jednocześnie obsługiwanych wiele wątków, ale tylko jeden w danym czasie faktycznie coś robi.
Czyli może dojść do sytuacji, kiedy mamy aplikację ???

Na obrazku mężczyzna być może poczeka, aż kobieta włoży do zmywarki część naczyń (aż skończy wykonywać sekwencję działań), a potem się zamienią.
Jednak ciągle nie mogą wykonywać tych czynności równocześnie.

http://www.danielmoth.com/Blog/threadingconcurrency-vs-parallelism.aspx

### Parallelism



### Concurrency




https://www.cs.cmu.edu/~crary/819-f09/Backus78.pdf 

Software Transactional Memory
 - Konrad Garus 

## Actor Model 

Kiedy po raz pierwszy, w sumie już jakieś 6-7 lat temu, zetknąłem się z tym modelem programowania współbieżnego, zapragnąłem nauczyć się Erlanga. Jeszcze jako student, przeładowany byłem nie do końca zrozumiałymi pojęciami wątków, muteksów i tym podobnych. Kiedy dowiedziałem się o lekkich wątkach i przesyłaniu komunikatów, zamiast synchronizacji wątków, doznałem obiawienia.

W zasadzie od tego zaczęła się moja historia ze Scalą. Kilka miesięcy potem zrobiłem pierwszy eksperyment, porównujący dwie technologie. Wyświetlałem na standardowym wyjściu komunikaty pochodzące z różnych wątków, takie rozproszone Hello World. W Javie to były chyba trzy klasy i ponad dwieście linijek kodu. W Scali -- czterdzieści osiem linijek. (Sprawdziłem na Wikipedii: pierwsza wersja Akka wyszła w lipcu 2009, więc pewnie wydarzyło się to wszystko jakoś w 2010 roku).

Po dwóch latach, kiedy w zasadzie nie miałem ze Scalą kontaktu, zrobiłem na Courserze Functional Programming Principles in Scala, które diametralnie zmieniłem podejście do programowania. Jakiś czas później skończyłem Reactive Programming, który był częsciowo poświęcony Akka, potem byłem już na prezentacjach z Akka kilka razy, raz nawet prowadzonej przez samego Jonas Bonéra, kiedy przygotowywał się przed Geekonem w Krakowie, więc trudno powiedzieć, żebym dowiedział się czegoś nowego.

Niemniej jednak podobała mi się ta prezentacja. Marcin Piotr Miszczyk pokazywał proste programiki w Erlangu i opowiadał o zaletach korzystania z tego modelu współbieżności.



## Communicating Sequential Processes

W tej prezentacji było o czymś, czego jeszcze nie znałem, a tylko gdzieś obiło mi się o uszy; o modelu programowania współbieżnego, gdzie anonimowe nie są komunikaty, ale aktorzy.
W taki sposób działają właśnie _channels_ w Go.

Nie miałem do tej pory jeszcze rozeznania w tym podejściu, więc podążanie za tokiem prezentacji okazało się stosunkowo trudne.



## Threads and Mutexes
 - Tomasz Borek 

## Data Parallelism
 - Andrzej Brożek 

## Lambda Architecture
 - Norbert Wójtowicz

To była prezentacja z gatunku tych inspirujących.
Mało tekstu, dużo obrazków i dużo ciekawego opowiadania.


Czego zabrakło?
Futures and Promises



https://en.wikipedia.org/wiki/Akka_(spirit) 

