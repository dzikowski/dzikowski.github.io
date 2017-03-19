---
title: Kontekstualne this
layout: post
comments: true
tags: 
category: daj-sie-poznac
description: JavaScript to świetny język, ale chyba jak każdy ma swoje słabe strony. Jedną z rzeczy, których najbardziej nie lubię jest działanie <code>this</code>, które zależy od kontekstu wywołania, a przez to często jest mylące. Jeśli na przykład napiszesz sobie <em>arrow function</em>, w której wnętrzu wywołasz <code>this</code>, nie masz pewności, które <code>this</code> zostanie wykorzystane. Ale zacznijmy od prostego przykładu.
---

```javascript
function Demo1() {
  this.ctx = 'Demo1 context';
  console.log(this.ctx);
}

Demo1(); // Uncaught TypeError: Cannot set property 'ctx' of undefined
new Demo1(); // Demo1 context
```

Na tym przykładzie widać, że użycie słówka `new` przed funkcją spowodowało, że oprócz tego, że został utworzony obiekt, `this` przestaje być `undefined` i wskazuje na utworzony obiekt.
(Więcej o `new` można znaleźć [tutaj](http://stackoverflow.com/questions/1646698/what-is-the-new-keyword-in-javascript)).
Proste, prawda?
No to lecimy dalej.

```javascript
const Demo2 = () => {
  this.ctx = 'Demo2 context';
  console.log(this.ctx);
};

Demo2(); // Demo2 context
new Demo2(); // Uncaught TypeError: Demo2 is not a constructor
```

Tutaj doskonale widać jedną z fundamentalnych różnic pomiędzy zwykłymi funkcjami w JavaScripcie, a tzw. _arrow functions_ -- mianowicie z tych drugich nie da się tworzyć obiektów i nie mają swojego `this`.

No dobra, ale w jakiś sposób wywołanie `this.ctx = 'Demo2 context';` zadziałało?
Skąd się wziął `this`, do którego został wpisany `ctx`?

```javascript
const Demo3a = () => {
  console.log(this.ctx);
};

const Demo3b = () => {
  this.ctx = 'Demo3b context';
  console.log(this.ctx);
};

Demo3a(); // undefined
Demo3b(); // Demo3b context
Demo3a(); // Demo3b context
```

Jasne.
Teraz już wiemy, że w tym wypadku `this` jest _globalne_, poza `Demo3a` i `Demo3b`.
_Arrow functions_ biorą sobie `this` z zewnątrz.
I tu zaczynają się schody.

Spróbujmy na obiektach:

```javascript
this.ctx = 'global context';

const obj1 = {
  ctx: 'obj1 context',
  log: () => {
    console.log(this.ctx);
  }
};

const obj2 = {
  ctx: 'obj2 context',
  log: function () {
    console.log(this.ctx);
  }
};

obj1.log(); // global context
obj2.log(); // obj2 context
new obj2.log(); // undefined
```

W przypadku pierwszego obiektu wszystko wydaje się logiczne.
Mamy w środku _arrow function_, a _arrow function_ bierze sobie `this` z zewnątrz.
Dlatego w konsoli pojawiło się `global context`.

W ostatnim wywołaniu pojawiło się `undefined`, ponieważ został stworzony obiekt z funkcji `obj2.log()` (funkcja została wywołana jako konstruktor), a tym samym `this` wskazuje właśnie na ten obiekt (w którym `ctx` nie zostało zdefiniowane).
Czyli to też w miarę proste.

Ale `obj2 context`?
Z jakiegoś powodu `this` wskazuje nie na wnętrze funkcji `log`m tylko na `obj2`.
Z pomocą przychodzi [Stack Overflow](http://stackoverflow.com/questions/133973/how-does-this-keyword-work-within-a-function):
Kiedy funkcja jest wywołana jako metoda, wtedy `this` wskazuje na obiekt, który ma tę metodę.

Wszystko dobrze, ale wróćmy w takim razie do pierwszego obiektu.
Bo `obj1` to też jest obiekt, prawda?
A jeśli tak, to dlaczego _arrow function_ odniosło się do globalnego `this`, a nie do `obj1`?
Głowy nie dam, ale nasuwa mi się odpowiedź: bo _arrow function_ nigdy nie jest metodą.
Niech będzie.

I wreszcie przykład, na którym sam się już kilka razy złapałem -- przekazywanie funkcji przez referencję.

```javascript
function Demo5() {

  this.ctx = 'Demo5 context';

  this.handle = function () {
    console.log(this.ctx);
  };
}

function call(fn) {
  fn();
}

const obj = new Demo5();

obj.handle(); // Demo5 context
call(() => obj.handle()); // Demo5 context
call(obj.handle); // Uncaught TypeError: Cannot read property 'ctx' of undefined
```

Co tutaj się wydarzyło?

Wygląda na to, że przy przekazaniu metody przez referencję całkowicie zostało utracone `this`.
Zadziałało natomiast opakowanie wywołania funkcją.
W jakiś sposób, najpewniej poprzez mechanizm domknięcia (_closure_), referencja do `this` została w tym wywołaniu zachowana.

Ale może być jeszcze ciekawiej:

```javascript
function Demo6() {

  this.ctx = 'Demo6 context';

  this.handle = () => {
    console.log(this.ctx);
  }
}

function call(fn) {
  fn();
}

const obj = new Demo6();

obj.handle(); // Demo6 context
call(() => obj.handle()); // Demo6 context
call(obj.handle); // Demo6 context
```

Jedyną rzeczą, która została zmieniona, to metoda `handle`.
Teraz w zasadzie nie jest ona już metodą, tylko atrybutem, który jest funkcją.
I okazuje się, że tutaj wszystko działa.
Dlaczego?
Szczerze powiedziawszy, sam do końca nie wiem &#128578;.

Ten sam przykład pokażę może jeszcze na klasach, choć tak w zasadzie klasy to tak naprawdę tylko _syntactic sugar_ w JavaScripcie, pod spodem i tak siedzą funkcje.

```javascript
class Demo7 {

  ctx = 'Demo7 ctx';

  handle1 = () => {
    console.log(this.ctx);
  };

  handle2() {
    console.log(this.ctx);
  };
}

function call(fn) {
  fn();
}

const obj = new Demo7();

call(() => obj.handle1()); // Demo7 context
call(obj.handle1); // Demo7 context
call(() => obj.handle2()); // Demo7 context
call(obj.handle2); // Uncaught TypeError: Cannot read property 'ctx' of undefined
```

<hr/>

Notka na marginesie: Wszystkie powyższe przykłady były wykonywane w tzw. _[strict mode](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode)_, czyli z deklaracją `'use strict';`. Korzystałem z Google Chrome w wersji 56.