---
title: Mój pierwszy projekt na Github
layout: post
description: |
    Konto na Github założyłem wcale nie tak dawno temu, bo w sierpniu 2013 roku.
    Mój <a href="https://github.com/dzikowski/publish-url/blob/master/publish-url">pierwszy projekt</a> Open Source powstał miesiąc później, dla żartu, i składał się z dwóch linijek kodu w Bashu.
    Pozwalał użytkownikom systemu UNIX/Linux w łatwy sposób udostępniać linki osobom w tej samej podsieci.
---

Scenariusz wykorzystania jest prosty.
Załóżmy, że Twój adres IP to ```192.168.1.123```.
Mówisz swojemu koledze z pokoju, żeby wszedł na Twój adres, żeby zajrzał na stronę, którą mu polecasz.
Kolega wchodzi w przeglądarce na ```http://192.168.1.123:4000``` (bo na przykład na porcie ```4000``` zawsze udostępniasz linki) i od razu zostaje przekierowany na wspaniałą stronę, którą chciałeś mu polecić.

Zresztą kolega wcale nie musiał wpisywać Twojego adresu i portu.
Jeśli masz stały adres IP i zawsze udostępniasz strony na tym samym porcie, mógł mieć dodany adres do zakładek.
Wtedy przejście na polecaną przez Ciebie stronę, to **jedno kliknięcie**!

Żeby udostępnić link, musisz tylko wpisać w terminalu:

{% highlight sh %}
publish-url http://super.link.com/przeczytaj-go.html 4000
{% endhighlight %}

A teraz się przygotuj.
Oto źródło skryptu ```publish-url```:

{% highlight sh %}
echo "HTTP/1.1 303 See Other
Location: $1" | nc -l $2
{% endhighlight %}

Mój pierwszy projekt na Githubie wykorzystuje proste Linuksowe narzędzie netcat (nc) oraz specyfikację protokołu HTTP.


Netcat
---

Netcat umożliwia przesyłanie danych za pośrednictwem protokołu TCP lub UDP.
Jeśli otworzysz dwa terminale i w jednym wpiszesz:

{% highlight sh %}nc -l 1234{% endhighlight %}

A w drugim:

{% highlight sh %}nc localhost 1234{% endhighlight %}

W taki sposób stworzysz prosty komunikator.
Cokolwiek wpiszesz w jednym z terminali, pojawi się także w drugim.

