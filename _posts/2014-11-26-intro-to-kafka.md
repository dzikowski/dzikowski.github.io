---
title: Architektura i wykorzystanie Apache Kafka
layout: post
description: |
    W tym artykule opisałem, jak działa i jaka jest architektura Kafki, pokazałem, w&nbsp;jaki&nbsp;sposób można uruchomić Kafkę do celów testowych i wreszcie zaprezentowałem prosty przykład wykorzystania Kafki w Javie, którego źródło możesz znaleźć w moim repozytorium na Githubie.
---

[Apache Kafka](http://kafka.apache.org/) to tak zwany _message broker_.
Tego rodzaju aplikacje odpowiadają za odbieranie, walidację, ewentualne przekształcenia i rozsyłanie komunikatów pomiędzy aplikacjami.
Umożliwiają bardzo elastyczny sposób komunikowania się luźno ze sobą powiązanych elementów systemów informatycznych.

Cechą charakterystyczną Kafki jest jej niezawodność, wydajność i zdolność do pracy w&nbsp;środowisku rozproszonym.
Kiedy zespół LinkedIn tworzył Kafkę, ich główną motywacją było poradzenie sobie z przetwarzaniem w czasie rzeczywistym ogromnej ilości  zdarzeń.
W konsekwencji powstało narzędzie, które jest idealne do wspomagania przetwarzania dynamicznie zmieniających się źródeł danych o dużej objętości i zmienności, na przykład strumieni [big data](http://pl.wikipedia.org/wiki/Big_data).

W 2014 roku w LinkedIn komunikacja za pośrednictwem Kafki przebiegała zarówno pomiędzy klastrami, jak i centrami danych.
W sumie przesyłano około 200 miliardów komunikatów dzienne, osiągając 7 milionów komunikatów na sekundę, jeśli chodzi o&nbsp;zapis i 35 milionów na sekundę w przypadku odczytu.
Z Kafki, poza LinkedIn, [korzystają](https://cwiki.apache.org/confluence/display/KAFKA/Powered+By) między innymi Netflix, Twitter, Spotify, Cisco, czy Coursera. 


Architektura
------------

Kafka umożliwia przesyłanie komunikatów (albo wiadomości, ang. _message_) pomiędzy aplikacjami w systemach rozproszonych.
Współpraca pomiędzy Kafką a innymi aplikacjami przebiega zgdnie z modelem _publish-subscribe_, to znaczy, że nadawca (ang. _producer_) może przesyłać komunikaty po tym, jak nawiąże połączenie z Kafką.
Podobnie odbiorca (ang. _consumer_) może odbierać wiadomości dopiero po tym, jak połączy się z Kafką (zapisze się do określonego tematu, _zasubskrybuje_ określony temat), a w dodatku -- co&nbsp;jest charakterystyczne właśnie dla modelu _publish-subscribe_  -- będzie odbierać wszystkie komunikaty, a nie tylko te, które zostały odebrane już przez innych odbiorców.

Tematy w Kafce (ang. _topic_) służą do grupowania komunikatów.
Zarówno nadawca, jak i&nbsp;odbiorca powiązany jest z jednym tematem.
Czyli nadawca przesyła komunikaty z określonego tematu, a odbiorca otrzymuje za pośrednictwem Kafki wszystkie komunikaty z określonego tematu, które mogą pochodzić nawet od wielu nadawców.
Każdy wysłany przez dowolnego nadawcę komunikat z określonego tematu trafi do każdego odbiorcy, który nasłuchuje tego tematu.

![Kafka producer-consumer](/assets/img/kafka-producer-consumer.svg)

Wszystko to dzieje się w środowisku rozproszonym.






Kafka daje następujące gwarancje:




Instalacja
----------

Korzystałem z dystrybucji Kafki w wersji 2.11-0.8.2-beta.


Ponieważ będę uruchamiał w sumie trzech brokerów Kafki, dla każdego z nich przygotowałem osobny plik konfiguracyjny (zgodnie z _tymi_ instrukcjami)


Uruchomienie
------------

Poniżej zamieszczam źródła dwóch skryptów, których będę używał do uruchamiania Kafki na potrzeby przyszłych tutoriali.

Wersja skryptu dla Windows (plik .bat):

{% highlight batch %}
cd C:\kafka_2.11-0.8.2-beta
start bin\windows\zookeeper-server-start.bat config\zookeeper.properties
start bin\windows\kafka-server-start.bat config\server1.properties

TIMEOUT /T 5

start bin\windows\kafka-server-start.bat config\server2.properties
start bin\windows\kafka-server-start.bat config\server3.properties

call start bin\windows\kafka-topics.bat --create --zookeeper localhost:2181    ^
        --replication-factor 2 --partitions 5 --topic coolkafka-in
call start bin\windows\kafka-topics.bat --create --zookeeper localhost:2181    ^
        --replication-factor 2 --partitions 5 --topic coolkafka-out

TIMEOUT /T 3

start bin\windows\kafka-console-producer.bat --topic coolkafka-in              ^
        --broker-list localhost:9092,localhost:9093,localhost:9094
start bin\windows\kafka-console-consumer.bat --topic coolkafka-in              ^
        --zookeeper localhost:2181
start bin\windows\kafka-console-consumer.bat --topic coolkafka-out             ^
        --zookeeper localhost:2181
{% endhighlight %}


Wersja skryptu dla Linuksa (plik .sh):

{% highlight sh %}
cd ~/kafka_2.11-0.8.2-beta
gnome-terminal -e "bin/zookeeper-server-start.sh config/zookeeper.properties" &
gnome-terminal -e "bin/kafka-server-start.sh config/server1.properties" &

sleep 5

gnome-terminal -e "bin/kafka-server-start.sh config/server2.properties" &
gnome-terminal -e "bin/kafka-server-start.sh config/server3.properties" &

zookeeper="--zookeeper localhost:2181"
create="--create $zookeper --replication-factor 2 --partitions 5"

bin/kafka-topics.sh $create --topic coolkafka-in
bin/kafka-topics.sh $create --topic coolkafka-out

brokers="--broker-list localhost:9092,localhost:9093,localhost:9094"
gnome-terminal -e "bin/kafka-console-producer.sh  $brokers --topic coolkafka-in" &

gnome-terminal -e "bin/kafka-console-consumer.sh $zookeeper --topic coolkafka-in" &
gnome-terminal -e "bin/kafka-console-consumer.sh $zookeeper --topic coolkafka-out" &
{% endhighlight %}

W pierwszej kolejności zawsze należy uruchomić instancję Zookeepera. Na szczęście nie musimy instalować nic dodatkowego, dystrybucja Kafki ma wbudowaną taką prostą instancję.
Następnie uruchamiam pierwszą instancję Kafki i czekam przez chwilę, żeby zdążył się uruchomić i stał się liderem.
Potem uruchamiam kolejne dwie kolejne instancje Kafki dla dwóch kolejnych plików konfiguracyjnych.

Teraz mogę przystąpić do stworzenia dwóch tematów, które będę wykorzystywał w&nbsp;kolejnych tutorialach: _coolkafka-in_ oraz _coolkafka-out_.
Tematy wystarczy stworzyć raz, nie trzeba tego robić przy każdym uruchomieniu Kafki, zdecydowałem się jednak zamieścić tworzenie tematów w tym skrypcie, żeby był bardziej uniwersalny.
Jeśli temat został już utworzony, pojawia się tylko ostrzeżenie, co w żaden sposób nie będzie nam przeszkadzać w tutorialach.
Dzięki temu mogę wywoływać za każdym razem ten sam skrypt, nie przejmując się, czy tematy zostały już wcześniej utworzone, czy jeszcze nie.

Wreszcie przystępuję do uruchomienia oddzielnych okien terminala: jednego na nadawcę i dwóch na odbiorców.
Nadawca będzie przesyłał komunikaty w temacie _coolkafka-in_; w&nbsp;tym temacie będzie też odbierał komunikaty pierwszy z odbiorców.
Drugi odbiorca będzie nasłuchiwał komunikatów w temacie _coolkafka-out_.

Po uruchomieniu skryptu możesz sprawdzić, czy wszystko działa, wpisując w oknie nadawcy jakiś tekst i wciskając enter.
Taki sam tekst powinien pojawić się w oknie pierwszego z odbiorców, ponieważ to on nasłuchuje komunikatów z tego samego tematu, co nadawca.

Kafka w Javie
-------------

Poniżej opisuję przykład wykorzystania Kafki w Javie, który można znaleźć w&nbsp;projekcie: TODO Link


### Model: transakcja bankowa

Chciałbym zaprezentować działanie Kafki w Javie na podstawie przesyłania informacji dotyczących prostych transakcji bankowych.
W tym celu stworzyłem trzy klasy w Javie (pakiet <code class="language-java" data-lang="java">{% highlight java nowrap %}io.github.dzikowski.bank{% endhighlight %}</code>): 
<code class="language-java" data-lang="java">{% highlight java nowrap %}Transaction{% endhighlight %}</code>, 
<code class="language-java" data-lang="java">{% highlight java nowrap %}Bank{% endhighlight %}</code> oraz 
<code class="language-java" data-lang="java">{% highlight java nowrap %}RandomTransactionProducer{% endhighlight %}</code>.

Pierwsza klasa reprezentuje transakcję bankową, która ma określoną datę wykonania, nadawcę, odbiorcę oraz kwotę.
Zakładam, że możemy mieć do czynienia z transakcjami zwykłymi oraz specjalnymi.
Zwykłe polegają na przelewaniu pewnej kwoty pieniędzy z jednego konta na inne, specjalna z kolei to wpływ pieniędzy na konto (brak nadawcy).

{% highlight java %}
public final class Transaction {

    private final Date date;
    private final String from;
    private final String to;
    private final int amount;
    
    ...
    
    public boolean isSpecial() {
        return "SPECIAL".equals(from);
    }
    
    ...
{% endhighlight %}

Druga klasa, <code class="language-java" data-lang="java">{% highlight java nowrap %}Bank{% endhighlight %}</code>, reprezentuje bank.
Zawiera ona mapę, w której trzymam informacje o stanie kont, a także metody, które pozwalają na pobranie informacji o środkach na koncie oraz przeprowadzenie transakcji.

{% highlight java %}
public class Bank implements Serializable {

    private final Map<String, Integer> accounts;

    ...

    public TransactionState make(Transaction transaction) {

        int amount = transaction.getAmount();
        String to = transaction.getTo();

        // someone earns
        if (transaction.isSpecial()) {
            accounts.put(to, currentAmount(transaction.getTo()) + amount);
            return TransactionState.SPECIAL_OK;
        }

        // money transfer
        else {
            String from = transaction.getFrom();
            int amountFrom = currentAmount(from);
            int amountTo = currentAmount(to);

            accounts.put(from, amountFrom - amount);
            accounts.put(to, amountTo + amount);

            return TransactionState.REGULAR_OK;
        }
    }

    public int currentAmount(String user) {
        Integer amount = accounts.get(user);
        return amount == null ? 0 : amount;
    }
    
    ...
{% endhighlight %}

Jak widzisz na powyższym przykładzie nigdzie nie sprawdzam, czy można dokonać przelewu (tj. czy ktoś posiada wystarczające środki na koncie).
Robię to celowo, ponieważ z kontrolowaniem stanu konta wiąże się pewien problem w środowiskach rozproszonych, o którym będe jeszcze pisał w jednym z kolejnych artykułów (o&nbsp;monoidach).
Na razie jednak ten problem pomijam.

Ostatnia klasa, <code class="language-java" data-lang="java">{% highlight java nowrap %}RandomTransactionProducer{% endhighlight %}</code>, służy do losowego generowania transakcji, zarówno jako obiektów klasy Transaction, jak i ich reprezentacji w&nbsp;formacie JSON.
(Konwertuję obiekty transakcji na JSONy z wykorzystaniem biblioteki [Gson](https://code.google.com/p/google-gson/)).

Pojedynczą transakcję losuję w następujący sposób:

{% highlight java %}
TODO
{% endhighlight %}

Za pośrednictwem Kafki przesyłam komunikaty w postaci JSONów reprezentujących losowe transakcje.


### Nadawca

### Grupa odbiorców

Consumers label themselves with a consumer group name, and each message published to a topic is delivered to one consumer instance within each subscribing consumer group. Consumer instances can be in separate processes or on separate machines.

### Podsumowanie


Różne źródła w języku angielskim
--------------------------------

  - Oficjalna [dokumentacja](http://kafka.apache.org/documentation.html) na stronie głównej projektu.
  - Ogólna [prezentacja](http://www.michael-noll.com/blog/2014/08/18/apache-kafka-training-deck-and-tutorial/) o Kafce autorstwa Michaela G. Nolla z Verisign.
  - [Prezentacja](https://www.jfokus.se/jfokus14/preso/Reliable-real-time-processing-with-Kafka-and-Storm.pdf) o wykorzystaniu Kafki w Spotify, autorstwa Pablo Barrery.
  - [Analiza](http://engineering.linkedin.com/kafka/benchmarking-apache-kafka-2-million-writes-second-three-cheap-machines) wydajności Kafki, przeprowadzona na umiarkowanie wydajnych serwerach przez Jaya Krepsa, jednego z inżynierów LinkedIn.
  - [Zbiór artykułów](http://www.michael-noll.com/blog/categories/kafka/) o Kafce, znów autorstwa Michaela G. Nolla. Część z nich obejmuje integrację z&nbsp;Apache Storm oraz Apache Spark, które pojawią się w kolejnych moich tutorialach.
