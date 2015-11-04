---
title: Październik
layout: post
category: links
description: |
    Październik to miesiąc intensywnej pracy na kontrakcie, częściowo związanej ze znaczną reorganizacją projektu.
    W przeglądzie linków jak zwykle sporo artykułów z Hacker News, sporo o DevOps i tworzeniu oprogramowania na Wielką Skalę.
---



Biznes
---

[Default Alive or Default Dead](http://paulgraham.com/aord.html), czyli Paul Graham o tym, że bardzo wcześnie powinno się badać wzrost swojego startupu ([kalkulator](http://growth.tlb.org/) do pomocy), a w związku z tym, czy -- zakładając bieżące koszty i przychody -- ostatecznie po jakimś czasie będzie przynosił zysk (_default alive_), czy upadnie (_default dead_). Autor pisze także o tym, dlaczego niektóre startupy szybko zatrudniają nowych pracowników i dlaczego należy z tym uważać. Nowy pracownik to znaczne comiesięczne koszty, a nie wiadomo, czy twój startup jest już na to gotowy.

O relacjach pracodawca -- pracownik: [Założyciel LinkedIn ujawnia największe kłamstwo, jakim pracownicy karmią się nawzajem z pracodawcami](http://innpoland.pl/122407,zalozyciel-linkedin-o-najwiekszym-klamstwie-jakie-mowisz-swojemu-pracodawcy-i-jakie-on-mowi-tobie).
Trudno zaprzeczyć, że w tym krótkim artykule jest sporo prawdy.


Rozwój osobisty
---

Artykuł [Small Improvements That Can Transform Your Professional (and Personal) Life](https://www.linkedin.com/pulse/small-improvements-can-transform-your-professional-personal-haden) zaczyna się od stwierdzenia, że w zasadzie większość czynności zawodowych -- nawet w bardzo kreatywnych zawodach -- to _produkcja_ (świetny przykład: _Just ask all the people desperately wishing George R.R. Martin would finish the next book in the Game of Thrones series_).
A skoro tak jest, warto stosować praktyki ciągłego doskonalenia znane z produkcji.
Kilka praktycznych wskazówek: wprowadź wskaźniki, które sprawdzą twoją efektywnośc, zrezygnuj ze zbędnych decyzji i przeznacz zaoszczędzoną energię na coś innego, rób realistyczne listy zadań, a nie listy życzeń (czyli tyle, ile jesteś w stanie zrobić, a nie tyle, ile chciałbyś zrobić).

[Being Busy is Waste of Time](https://www.linkedin.com/pulse/being-busy-waste-time-morgan-spurlock), czyli kolejny artykuł z LinkedIn. Morgan Spurlock, twórca filmów dokumentalnych, o tym, że bycie zajętym, a bycie produktywnym, to dwie różne rzeczy. I o czterech rodzajach produktywności, jakie wyróżnia. Można przeczytać, bo wspomniane rodzaje produktywności wydają mi się stosunkowo nietypowym podejściem.

Na koniec tej sekcji lista pięćdziesięciu najpopularniejszych kursów MOOC ([The 50 Most Popular MOOCs of All Time](http://www.onlinecoursereport.com/the-50-most-popular-moocs-of-all-time/)). _Functional Programming Principles in Scala_ w pięćdziesiątce, wysoko świetny _A Beginner’s Guide to Irrational Behavior_, a wprowadzenie do filozofii na piątym miejscu. Aż mi się miło zrobiło.


Praktyka programowania
---

[A Successful Git Branching Model](http://nvie.com/posts/a-successful-git-branching-model/). W zasadzie sposób organizacji repozytorium zasługiwałby na odrębny post. Jak zarządzać _branches_, która z nich ma być produkcyjna, jak dołączać do niej nowe funkcjonalności; jest tego sporo.
Ten link podesłał mi kolega z pracy, przy okazji, kiedy robiliśmy reorganizację własnego repozytorium.
Niezła systematyka dla TFS znajduje się jeszcze [tutaj](https://msdn.microsoft.com/en-us/library/bb668955.aspx). (Tak, wersjonujemy w TFS...).

Artykuł dotyczący debugowania kodu, [Interactive Debugger Considered Harmful](https://www.linkedin.com/pulse/interactive-debugger-considered-harmful-ashish-hanwadikar), którego sam tytuł już jest tendencyjny. Moim zdaniem Autor ma sporo racji, wskazując na negatywne skutki nadmiarowego używania narzędzi do debugowania w postaci ubogich testów automatycznych i niedostatecznego _logowania_ zdarzeń (swoją drogą, czy ktoś jeszcze używa pojęcia _dziennik zdarzeń_?). Spotkałem się z opinią, że kiedy dobrze stosuje się TDD, to _debuger_ nie jest już potrzebny, bo wszystko widać w testach. Czy samo TDD rozwiąże też Wszystkie Inne Problemy to już jednak osobna historia.

To z kolei pojawiło się pewnego niedzielnego poranka: [Do You Know How Much Your Computer Can Do in a Second?](http://computers-are-fast.github.io/). Quiz z przykładami kodu w Pythonie, polegający na tym, że trzeba zgadnąć -- mniej więcej -- ile operacji wykona się podczas sekundy. W pewnym sensie jest to wzbogacony wariant publikowanej chyba wszędzie tabelki: [Latency Numbers Every Programmer Should Know](https://gist.github.com/jboner/2841832).

Dalej o wydajności: [Page Weight Matters](http://blog.chriszacharias.com/page-weight-matters); historia sprzed kilku lat, YouTube. Ich stronka zajmowała ponad 1 MB, więc ładowała się wolno. Udało się zbić do ok 100 KB, ale statystyki pokazały, że ładuje się jeszcze wolniej. Dopiero po jakimś czasie okazało, że wszystko przez to, że mały rozmiar strony pozwolił wchodzić na nią z krajów, gdzie internet jest bardzo wolny (np. niektóre kraje Afryki). Dzięki temu, że udało się ograniczyć rozmiar strony, stała się ona dostępna dla szerszego grona internautów.

Swoją drogą, przypomina mi to trochę historię sukcesu WhatsApp, o czym czytałem już dawno temu (i niestety nie jestem w stanie odnaleźć postu źródłowego).
O tym, co świadczyło o tak dużej wartości WhatsApp, było działanie aplikacji na wielu platformach.
Nie tylko Android i iOS, ale też np. stara dobra Java na telefonach komórkowych.
Dzięki temu grupa odbiorców była szersza a cena WhatsApp taka wysoka.
([Tutaj](https://www.quora.com/Why-did-WhatsApp-succeed-over-other-similar-apps) jest też kilka wartościowych informacji o sukcesie WhatsApp).


DevOps
---

Może na początek tej sekcji na ostro. Masz pomysł na własną aplikację webową, która będzie obsługiwać tysiące (miliony?) użytkowników. Kupujesz tani VPS, wrzucasz kod i działa, prawda? Artykuły [Anatomy of a Modern Production Stack](http://www.eightypercent.net/post/layers-in-the-stack.html) i [Running a Modern Infrastructure Stack](https://blog.barricade.io/running-a-modern-infrastructure-stack/) pokazują, o czym zapomniałeś.
Jest to taki przegląd, co faktycznie trzeba robić z aplikacjami webowymi.
Monitorowanie, mierzenie wydajności, zarządzanie siecią, instancjami, zapewnienie odporności na awarie i wiele, wiele innych.

Na początek nie ma pewnie się co spinać, trzeba tylko zrobić kluczową funkcjonalność i zobaczyć, czy się sprawdza, jednak z czasem, jeśli się uda, zajrzyj do tej _checklisty_.

Być może część rzeczy chciałbyś zautomatyzować. (Chciałbyś.) Możesz zajrzeć jeszcze na porównanie popularnych narzędzi do _orchestration_ (_automatycznego zarządzania i koordynacji?_). [Swarm, Fleet, Kubernetes i Mesos](http://radar.oreilly.com/2015/10/swarm-v-fleet-v-kubernetes-v-mesos.html) daje pogląd na to, do czego służą poszczególne narzędzia i w jaki sposób działają. To jest jeden z tych artykułów, które pozwalają poskładać różne szczątkowe informacje w całość.

[Let’s Encrypt](https://letsencrypt.org/) pojawiło się na Hacker News, kiedy ich certyfikaty SSL oficjalnie stały się zaufane przez wszystkie główne przeglądarki.
Let’s Encrypt daje darmowe certyfikaty, ich instalacja i odnawianie wydają się w pełni zautomatyzowane, oparte o otwarte standardy, a w dodatku samo Let’s Encrypt wspierane jest przez organizację pożytku publicznego -- Internet Security Research Group (ISRG).
(Update z dnia 4 listopada: dostałem beta dostęp!).


Architektura i narzędzia
---

Zaczynam od głosu w dyskusji, polegającej na tym, że _Jak chcesz skalować, Twoje usługi muszą być stateless_. Głos może nie do końca przeciwko takiemu podejściu, ale przytaczający argumenty na korzyść usług posiadających stan ([Making The Case For Building Scalable Stateful Services In The Modern Era](http://highscalability.com/blog/2015/10/12/making-the-case-for-building-scalable-stateful-services-in-t.html)).

I jeszcze trochę o skalowalności: Jedna z aplikacji, której regularnie używam do zarządzania zadaniami, i która ciągle jeszcze jest tylko moją prywatną aplikacją, korzysta z klasycznego i już trochę starodawnego sposobu edycji treści: z przycisku "Save". Od dłuższego czasu przymierzam się do przerobienia jej na _event sourcing_ na jakiejś bardziej skalowalnej bazie. Obiecującym zestawem wydaje się być [Akka Persistence](http://doc.akka.io/docs/akka/snapshot/scala/persistence.html) z niejako wbudowanym mechanizmem _event sourcing_ i jakaś lekka baza pod spodem, np. [LevelDB](https://github.com/google/leveldb), albo nieco cięższa [Cassandra](https://github.com/krasserm/akka-persistence-cassandra/). W tej chwili aplikacja chodzi na Mongo, które wydaje mi się niespecjalnie odpowiednie, jeśli w przyszłości będę chciał skalować ją horyzontalnie (dużo konfiguracji rodem z RDBMS).

W innej aplikacji stosuję MarkDown jako format większych opisów, zamiast zwykłego tekstu w kontrolkach formularza. Na razie wydaje się to być dobrym rozwiązaniem. W MarkDown pisany jest też ten blog. A jeśli chcesz zobaczyć więcej, to [Classeur](http://classeur.io/) do wydaje się super. Możesz edytować MarkDown na stronie, zainstalować aplikację, albo wtyczkę do przeglądarki.

[&lt;input&gt; I ♡ you, but you're bringing me down](http://meowni.ca/posts/a-story-about-input/) to z kolei artykuł o tym, jak długo pole input opiera się standaryzacji (od 1995, kiedy powstało).
Bardzo miło się czyta, autorka ma fajny styl pisania.


Ciekawostki
---

Dlaczego NSA udaje się złamać kryptografię tak wielu systemów? Okazuje się, że dlatego, że kiedy znajdą już dużą liczbę pierwszą, to może ona posłużyć do złamania szyfrów nie na jednym, ale na wielu portalach. Jak wielu? Zajrzyjcie do artykułu [How is NSA breaking so much crypto?](https://freedom-to-tinker.com/blog/haldermanheninger/how-is-nsa-breaking-so-much-crypto/).

<!--https://www.google.com/doodles/halloween-global-candy-cup-2015-->

Najlepsze na koniec. Od hermetycznych żartów informatycznych śmieszniejsze są tylko żarty filozoficzne. [Tutaj](http://existentialcomics.com/comic/23) komiks, gdzie filozofowie akurat grają w _Dungeons and Dragons_, a pod komiksem znajdziecie ponad 600 słów tłumaczących, o co każdemu z bohaterów chodziło. I chyba większość komiksów z tej strony ma przycisk "Didn’t get the joke?", który można kliknąć, by zobaczyć rozbudowane wytłumaczenie tego, co się właśnie wydarzyło.