Jeśli Twój kolega ma Uniksa, Linuksa, albo [cygwin](https://www.cygwin.com/) z netcatem, może wpisać w terminalu Twój adres IP, zamiast ```localhost``` i porozmawiać z Tobą.

Swego czasu korzystałem z netcata do przesyłania plików pomiędzy komputerami.
Uruchamiałem w terminalu:

{% highlight sh %}
cat /sciezka/do/pliku | nc -l 1234
{% endhighlight %}

Kolega:

{% highlight sh %}
nc 192.168.1.123 1234 > /sciezka/nazwa_pliku
{% endhighlight %}

Dzięki temu cała zawartośc pliku była przekazywana [potokiem](http://pl.wikipedia.org/wiki/Potok_%28Unix%29) do netcata, a kolega mógł ją odebrać, również netcatem i przekierować w określone miejce na dysku.

Ale to nie wszystko.
Dzięki komunikacji za pośrednictwem potoków w systemach UNIX/Linux, dzięki netcatowi możesz jeszcze:

  - Stworzyć w jednej linijce serwer, wyświetlający stronę internetową.
  - Wykonać przez sieć dowolne polecenie na innym komputerze.
  - Odtworzyć dźwięk z jednego komputera na innym.

I wiele, wiele innych.
(Przykłady możesz znaleźć 
   [tutaj](http://www.terminally-incoherent.com/blog/2007/08/07/few-useful-netcat-tricks/),
   [tutaj](http://www.thegeekstuff.com/2012/04/nc-command-examples/),
   [tutaj](http://null-byte.wonderhowto.com/how-to/hack-like-pro-use-netcat-swiss-army-knife-hacking-tools-0148657/),
   [tutaj](http://beatofthegeek.com/2014/01/5-cool-things-to-do-with-netcat.html)
   i [tutaj](http://blog.cykerway.com/post/389)).

   
Protokół HTTP
---

Pewnie siedzisz w IT nie od wczoraj i wiesz, czym są kody HTTP.
Kod ```200``` oznacza, że wszystko w porządku, ```403``` -- dostęp zabroniony, ```404``` -- nie znaleziono, ```500``` to błędy serwera, a ```418``` -- [jestem czajnikiem](http://en.wikipedia.org/wiki/Hyper_Text_Coffee_Pot_Control_Protocol). 
Wreszcie, kod ```303```, który został użyty w moim projekcie służy do tego, żeby przekierować na inny adres.

Kiedy dowolny klient przejdzie pod określony adres HTTP, prezentowane jest mu coś na kształt pliku tekstowego.
W pierwszej linijce znajdzie się informacja o stosowanej wersji protokołu HTTP i kod odpowiedzi.
Czyli na przykład ```HTTP/1.1 200 OK```, albo ```HTTP/1.1 404 Not Found```.
W kolejnych linijkach będą tzw. nagłówki HTTP.


Kiedy na przykład przeglądarka pod określonym adresem napotka kod HTTP ```303```, automatycznie przekieruje na adres, który podany został w nagłówku ```Location```.
W moim pierwszym projekcie na Github preparuję odpowiedź HTTP z kodem HTTP, sugerującym przekierowanie pod inny adres i z nagłówkiem ```Location```, w którym podaję adres strony, pod który chcę przekierować.
```$1``` to po prostu pierwszy argument z wiersza poleceń dla wywołania mojego skryptu.

Treść spreparowanej odpowiedzi HTTP przekazuję potokiem do netcata, uruchomionego na określonym porcie.
Dzięki czemu na moim komputerze, na podanym przeze mnie porcie, czeka sobie spreparowana odpowiedź HTTP, aż ktoś wejdzie pod mój adres i zostanie przekierowany na wspaniałą stronę, którą mu polecam.
Ot i cała filozofia.



Morał
---

Ten wpis jest doskonałym przykładem tego, jak wiele można napisać o czymś, co w gruncie rzeczy jest bardzo proste.
Jak można rozdmuchać prostą rzecz do rangi umiarkowanie skomplikowanego projektu, rozwiązującego niesamowite problemy z zastosowaniem najnowszych technologii.

Ale z innej strony: widać, jak proste narzędzie może dostarczyć funkcjonalność, której zakodowanie w dowolnym języku programowania mogłoby zająć wiele czasu.
Gdybyś chciał poprosić programistę, żeby zaimplementował Ci narzędzie, które pozwoli Ci z terminala udostępniać linki dowolnym osobom, jak myślisz, na ile czasu wyceniony zostałby ten projekt?

Na miesięc -- pewnie nie.
Tydzień, to chyba też za dużo.
Ale na dwa, trzy dni?
Możliwe.

Bardzo podoba mi się przykład serwera, wyświetlającego stronę z informacjami o przerwie technicznej, napisany w jednej linijce (znaleziony na [tym blogu](http://www.terminally-incoherent.com/blog/2007/08/07/few-useful-netcat-tricks/)).
Autor chwali się, że wystarczyły mu na to trzy minuty.

{% highlight sh %}
while true; do nc -l -p 80 -q 1 < error.html; done
{% endhighlight %}

Tymczasem w IT często bywa tak, że nawet jeśli rozwiązanie problemu jest proste i łatwo je osiągnąć, zespół przechodzi przez niełatwą drogę analizy wymagań, projektowania, implementacji i -- wreszcie -- testowania.
A często, żeby osiągnąć pożądany efekt, wystarczy więcej rozmawiać z klientem, więcej eksperymentować -- razem z klientem, no i mieć nieco szerszą wiedzę, niż to zwykle bywa u bardzo ukierunkowanych specjalistów IT.

Prawdą jest też to, że w rozwijaniu oprogramowania faktycznie istnieje przepaść pomiędzy początkującymi, a tymi najlepszymi.
W większości zawodów jest nie do pomyślenia, że ktoś może takie same obowiązki realizować **dziesięć razy szybciej**, a przy tym dostarczać produkt lepszej jakości.
W IT -- jak najbardziej.
Zależy to od wielu czynników -- wiedzy, umiejętności interpersonalnych, organizacji pracy [itd](http://www.construx.com/10x_Software_Development/Origins_of_10X_%E2%80%93_How_Valid_is_the_Underlying_Research_/).

Tworzenie rozbudowanych programów to jeszcze nie jest sztuka.
Sztuką jest szybko zrobić coś prostego i czytelnego, co faktycznie rozwiąże określony problem biznesowy.

Mój pierwszy projekt na Github oczywiście nie jest przykładem wspaniałego i niezwykle użytecznego rozwiązania.
Co tam -- sam z niego nie korzystam i pewnie tak szybko nie zacznę.
Jest za to świetnym pretekstem, żeby podyskutować o tym, że prostota w IT jest fajna i osiagalna.


