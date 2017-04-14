---
title: Gdzie trzymać stan?
layout: post
comments: true
tags: 
category: daj-sie-poznac
description: Zanim przejdę do implementacji procesu rejestracji i logowania użytkownika w Amazon Cognito, należy odpowiedzieć sobie na podstawowe pytanie&#58; W którym miejscu aplikacji Reactowej powinien znajdować się stan, informujący o tym, że użytkownik jest zalogowany? 
---

Do tej pory korzystałem z rozwiązania tymczasowego, stan trzymany był w komponencie `Header`, w którym znajdują się też przyciski na zalogowanie i wylogowanie użytkownika.
Dla przypomnienia:

```javascript
class Header extends Component {

  state = {
    signedIn: false
  };

  handleSignIn = () => {
    this.setState({signedIn: true})
  };

  ...
  
  render() {
    ...
  }
}
```

Tymczasem informacja o tym, czy użytkownik jest zalogowany, czy nie, będzie potrzebna także w innych miejscach, w komponentach, które są poza `Header`.
W tej chwili nasuwają mi się trzy podejścia, jak można rozwiązać ten problem.


## Podejścia

- Można przesunąć ten stan wyżej, nawet do samego komponentu `App` i przekazywać go komponentom niżej przez `props`.
- Można wrzucić ten stan do kontekstu, takiego globalnie dostępnego stanu, analogicznie jak jest to zrobione w React Router.
- Można użyć biblioteki do zarządzania stanem, np. [Redux](https://github.com/reactjs/redux), albo [MobX](https://github.com/mobxjs/mobx).

Pierwsze rozwiązanie jest o tyle problematyczne, że gdybym chciał przekazywać informacje o użytkowniku dość _głęboko_ w hierarchii komponentów, przez wszystkie kolejne szczeble hierarchii muszę przekazywać `props`.
Innymi słowy, powstaje sporo zbędnego kodu.
(Inna sprawa, czy przekazywanie użytkownika tak _głęboko_ w hierarchii komponentów to czasem nie jest _bad design_ -- a tak na czuja powiedziałbym, że pewnie jest).

Drugie rozwiązanie, choć zastosowane np. w reactowym Routerze, wydaje się mieć więcej minusów niż plusów.
Tyler McGinnis niby powiedział o tym, że _it doesn't scale well_, ale przecież ja nie chcę tego użyć jako miejsca, gdzie będę trzymać stan aplikacji, tylko informację o tym, czy użytkownik jest zalogowany, czy nie; plus jeszcze może adres e-mail.
Dlatego zamiast od razu odrzucać kontekst, zajrzałem jeszcze na [odpowiednią stronę](https://facebook.github.io/react/docs/context.html) w dokumentacji Reacta, gdzie zaraz na początku znajduje się sekcja _Why Not To Use Context_.
Pozwolę sobie ją zacytować w całości:

> The vast majority of applications do not need to use context.
> 
> If you want your application to be stable, don't use context. It is an experimental API and it is likely to break in future releases of React.
> 
> If you aren't familiar with state management libraries like Redux or MobX, don't use context. For many practical applications, these libraries and their React bindings are a good choice for managing state that is relevant to many components. It is far more likely that Redux is the right solution to your problem than that context is the right solution.
> 
> If you aren't an experienced React developer, don't use context. There is usually a better way to implement functionality just using props and state.
> 
> If you insist on using context despite these warnings, try to isolate your use of context to a small area and avoid using the context API directly when possible so that it's easier to upgrade when the API changes.

Mnie to przekonuje, nie będę bawić się kontekstem.
Nie chcę też wprowadzać Reduxa, ani MobXa, bo wydaje mi się, że na razie nie ma co kombinować z nową biblioteką.
Nie wykluczam, że coś do zarządzania stanem się znajdzie w starterze, ale jeszcze nie teraz.

Zostało mi zatem przesunięcie stanu wyżej w hierarchii komponentów.
Wrzucę go do samego `App`.


## Klasa Auth

Informacja o tym, czy użytkownik jest zalogowany, czy też nie jest, to jednak nie wszystko.
Przydatny pewnie będzie w różnych komponentach adres e-mail użytkownika, a przecież są też jeszcze _handlery_, wywoływane w momencie zalogowania i wylogowania.
Na razie tylko dwa, ale znając proces rejestracji i logowania w Amazon Cognito, mogę powiedzieć, że będzie ich więcej: na zarejestrowanie użytkownika, na potwierdzenie rejestracji kodem jednorazowym i pewnie kilka innych.
Dlatego zdecydowałem się od razu opakować takie handlery w klasę:

```javascript
class Auth {

  constructor(updateUser) {
    this.updateUser = updateUser;
  }

  handleSignIn = () => this.updateUser({
    signedIn: true
  });

  handleSignOut = () => this.updateUser({
    signedIn: false
  });

}
```

Założenie jest podobne do tego, co było wcześniej: wywołanie handlerów powoduje zmianę stanu.
Nie chcę jednak dawać tej klasie dostępu do całego komponentu, albo całego stanu kompononentu; na razie wystarczy funkcja `updateUser`, która spowoduje aktualizację stanu.
W handlerach, zamiast bezpośrednio odwoływać się do stanu, który ma zostać zmieniony, wywołuję tę funkcję, przekazując jej nowy obiekt reprezentujący dane o użytkowniku.

Podczas samej aktualizacji nie chciałbym zmieniać całego stanu, ale tylko podmienić obiekt `state.user`.
Można to osiągnąć w następujący sposób:

```javascript
const newState = Object.assign(component.state, {user: user});
component.setState(newState);
```

Gdybym pisał tę funkcję wewnątrz komponentu `App`, wystarczyłoby zamiast `component` wpisać `this`.
Ponieważ jednak wyciągnąłem ją na zewnątrz, musiałem podać bezpośrednio odpowiedni kontekst.
Ostatecznie stworzyłem funkcję zwracającą funkcję:

```javascript
const updateUserStateIn = component => user => {
  console.log('Update user', user);
  const newState = Object.assign(component.state, {user: user});
  component.setState(newState);
};
```

A wykorzystanie tego wszystkiego w komponencie `App` wygląda tak:

```javascript
class App extends Component {

  auth = new Auth(updateUserStateIn(this));

  state = {
    user: {
      signedIn: false
    }
  };

  render() { ... }
}
```

Tym samym w naturalny sposób zrobił się podział na handlery powodujące zmianę stanu (`App.auth`) i na stan do odczytu (`App.state.user`).
Czy takie podejście jest dobre?
Na teraz wydaje mi się, że tak, jak najbardziej; ale jak zawsze -- czas pokaże.


## Przekazywanie stanu i handlerów

Dalsza część komponentu `App` wygląda następująco:

```javascript
class App extends Component {

  ...

  render() {
    return (
      <MuiThemeProvider>
        <Router>
          <div>
            <Header auth={this.auth} user={this.state.user}/>
            <Routes user={this.state.user}/>
          </div>
        </Router>
      </MuiThemeProvider>
    );
  }
}
```

Komponent `Header` wymaga zarówno dostępu do informacji o użytkowniku, jak i do handlerów.
W zależności od tego, czy użytkownik jest zalogowany, czy nie, `Header` pokazuje przycisk logowania lub menu użytkownika.
Aby obsłużyć przycisk zalogowania i wylogowania potrzebne z kolei są handlery.

Do `Routes` przekazuję natomiast tylko stan użytkownika, żeby zablokować dostęp do `/profile` użytkownikowi, który nie jest zalogowany (tak, zrobię to już teraz, przy okazji).


## Nowy Header

Komponent `Header` dość mocno mi się skrócił.
Przede wszystkim mogłem wyrzucić z niego cały stan i handlery, a tym samym mogłem go przerobić na komponent będący tzw. _pure function_.
Czyli zamiast tego:

```javascript
class Header extends React.Component {
  render() {
    return (
      // odwołanie do props jako: this.props.sth
    );
  }
}
```

Zrobić to:

```javascript
const Header = (props) => (
  // odwołanie do props jako: props.sth
);
```

Po takim przekształceniu zyskujemy mnóstwo na czytelności i przewidywalności kodu, bo po pierwsze, sam komponent jest krótszy i łatwiej go przeczytać, a po drugie wiemy już na pewno, że nie będzie miał stanu, który zawsze komplikuje logikę i utrudnia zrozumienie kodu.

Nowy `Header`:

```javascript
const Header = (props) => (
  <AppBar
    title={<Link to="/" style={styles.title}>Serverless WebApp Starter</Link>}
    onTitleTouchTap={this.goHome}
    iconElementRight={
      props.user.signedIn ? getProfileMenu(props.auth.handleSignOut) : getSignInButton(props.auth.handleSignIn)
    }
  />
);
```


## Nowe Routes

W `Routes` mogę wreszcie zrobić to, o czym myślałem już wcześniej, czyli zablokować dostęp do ścieżki `/profile` dla użytkownika, który nie jest zalogowany.
Teraz do komponentu `Routes` przekazuję już obiekt z danymi użytkownika -- pora go wykorzystać.
(Fajny [przykład](https://github.com/tylermcginnis/react-router-firebase-auth/blob/master/src/components/index.js) znalazłem na GitHubie u Tylera McGinnisa, i to na nim głównie się opierałem).

Po pierwsze stworzyłem komponent, który opakowuje Route w taki sposób, że w momencie, kiedy użytkownik jest zalogowany, renderowany jest odpowiedni komponent, a w momencie, kiedy użytkownik nie jest zalogowany, aplikacja przekierowuje do ścieżki `/`.

```javascript
const PrivateRoute = ({component: Component, user, ...rest}) => (
  <Route
    {...rest}
    render={(props) => user.signedIn === true
      ? <Component {...props} />
      : <Redirect to={{pathname: '/', state: {from: props.location}}}/>}
  />
);
```

Po drugie, zmodyfikowałem `Route` do `Profile`, żeby było opakowane tym komponentem:

```javascript
const Routes = (props) => (
  <div>
    <Route exact path="/" component={Home}/>
    <PrivateRoute path="/profile" component={Profile} user={props.user}/>
  </div>
);
```

I tyle.
Teraz użytkownik może się zalogować i wejść na `/profile`, a po wylogowaniu zostanie automatycznie przekierowany do `/`.
Wszystko działa tak jak powinno.


## Update 2017.04.14

Tak jak napisał **Bubu**, aktualizację stanu można napisać dużo krócej niż z wykorzystaniem `Object.assign`, posługując się _spread operatorem_.
W sumie będzie to tak krótko, że nie trzeba już trzymać tego w osobnej funkcji &#128521;

Zaktualizowany kawałek komponentu:

```javascript
class App extends Component {

  auth = new Auth(user => {
    console.log('Update user', user);
    this.setState({...this.state, user});
  });

  state = {
    user: {
      signedIn: false
    }
  };

  render() { ... }
}
```
