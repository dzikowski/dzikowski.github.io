---
title: Wydarzenia w kwietniu 2015
layout: post
tags: 
description: |
    Od ponad miesiąca przebywam na kontrakcie w Krakowie, dzięki czemu miałem okazję liznąć tamtejszego środowiska IT.
    Byłem na kilku bardzo ciekawych spotkaniach branżowych, a&nbsp;w&nbsp;międzyczasie odwiedziem jeszcze konferencję Scalar w Warszawie.
    Innymi słowy: trochę się działo.
---




Meetup: We Are Anonymous
---

Już drugiego kwietnia byłem na [spotkaniu](http://www.meetup.com/DDD-KRK/events/221412263/) krakowskiej grupy DDD.
Tematyka tego spotkania była stosunkowo miękka.
Jarosław Pałka z niesamowitą pasją opowiadał o swoich wieloletnich doświadczeniach w IT na różnych stanowiskach.
Była to jazda bez trzymanki: tyle charyzmy i bezkompromisowości rzadko spotyka się u prowadzących prezentacje.
W dodatku jedna z głównych pojawiających się myśli jest bardzo przyjemna: to my, developerzy, (s)tworzymy przyszłość.

Slajdy ze spotkania dostępne są [tutaj](http://www.slideshare.net/kcrimson/we-are-crowd-we-are-anonymous).
Zachęcam też do przeczytania związanego ze spotkaniem [postu](https://geekyprimitives.wordpress.com/2015/01/20/we-are-crowd-we-are-anonymous/#more-305) na blogu Jarosława Pałki.
Ale pamiętaj, że czytasz go na własną odpowiedzialność:

> You read this post on your own responsibility.
> I struggled since Friday two weeks ago to actually get it in shape and post it.
> I have compressed a year long of frustrations and anger.

Przyznaję, że było to moje pierwsze tego typu spotkanie w ogóle.
Ale tak pouczające i jednocześnie inspirujące, że najwyraźniej zostanę stałym uczestnikiem meetupów.



Meetup: Testowanie mikroserwices
---

Czternastego kwietnia w bardzo ładnym miejscu, na barce [Arlina](https://www.facebook.com/barkakrakow) odbyło się [spotkanie](http://www.meetup.com/KraQA-pl/events/221674206/?a=co2_grp&gj=co2&rv=co2) grupy KraQA: Testowanie systemu rozwijanego na usługach Amazon Cloud Computing.
Amazona było tam niewiele, ale sporo informacji o mikroserwisach, rozwoju i utrzymaniu architektury opartej o usługi sieciowe REST.
Sporo wiedzy zdroworozsądkowej, którą można wyczytać na wielu blogach, ale też sporo ciekawostek i rzeczywistych przykładów.



Warsztaty w Tech Space
---

Dwa dni później, szesnastego kwietnia byłem na [warsztatach](http://www.meetup.com/Quality-Keepers/events/221887932/) z Gatling, napisanego w Scali narzędzia do przeprowadzania testów obciążeniowych.

![Na warsztatach w Tech Space](/assets/img/posts/gatling.jpg)

Choć samo spotkanie było ciekawe i sporo można się było nauczyć, to wszystko i tak zostało przyćmione przez miejsce, w którym się odbyło.

W Krakowie znajduje się całkiem spory oddział firmy [Base](https://getbase.com/) z Paolo Alto.
Ponieważ w najbliższym czasie z Krakowa ma się wyprowadzić Google, Base postanowiło przejąć wizerunek firmy innowacyjnej i przyjaznej programistom.
Powstała inicjatywa [Tech Space](http://www.gototech.space/), w ramach której firma przeznaczyła niemal cały parter swojego budynku na spotkania developerów.
Piwo i pizza sponsorowane przez Base.

Obejrzyj sobie na Facebooku [zdjęcia](https://www.facebook.com/media/set/?set=a.584274025049103.1073741832.555756434567529&type=1) z warsztatów i zobacz, jak fajnie zostało zorganizowane to miejsce.
A może szukasz pracy?
Cóż, Base rekrutuje w Krakowie programistów znających Javę, Pythona i Ruby.



Konferencja Scalar
---

Tak jak pisałem -- w międzyczasie -- w Warszawie była konferencja [Scalar](http://scalar-conf.com/), poświęcona w całości technologiom związanym z językiem Scala.
Jedenastego kwietnia zerwałem się o trzeciej w nocy na pociąg do Warszawy, a do Krakowa wróciłem dopiero przed północą.
Było warto.

Choć zdarzały się słabsze momenty, konferencja stała na bardzo wysokim poziomie.
Niektóre prezentacje były równie porywające, jak te, które można obejrzeć na TED.
Większość z nich można obejrzeć na [YouTube](https://www.youtube.com/channel/UCDHLL2QvdpCytAfBiwUeKgg/search?query=scalar), choć niestety nie ma tam mojej ulubionej o monadach, podczas której wybuchy śmiechu wzbudził slajd z Rajeshem Koothrappali, mówiącym "this application sucks" o aplikacji mobilnej służącej do prezentowania informacji o dziewczynach bohaterów The Big Bang Theory.
Aplikacja dla Rajesha wywalała NullPointerException.

Z tych prezentacji, które są na Youtube polecam szczególnie trzy.

(1) [The Mutability Matrix of Pain](https://www.youtube.com/watch?v=yy-LnEAHTkg&list=PL8NC5lCgGs6N5_mHAx9LjOO1NBEADQ4cP&index=5), prezentowana przez Jamie Allena z Typesafe, o budowie JVM i o tym, dlaczego mutowalność często jest czymś niepożądanym.

(2) [Function-Passing Style Typed, Distributed Functional Programming](https://www.youtube.com/watch?v=PwKX02d4N4Q&index=4&list=PL8NC5lCgGs6N5_mHAx9LjOO1NBEADQ4cP), prezentowana przez Heather Miller, także z Typesafe, o stosunkowo niskopoziomowych zagadnieniach związanych ze statycznym typowaniem w systemach rozproszonych.
Możesz kojarzyć Heather Miller z forów kursu [Functional Principles in Scala](https://www.coursera.org/course/progfun), a jeśli zaglądasz czasem do ScalaDocs, na pewno widziałeś (widziałaś) coś, co napisała.

(3) I wreszcie, dla miłośników Akka, świeże wiadomości co się dzieje w tej technologii -- krakowska gwiazda, znów z Typesafe, Konrad "Ktoso" Malawski i [Fresh from the Oven: Akka gets Typed](https://www.youtube.com/watch?v=WnTSuYL4_wU&list=PL8NC5lCgGs6N5_mHAx9LjOO1NBEADQ4cP&index=7).
W tej prezentacji jedna rzecz mnie zaskoczyła bardzo negatywnie.
Do tej pory ```sender``` w aktorach Akka był zaimplementowny jako ```var```, jako zmienna.
Wiedzieliście o tym?!

W każdym razie w Scali dzieje się sporo, technologie się dynamicznie rozwijają (choć zyskują popularność nieco wolniej, niż bym chciał) i pewnie za jakiś czas nadejdzie ten moment, kiedy całkiem -- zawodowo -- przestawię się na Scalę.



