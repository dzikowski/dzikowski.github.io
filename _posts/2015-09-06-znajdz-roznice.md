---
title: Znajdź różnicę
layout: post
tags: 
description: |
    Czasami niewielka różnica w kodzie może prowadzić do niespodziewanych konsekwencji, wynikających niekoniecznie z zawiłości logiki programu, ale z nieprzemyślanej konstrukcji języka lub środowiska programistycznego.
    Jeden ze sztandarowych przykładów, to pewna pułapka podczas przechwytywania wyjątków.
---

Zwróć uwagę na dwa przykłady:

Przykład pierwszy
---

{% highlight java %}
public class Test {
    public static void main(String[] args) {
        try {
            throw new RuntimeException("error");
        } finally {
            System.out.println("hello");
        }
    }
}
{% endhighlight %}


Przykład drugi
---

{% highlight java %}
public class Test {
    public static void main(String[] args) {
        try {
            throw new RuntimeException("error");
        } finally {
            System.out.println("hello");
            return;
        }
    }
}
{% endhighlight %}

Czym te przykłady się różnią?
Jedną linijką.
Instrukcją ```return``` w bloku ```finally```.

Wydaje się, że tak niewielka zmiana nie powinna nic zepsuć, a psuje bardzo dużo, choć -- wydawałoby się -- nawet nie powinna zmienić działania programu.
Spróbuj odpalić jeden i drugi przykład.
W drugim wypadku wyjątek w ogóle nie zostanie wywołany i aplikacja zakończy się poprawnie.

Przykład trzeci
---

Nietrudno wyobrazić sobie sytuację, w której niedoświadczony programista w bloku ```try``` pobiera coś z bazy danych, albo zewnętrznej usługi, generalnie wykonuje coś, co powinno przechwycić wyjątek. 
Programista przeczytał niedawno jakiś artykuł Martina Fowlera i postanowił tworzyć kod zgodnie z zasadami [Fluent Interface](https://en.wikipedia.org/wiki/Fluent_interface).
Dlatego na końcu każdej metody zwraca referencję do obiektu (```this```).

Rozważmy przykład klasy, która ma służyć do pobierania prognozy pogody i aktualizacji ustawień klimatyzacji.

{% highlight java %}
public class WeatherDownloader {
   
    /**
     * Updates WeatherDownloader with current temperature. Throws WeatherException
     * if temperature can not be retrieved.
     */
    public WeatherDownloader withTemperature() throws WeatherException {
        try {
            // (1) open connection
            // (2) retrieve temperature
        } finally {
            // (3) close connection if opened
            return this;
        }
    }
    
    ...
    
    public static void main(String[] args) {
        try {
            WeatherDownloader downloader = new WeatherDownloader().withTemperature();
            // (4) do something with temperature, for instance update AC settings
        } catch (ConnectionException e) {
            LOG.warn("Cannot retrieve current temperature", e);
        }
    }
}
{% endhighlight %}


Na pierwszy rzut oka wszystko wygląda dobrze, a kod jest całkiem elegancki.
Metoda ```withTemperature``` aktualizuje zapisaną temperaturę i... no właśnie.
Powinna wyrzucać wyjątek, jeśli nie da się takiej temperatury pobrać (błąd w nawiązywaniu połączenia, błąd pobierania, albo parsowania danych itp.).

W innym miejscu (tutaj metoda ```main```), pobierana jest temperatura z wykorzystaniem obiektu klasy ```WeatherDownloader``` i na jej podstawie zmieniane są ustawienia klimatyzacji.
W przypadku braku dostępu do sieci, wyjątek powinien zapobiec zmianom ustawień klimatyzacji -- jak zresztą opisuje to dokumentacja.
Tylko że przez głupi błąd wyjątek nie zostanie wyrzucony w metodzie ```withTemperature``` i mamy problem.
Problem, który będzie bardzo trudno znaleźć.

Ponieważ nasz downloader nie jest niemutowalny (ale to już inna historia i inny problem), gdzieś w środku pewnie przechowywana jest zmienna, zawierająca temperaturę.
Zmienna prawdopodobnie przyjmie wartość ```0.0```, albo może ```null```, w zależności od typu.
Ustawienia klimatyzatora zostaną błędnie skorygowane, ale dlaczego?
Przecież w logach nie pojawiła się informacja o tym, że nie pobrano temperatury.
Błąd więc musiał pojawić się w innym miejscu...
