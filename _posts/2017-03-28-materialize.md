---
title: Rezygnuję z Material-UI
layout: post
comments: true
tags: 
category: daj-sie-poznac
description: Ostatnio w projekcie zacząłem tworzyć widoki na logowanie i rejestrację. I jak to często bywa, kiedy zaczyna się trochę więcej pracować z pewną biblioteką, pryska czar pierwszego wrażenia i okazuje się, że biblioteka nie jest jednak taka fajna. Miałem tak właśnie z Material-UI, i to do tego stopnia, że postanowiłem ją zmienić.
---

Tak jak pisałem już [wcześniej](http://dzikowski.github.io/daj-sie-poznac/2017/03/16/material-design/), wybrałem [Material-UI](http://www.material-ui.com/), ponieważ miało dużo gwiazdek na GitHubie i fajne przykłady.
To wszystko prawda, sporo nowych rzeczy nauczyłem się na samych przykładach.
Fajne było też to, że miałem od razu do wykorzystania komponenty Reacta, a nie musiałem obudowywać HTML, tak jak podejrzewam, że robi się w przypadku [Material Components](https://github.com/material-components/material-components-web).
Mimo jednak tych kilku dobry rzeczy, mam do Material-UI trzy główne zarzuty.

Po pierwsze komponenty przycisków można wykorzystać tylko w jeden sposób, przewidziany przez twórcę.
Najbardziej uciążliwe dla mnie było to, że nie można było jako `child` dla przycisku podawać Reactowych komponentów `Link`.
Można było najwyżej podać atrybut `href`, który jednak powodował przekierowanie to innego adresu z pominięciem React Routera.
Jeśli natomiast próbowało się zagnieździć `Link` wewnątrz przycisku, psuły się style.
Przykład:

![Przykład 1](/assets/img/posts/material-ui-drawback-1.png)

Tekst przycisków powinien być na tym samym poziomie, tymczasem po wstawieniu do środka komponentu `Link` (drugi przycisk), tekst przenosił się kilkanaście pikseli w górę.
Jeszcze ciekawsze rzeczy działy się, kiedy zagnieżdżałem `Link` w niebieskim menu na górze.
Okazało się, że dodatkowo tekst, który powinien pozostać biały, zmieniał się na zwykły tekst przycisku (ciemnoszary).
W sumie na początku chciałem z tym żyć, ale pojawiły się kolejne problemy.

Największym problemem było to, że zabrakło mi kilku rzeczy, które spodziewałbym się mieć _out of the box_.
Już na samym początku w dokumentacji było napisane, że widgety korzystają z czcionki Roboto (albo że zalecana jest czcionka Roboto), tyle że czcionkę do projektu musiałem dorzucić sam.
Dodatkowo podczas implementowania widoku okazało się, że brakuje na przykład responsywnego gridu, czy odpowiedniego ostylowania, linków, nagłówków i tak ogólnie typografii.
Innymi słowy okazało się, że Material-UI to jednak tylko kilka(dziesiąt) działających komponentów, ale niestety jednak nie rozwiązanie kompleksowe.

I wreszcie trzecia rzecz, techniczna, którą odkryłem, przeglądając wygenerowany kod HTML w Chrome Dev Tools.
Okazało się, że wszystkie style wrzucane są inline.
Co prawda, twórcy w [dokumentacji](http://www.material-ui.com/#/customization/styles) piszą o wadach takiego podejścia i pewnie będą od tego odchodzić, jednak póki co biblioteka działa jak działa, a jeszcze jest na tyle wcześnie, że mogę ją zmienić.

Znalazłem już coś nowego: [Materialize](http://materializecss.com).
Ma minimalnie więcej gwiazdek na GitHubie (25 vs 24 tysiące), ale wydaje się kompleksowa (jest grid, typografia i kilka innych rzeczy, których w Material-UI nie było).
Zamiast komponentów Reactowych ma zwykły DOM i klasy CSS.
Być może będę musiał to jakoś obudować, żeby pożenić z Reactem.
Czas pokaże.
