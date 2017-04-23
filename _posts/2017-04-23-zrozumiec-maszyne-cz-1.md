---
title:  Zrozumieć maszynę, cz. 1
layout: post
comments: true
tags: 
category: daj-sie-poznac
description: Ostatnio zrefaktorowałem komponent, dzięki czemu bardzo zmniejszyła się ilość boilerplate, kod po zmianie był dużo bardziej elegancki. Skrócił się, łatwiej się go czytało, był bardziej spójny. Z czasem jednak odkryłem, że refaktoring był zły, bo przez wzgląd na specyfikę działania Reacta i obiektowego JavaScriptu, mógł mieć negatywny wpływ na performance. Ale po kolei...
---

Komponent, o którym mowa, pochodzi z rozwijanego przeze mnie [projektu](https://github.com/withspace/serverless-webapp-starter) w konkursie [Daj się poznać](http://dajsiepoznac.pl/).
Komponent odpowiada za wyświetlenie menu, z którego można przejść do strony głównej profilu, strony z podsumowaniem notyfikacji, i na którym znajduje się przycisk, pozwalający użytkownikowi  wylogować się z aplikacji.
Ponieważ wykorzystane są kontrolki z [React Toolbox](http://react-toolbox.com/#/components), używanie React Routera okazało się problematyczne, więc ostatecznie nie korzystam z komponentu `Link`, tylko zmieniam ścieżki w aplikacji programistycznie ([tutaj](http://dzikowski.github.io/daj-sie-poznac/2017/04/22/react-toolbox-i-react-router/) możesz przeczytać dlaczego).


## Refaktoring

Kod komponentu przed refaktoringiem wyglądał tak:

```javascript
class ProfileMenu extends Component {

  static contextTypes = {
    router: React.PropTypes.object
  };

  openNotifications = () => {
    this.context.router.history.push('/notfications/home');
  };
  
  openProfile = () => {
    this.context.router.history.push('/profile/home');
  };

  render() {
    return (
      <IconMenu icon="more_vert" position="topRight" menuRipple>
        <MenuItem value="notifications" caption="Notifications" onClick={this.openNotifications}/>
        <MenuItem value="profile" caption="Profile" onClick={this.openProfile}/>
        <MenuItem value="signOut" caption="Sign out" onClick={this.props.auth.handleSignOut}/>
      </IconMenu>
    );
  }
}
```

Mamy tutaj duplikację, którą można łatwo i bezboleśnie usunąć -- funkcje `openNotications` i `openProfile` różnią się przecież tylko ścieżką.
Dodatkowo, przyszło mi jeszcze do głowy, czy nie spróbować zamienić metody `render` na atrybut będący _arrow function_ (tak jak wspomniane wcześniej `openProfile`).
Zawsze to dwie linijki mniej, mniej klamr i usunięte brzydkie słowo `return`.

Po refaktoringu komponent wyglądał tak:

```javascript
class ProfileMenu extends Component {

  static contextTypes = {
    router: React.PropTypes.object
  };
  
  open = link => () => {
    this.context.router.history.push(link);
  };

  render = () => (
    <IconMenu icon="more_vert" position="topRight" menuRipple>
      <MenuItem value="notifications" caption="Notifications" onClick={this.open("/notifications/home")}/>
      <MenuItem value="profile" caption="Profile" onClick={this.open("/profile/home")}/>
      <MenuItem value="signOut" caption="Sign out" onClick={this.props.auth.handleSignOut}/>
    </IconMenu>
  );
}
```

Już na pierwszy rzut oka widać, że kod jest dużo krótszy, a co ważne, równie zrozumiały jak poprzedni.
(W sumie spierałbym się, że nawet bardziej zrozumiały).

Na piewszy rzut oka refaktoring się udał, jednak -- tak jak pisałem wcześniej -- do kodu wkradły się dwa potencjalne problemy związane z wydajnością.
Zacznijmy od tego bardziej oczywistego.


## React i _arrow functions_

Pierwszy problem można łatwo wyśledzić, kiedy zmodyfikujemy trochę funkcję `open`:

```javascript
  open = link => {
    console.log('open', link);
    return () => {
      this.context.router.history.push(link);
    };
  }
```

Nic wielkiego tutaj się nie stało, po prostu zobaczymy w konsoli, jak często funkcja `open` jest wywołana.
TL;DR: Bardzo często, bo za każdym razem, kiedy React renderuje komponent.

Chodzi o to, że kiedy tylko zmieni się coś relewatnego -- zmiana stanu, przejście do innej ścieżki itp., React przerenderowuje odpowiednie komponenty.
W przypadku, kiedy w `props` mamy do czynienia ze stałą wartością, np. `caption="Profile"`, albo `onClick={this.props.auth.handleSignOut}`, sprawa jest prosta.
W przypadku, gdybyśmy podali funkcję, tak jak tutaj: `onClick={this.open("/profile/home")}`, React przy każdym renderowaniu musi wykonać tę funkcję, aby otrzymać wartość, którą może sobie wstawić w odpowiednie `props`.
Stąd też tak częste wywołania funkcji `open` i dlatego mój refactoring nie był dobrym pomysłem.
W `props` powinny być wstawiane wartości, a nie funkcje.

Wyciągnąwszy stąd wnioski, zaproponuję teraz trochę inny kod i pokażę, że to ciągle nie to:

```javascript
class ProfileMenu extends Component {
  
  ...
  
  open = link  => {
    this.context.router.history.push(link);
  };

  render = () => (
    <IconMenu icon="more_vert" position="topRight" menuRipple>
      <MenuItem value="notifications" caption="Notifications" onClick={() => this.open("/notifications/home")}/>
      <MenuItem value="profile" caption="Profile" onClick={() => this.open("/profile/home")}/>
      <MenuItem value="signOut" caption="Sign out" onClick={this.props.auth.handleSignOut}/>
    </IconMenu>
  );
}
```

Teraz mamy podobny problem, choć trochę innej natury.
W `onClick` jest już niby wartość, tyle że nie jest to żaden _primitive_, ani referencja do obiektu, ale _arrow function_.
W związku z tym każde renderowanie komponentu doprowadzi do stworzenia nowej funkcji, a coś takiego niepotrzebnie obciąża javascriptowy Garbage Collector (por. [ten wątek](http://stackoverflow.com/questions/36677733/why-jsx-props-should-not-use-arrow-functions) na Stack Overflow). 

Jeśli już więc chcemy koniecznie zrefaktorować ten kawałek komponentu, to pewnie należałoby zrobić coś takiego:

```javascript
  open = link  => {
    this.context.router.history.push(link);
  };
  
  openNotifications = () => this.open('/notifications/home');
  
  openProfile = () => this.open('/profile/home');
```

Tyle że moim zdaniem nie jest to już dobry refactoring, bo praktycznie nic na nim nie zyskujemy, a analiza kodu staje się trudniejsza.
Tworzymy niepotrzebną abstrakcję, gdzie duplikacja byłaby lepsza, bo jest czytelniejsza i łatwiejsza w utrzymaniu.
Dla przypomnienia, wcześniej kod był taki:

```javascript
  openNotifications = () => {
    this.context.router.history.push('/notfications/home');
  };
  
  openProfile = () => {
    this.context.router.history.push('/profile/home');
  };
```

Wydaje się, że niby nic, a implikacje, zwłaszcza w dużych aplikacjach, mogą być spore.
Na razie jednak poruszaliśmy się tylko w React i zagadnieniu, które wydaje mi się łatwiejsze w wydedukowaniu.
Druga kwestia, jakie powinno być `render`, wydaje mi się bardziej subtelna, bo musimy teraz wejść trochę głębiej w to, jak działa programowanie obiektowe w JavaScripcie.

Jaki konkretnie problem jest z tym związany, o tym będzie w drugiej części tego postu, bo robi się późno, a tłumaczenia zostało jeszcze sporo &#128521;.
