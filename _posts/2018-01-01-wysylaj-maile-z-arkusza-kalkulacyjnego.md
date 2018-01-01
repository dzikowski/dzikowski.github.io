---
title: Wysyłaj maile z arkusza kalkulacyjnego
layout: post
comments: true
tags: 
category: remindws
description: Od jakiegoś czasu po godzinach pracuję sobie nad rozwiązaniem, dzięki któremu bezpośrednio w googlowym arkuszu kalkulacyjnym mogę ustawiać sobie mailowe przypominajki. Wpisuję formułę, jako parametry podaję przyszłą datę i treść, a kiedy nadejdzie pora, dostaję maila. Wczoraj opublikowałem to rozwiązanie jako dodatek do arkuszy Google.
---

TL;DR -- w tym wpisie opowiadam jak z tego korzystać, co planuję jeszcze zrobić i będę zachęcać [do zainstalowania mojego dodatku](https://chrome.google.com/webstore/detail/remind-with-space/hpehicppmacemdfehhojpcjaoedemghd).

<a href="https://chrome.google.com/webstore/detail/remind-with-space/hpehicppmacemdfehhojpcjaoedemghd">
  <img src="/assets/img/posts/remindws-promo.png" style="border: 1px #eee solid" />
</a>


## Jak to działa?

Pomysł na projekt zrodził się, kiedy w arkuszach Google liczyłem, jakie powinienem zapłacić podatki.
Miałem kolumnę na miesiąc, termin płatności i kwotę.
Pomyślałem sobie, że byłby wygodnie, gdybym mógł bezpośrednio w tym arkuszu ustawić sobie przypomnienia na kilka dni przed terminem płatności.
Najlepiej, gdybym nie musiał nic wyklikiwać, przełączać się w tryb klikania różnych menu, tylko po prostu wpisać formułę.
Zrobiłem właśnie coś takiego.

Jeśli na przykład w `A2` masz termin płatności, a w `B2` wyliczoną kwotę, to aby utworzyć przypomnienie, wystarczy że użyjesz formuły:

```
=remindws(A2; B2)
```

Jeśli chcesz otrzymać powiadomienie trzy dni wcześniej, a treść powiadomienia ma być bardziej informatywna, możesz oczywiście skorzystać ze standardowych operacji na liczbach i tekście:

```
=remindws(A2-3; "Zapłacić podatek: "&B2)
```

I tyle.
Funkcja `remindws` ustawia przypomnienie na określoną datę z określoną treścią -- dane te są zapisane w bazie danych.
Mniej więcej godzinę przed nadejściem tej daty, zostanie zaplanowane wysłanie maila w zewnętrznej usłudze ([Mailgun](https://www.mailgun.com/)), a kiedy data i czas nadejdzie, właściciel arkusza dostanie maila.


## Beta

Ktoś kiedyś powiedział, że jeśli nie wstydzisz się pierwszej opublikowanej wersji projektu, to znaczy, że została ona opublikowana za późno.
Cóż, warunek został spełniony.

Dużo rzeczy zostało do zrobienia, mnóstwo mam planów i pomysłów na usprawnienia.
Podejrzewam, że znajdzie się też trochę błędów, których jeszcze nie udało mi się wyłapać.
Pisałem testy jednostkowe i integracyjne, sam od jakiegoś czasu tego używam, ale wiadomo -- produkcja to całkiem inny świat.

Ciągle też jeszcze nie zgłosiłem aplikacji do weryfikacji przez Google, stąd widoczny komunikat bezpieczeństwa podczas instalacji dodatku.

No i to nieszczęsne usuwanie przypomnień...


## Usuwanie przypomnień

To jest największa moja bolączka.
Nie udało mi się tego zrobić w sensowny sposób, głównie przez to, że nie jest to takie proste.
Z jednej strony pojawiają się trudności powstające na styku podejścia deklaratywnego (jak arkusz kalkulacyjny) z proceduralnym (wysyłanie powiadomień), a z drugiej strony nie pomagają restrykcyjne reguły bezpieczeństwa w arkuszach Google (i bardzo dobrze).

Idealnie by było, gdyby usunięcie zawartości komórki z formułą prowadziło bezpośrednio do usunięcia przypomnienia -- i wydaje mi się, że wiem już jak to zrobić, niemniej jednak na razie tak to nie działa.
Przypomnienia oczywiście da się usuwać, tylko trzeba to robić naokoło.

Sposób 1: Jeśli masz zdefiniowane przypomnienie, możesz usunąć jego datę lub treść -- wtedy, kiedy wskutek aktualizacji formuła wykona się jeszcze raz, przypomnienie zostanie usunięte.

Sposób 2: Bezpośrednio w komórce, w której jest zdefiniowana formuła przypomnienia, możesz wpisać `=remindws_remove()`.

Dodatkowo, żeby zdiagnozować, jakie faktycznie są zdefiniowane przypomnienia, można skorzystać z formuły `=remindws_show_active(1)`.
Przy czym podanie tej `1` prowadzi do wyświetlenia nie tylko daty i treści, ale także lokalizacji przypomnień w arkuszach -- link i adres komórki.

Na razie tak to działa, ale też jest to pierwsza w kolejności rzecz do zmiany w następnej wersji.


## Dalsze plany

W tej chwili funkcjonalności dodatku to absolutne minimum.
Działa to, co powinno działać, jest główna funkcjonalność bez żadnych _nice to have_.
Ale mam plany, a w szczególności:

1.  Chciałbym usprawnić usuwanie przypomnień -- usunięcie formuły w komórce powinno prowadzić do usunięcia przypomnienia.
1.  Chciałbym przygotować stronę z dokumentacją dodatku.
1.  Chciałbym zmienić _template_ maila na lepszy -- w tej chwili to tylko goły tekst, bez żadnej informacji skąd to się wzięło, z jakiego arkusza pochodzi przypomnienie.
1.  Chciałbym umożliwić wysyłanie przypomnień do innych osób, na inne adresy mailowe.
    W tym celu muszę też przenalizować, jak się zabezpieczyć, żeby nikt nie rozsyłał spamu z mojego dodatku.
1.  Chciałbym dokleić do tego jakąś prostą aplikację, gdzie można by było przeglądać swoje przypomnienia, dodawać nowe, już nie związane z arkuszami, oznaczać jako _done_; być może nawet integrację z jakimś innym narzędziem.

Innymi słowy, mnóstwo roboty i mnóstwo rzeczy do zrobienia.
Na razie jednak jest _MVP_, działa kluczowa funkcjonalność, i jeśli masz ochotę, zajrzyj, zainstaluj, zobacz. 
Będzie mi bardzo miło otrzymać jakiś _feedback_.

W tej chwili mam ustawiony limit 10 aktywnych przypomnień na użytkownika, ale jeśli do mnie napiszesz, mogę go zwiększyć.

<div style="text-align: center; margin: 1em;">
  <a href="https://chrome.google.com/webstore/detail/remind-with-space/hpehicppmacemdfehhojpcjaoedemghd" style="background-color: #388e3c; border: none; color: white; padding: 15px 32px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px; font-weight: bold; border-radius: 2px;">
  Dodaj do arkuszy Google
  </a>
</div>

