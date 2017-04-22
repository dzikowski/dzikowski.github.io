---
title: React Toolbox i React Router
layout: post
comments: true
tags: 
category: daj-sie-poznac
description: Jedną z wielkich wad React Toolbox jest kompletny brak wsparcia dla React Routera. Domyślne komponenty obsługują tylko zwykłe linki, co bywa kłopotliwe i doczekało się nawet całkiem pokaźnej liczby <a href="https://github.com/react-toolbox/react-toolbox/issues?utf8=%E2%9C%93&q=is%3Aissue%20%22react%20router%22">issues</a> na GitHubie. Trzeba jakoś obejść ten problem.
---

Rozwiązań jest kilka.
Takie najprostsze to chyba wrzucenie komponentu `Link` z React Routera jako `children` do odpowiednich komponentów React Toolbox, na przykład w taki sposób:

```javascript
<IconMenu icon="more_vert" position="topRight" menuRipple>
  <MenuItem value="profile">
    <Link to="/profile/home">Profile</Link>
  </MenuItem>
  <MenuItem value="signOut" caption="Sign out" onClick={this.props.auth.handleSignOut}/>
</IconMenu>
```

Jeśli chodzi o funkcjonalność -- wszystko działa.
Tyle że pojawia się problem ze stylami.

![React Toolbox - wrong styles](/assets/img/posts/react-toolbox-drawback-2.png)

Tekst staje się biały i widać go tylko po najechaniu myszką na pozycję w menu.

Inna sprawa, że działa tylko kliknięcie na sam tekst.
Jeśli kliknę obok, menu się zamyka, ale nie przechodzę do innego komponentu -- w końcu `Link` obejmuje tylko tekst, a nie wypełnia całego `MenuItem`.

A gdyby tak wyrzucić `MenuItem` i zostawić sam `Link`?

```javascript
<IconMenu icon="more_vert" position="topRight" menuRipple>
  <Link to="/profile/home"/>
  <MenuItem value="signOut" caption="Sign out" onClick={this.props.auth.handleSignOut}/>
</IconMenu>
```

Takie podejście było z góry skazane na niepowodzenie.
Jest tekst, który jest biały, pozycja w menu się nie podświetla po najechaniu myszką i jest niższa.
W końcu przecież nie mamy ostylowania z `MenuItem`.

Po kliknięciu na `Link` przechodzimy co prawda do innego komponentu, ale za to samo menu się nie zamyka...

Wystarczająco dużo problemów.
Postanowiłem obsłużyć przechodzenie do innego komponentu programistycznie przy kliknięciu w `MenuItem` -- podpiąć odpowiednią funkcję w atrybut `onClick`.

Okazało się, że jest to rozwiązanie w miarę proste, choć sporo w internecie szumu informacyjnego na ten temat.
API React Routera zmieniało się w trakcie rozwoju projektu, teraz od niedawna jest wersja czwarta (już nawet `4.1.1`), ale jeszcze w `4-beta` wyglądało inaczej.
Okazało się też, że trzeba dopisać kilka rzeczy, które teoretycznie mogłyby być prostsze.

Ostatecznie mam komponent na `ProfileMenu`, który wygląda tak:

```javascript
class ProfileMenu extends Component {

  static contextTypes = {
    router: React.PropTypes.object
  };

  openProfile = () => {
    this.context.router.history.push('/profile/home');
  };

  render() {
    return (
      <IconMenu icon="more_vert" position="topRight" menuRipple>
        <MenuItem value="profile" caption="Profile" onClick={this.openProfile}/>
        <MenuItem value="signOut" caption="Sign out" onClick={this.props.auth.handleSignOut}/>
      </IconMenu>
    );
  }
}
```

Problem rozwiązany, wszystko działa, warto jednak zatrzymać się na chwilę i zastanowić jak to wszystko działa i jakie są też wady takiego rozwiązania.

Po pierwsze, obiekt routera trzymany jest w kontekście (`this.context`), o czym wspominałem już we wpisie sprzed kilku tygodni, kiedy zastanawiałem się, [gdzie trzymać stan](http://dzikowski.github.io/daj-sie-poznac/2017/03/25/gdzie-trzymac-stan/).
Kontekst to takie globalne miejsce, gdzie można wrzucać jakieś obiekty z aplikacji, ale też nie powinno wrzucać się tam za dużo.
Używanie kontekstu jest odradzane; jeśli chcesz coś zachować w kontekście, duże szanse, że robisz coś źle, że jest to _bad design_.
Niemniej jednak React Router tam siedzi, najpewniej słusznie.

Domyślnie `context` w komponentach nie jest zdefiniowany i żeby użyć routera, musimy zakomunikować Reactowi, że chcemy go używać.
Stąd następujęce linijki:

```javascript
  static contextTypes = {
    router: React.PropTypes.object
  };
```

W tym miejscu mówimy Reactowi, że tak, będziemy używać routera, który jest obiektem, proszę mi go wrzucić do kontekstu i udostępnić w komponencie.

Kiedy już mamy router w kontekście, możemy go użyć, żeby przejść w aplikacji w inne miejsce:

```javascript
  openProfile = () => {
    this.context.router.history.push('/profile/home');
  };
```

I wreszcie przekazuję tę funkcję jako `onClick` dla odpowiedniej pozycji menu:

```javascript
        <MenuItem value="profile" caption="Profile" onClick={this.openProfile}/>
```

Wada takiego rozwiązania narzuca się sama: dużo kodu do napisania.
Musiałem dodać obiekt informujący Reacta, że potrzebuję router z kontekstu i dodać handler do przechodzenia pod określony link.
Musiałem też zmienić komponent na klasę -- już nie wystarczy sama funkcja, bo potrzebuję dodatkowych atrybutów.
I wreszcie: jeśli chciałbym użyć tego w innym komponencie -- nie da się.
Cały ten kod trzeba napisać od nowa dla kolejnego komponentu.

---

Spoglądając jeszcze na komponent `ProfileMenu` mogą nasuwać się oczywiste dla laika refaktoringi upiększające kod.
Bo przecież w samym komponencie można by zamiast `render() { return ( ... ); }` używać _arrow function_: `render = () => ( ... );`.
Wygląda to dużo bardziej elegancko.

Inna sprawa -- może by jeszcze zgeneralizować `openProfile` do czegoś takiego:

```javascript
  open = link => () => {
    this.context.router.history.push(link);
  };
```

Przecież potem można w komponencie użyć `onClick={this.open('/profile/home')}`.
Też wydaje się ładniejsze.

Z pozoru eleganckie refaktoringi w tym wypadku jednak nie są takie fajne, bo mają negatywny wpływ na performance.
Żeby to wytłumaczyć, trzeba jednak wgryźć się trochę głębiej w to, jak działa React, i w to, jak działa obiektowy JavaScript.
I to jest opowieść na następny post.