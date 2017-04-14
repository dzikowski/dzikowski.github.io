---
title: CI na GitHubie
layout: post
comments: true
tags: 
category: daj-sie-poznac
description: 
---

![cognito-schemat](/assets/img/posts/cognito-schemat.png)

W procesie rejestracji i logowania w Amazon Cognito nic skomplikowanego specjalnie nie ma, trzeba tylko pamiętać o tym, że przed zalogowaniem się, konto użytkownika musi zostać potwierdzone kodem weryfikacyjnym.
Trochę skomplikowane i nieco niespójne jest natomiast [JavaScriptowe SDK](https://github.com/aws/amazon-cognito-identity-js) do Amazon Cognito, ale to już historia na inny wpis.
Na razie zajmę się wyglądem komponentów na poszczególne kroki procesu rejestracji i logowania.


## Rejestracja

Podczas rejestracji wystarczy podać adres e-mail oraz hasło.
Po przesłaniu tych danych do Amazon Cognito przesłany zostanie e-mail z kodem potwierdzającym rejestrację.

![Mock na rejestrację](/assets/img/posts/starter-mock-register.png)


## Potwierdzenie rejestracji

Przed zalogowaniem się do aplikacji, należy podać kod jednorazowy, przesłany wcześniej mailem.
Nie można się zalogować, dopóki rejestracja nie została potwierdzona.

![Mock na rejestrację](/assets/img/posts/starter-mock-confirm-registration.png)


## Logowanie

![Mock na rejestrację](/assets/img/posts/starter-mock-sign-in.png)


## Implementacja

Implementacja formularzy w React Toolbox nie przebiega jednak super gładko.
Po pierwsze, okazało się, że trzeba napisać sporo logiki do trzymania wartości formularza.
Na przykład w komponencie `SignIn` muszę trzymać wartości z pól formularza w `state`, a także dwustronnie powiązać je z odpowiednim polem.
Cały komponent wygląda tak:

```javascript
class SignIn extends React.Component {

  state = {email: '', password: ''};

  handleChange = (name, value) => {
    this.setState({...this.state, [name]: value});
  };

  render() {
    return (
      <div>
        <h1>Sign In</h1>
        <Input
          type='text'
          label='E-mail Address'
          name='email'
          value={this.state.email}
          onChange={this.handleChange.bind(this, 'email')}
        />
        <Input
          type='password'
          label='Password'
          name='password'
          value={this.state.password}
          onChange={this.handleChange.bind(this, 'password')}
        />
        <Button label='Sign in' onClick={this.props.auth.handleSignIn} raised primary/>
      </div>
    );
  }
}
```

Nie znam niestety jeszcze za dobrze Reacta, więc nie wiem -- może to nie jest przez React Toolbox, może po prostu tak się robi formularze.

Druga sprawa, poważniejsza, to przeszkadzający na każdym kroku brak integracji z React Router.
Jeśli wstawiam `Link` z React Routera, nie mam na nim odpowiednich styli, a przyciski, linki, zakładki, wszystko z React Toolboxa o routerze nawet nie słyszało.
Tak jak pisałem [ostatnio](http://dzikowski.github.io/daj-sie-poznac/2017/04/07/react-toolbox/), jest na to kilka ticketów na GitHubie.
W komentarzach do jednego z nich znalazłem nawet przykładową implementację przycisku, który jest zintegrowany z React Routerem.
Prawdopodobnie z coś takiego niedługo dodam do projektu.
