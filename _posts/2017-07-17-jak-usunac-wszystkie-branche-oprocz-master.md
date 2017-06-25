---
title: Jak usunąć wszystkie branche oprócz master?
layout: post
comments: true
tags: 
category: daj-sie-poznac
description: Podczas pracy z Gitem na branchach dochodzisz do takiego momentu, kiedy samo przełączenie się na inny branch w IntelliJ to w większości skrollowanie długiej listy nazw w poszukiwaniu tej właściwej. Oczywiście możesz na bieżąco czyścić swoje branche, ale da się też szybko wybrnąć z sytuacji, kiedy zrobił ci się bałagan.
---

TL;DR:

```
git branch | grep -v "master" | xargs git branch -d
```

Powyższa komenda usunie ci wszystkie lokalne branche, poza `master`, które zostały _zmergowane_ albo _spushowane_ do zdalnego repozytorium.
I w sumie mógłbym już na tym skończyć, ale rozłożę ją jeszcze na czynniki pierwsze, jeśli na przykład obawiasz się wklejania do swojego terminala losowych komend z internetu &#128521;.

`git branch` po prostu wyświetla listę wszystkich branchy.
Dalej ta lista przez `|` jest przekazywana do _grepa_, który odfiltruje wszystkie wartości, które zawierają tekst `master`.
Tak właśnie działa parametr `-v`, albo `--invert-match` -- zmienia działanie _grepa_ z _ma pasować do wzorca_ na _nie ma pasować do wzorca_.
Zauważ jeszcze tylko, że jeśli masz na przykład branch `master2`, to i tak po tym skrypcie będzie trzeba ją usunąć ręcznie.

Wreszcie `xargs` sprawia, że otrzymane wcześniej nazwy branchy do usunięcia będą podawane jako parametry do podanego polecenia.
Czyli jeśli otrzymaliśmy listę z elementami:

```
branch-aaa
branch-bbb
branch-ccc
```

...i przekazujemy ją przez `|` do `xargs git branch -d`, to z grubsza to samo, jak byśmy wywołali:

```
git branch -d branch-aaa
git branch -d branch-bbb
git branch -d branch-ccc
```

(Xargs robi oczywiście też po drodze [inne rzeczy](https://pl.wikipedia.org/wiki/Xargs), ale tutaj akurat nie jest to ważne).

W przypadku `git branch -d nazwa-brancha` dany _branch_ zostanie usunięty tylko wtedy, kiedy wszystko zostało zmergowane, albo wysłane do zdalnego repozytorium.
Dzięki temu możesz uniknąć przypadkowego usunięcia tych _branchy_, na których ciągle pracujesz.
Jeśli jednak się tego nie obawiasz, możesz spokojnie zamienić `-d`, na `-D`, który jest skrótem na `--delete --force` i się takimi szczegółami nie będzie przejmował.
