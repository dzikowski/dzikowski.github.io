---
title: Serverless Amazon Cognito
layout: post
comments: true
tags: 
category: daj-sie-poznac
description: Nadszedł wreszcie czas na implementację jednej z podstawowej funkcjonalności <a href="https://github.com/withspace/serverless-webapp-starter">startera</a>, czyli połączenie go z Amazon Cognito. Jest już aplikacja, są formularze, przez które można się przeklikać, nie ma jednak połączenia z AWSem. A żeby to zrobić, musimy przejść przez kilka kroków, które zostały opisane w tym tutorialu.
---

Ten wpis jest znacznie dłuższy niż pozostałe na moim blogu, jednak nie chciałem go dzielić na części.
W końcu jest to tutorial, który od początku do końca pokazuje, jak podłączyć aplikację w React z Amazon Cognito.
Jest to też wpis, w którym łączy się wiele wątków poruszanych w ramach rozwoju projektu, więc niejednokrotnie będę odsyłał do innych moich postów.
Jeśli mimo tego chcesz przejść przez to ze mną od początku do końca, przygotuj sobie kawę i coś do jedzenia, bo trochę czasu na to poświęcimy.


## AWS i konfiguracja Amazon Cognito

Jeśli nie masz jeszcze konta na [Amazon Web Services](https://aws.amazon.com), najpierw musisz je założyć.
Następnie należy wejść na usługę Amazon Cognito i utworzyć _user pool_ (pulę użytkowników?).
W międzyczasie zauważysz, jak dużo usług oferuje Amazon i jak trudno na podstawie nazw zidentyfikować, do czego służą.
(Jeśli chcesz nabrać ogólnego rozeznania i dowiedzieć się, jaka usługa do czego służy, to polecam zajrzeć na zestawienie [AWS in Plain English](https://www.expeditedssl.com/aws-in-plain-english)).

Po zalogowaniu się i przejściu na stronę Amazon Cognito warto od razu wybrać najbliższy region z menu po prawej u góry -- jeśli mielibyśmy tworzyć aplikację dla Polski, najprawdopodobniej będzie to Frankfurt.
Dzięki temu dane użytkowników będą przechowywane blisko samych użytkowników i krótszy będzie czas dostępu do usługi.
Inna sprawa, że warto trzymać wrażliwe dane na terenie Unii Europejskiej, bo przepisy w USA są mniej restrykcyjne, jeśli chodzi o ochronę danych osobowych, zwłaszcza danych osób nie będących obywatelami USA.

![Amazon Cognito WWW](/assets/img/posts/amazon-cognito-www.png)

Teraz należy wybrać i `Manage your User Pools` i następnie `Create a User Pool`.
Znajdziesz się w kreatorze, w którym krok po kroku możesz skonfigurować nowe _User Pool_.
Można też wybrać opcję `Review defaults`, aby zobaczyć od razu podsumowanie domyślnych ustawień i dopiero potem wejść od razu w ten krok, w którym chcemy coś zmienić.
Polecam tę opcję, a poniżej tylko kilka rzeczy, które na teraz należy ustawić samodzielnie:

 1. Nazwa dla _User Pool_, choć to w sumie oczywiste. Ja najczęściej daję nazwę domeny, na której ma chodzić aplikacja.
 1. W `Apps` należy dodać aplikacje, które będą korzystać z danej _User Pool_.
    Jest to konieczne, aby dostać klucz, który pozwoli się połączyć z Amazon Cognito.
    Należy podać nazwę, ale także odznaczyć `Generate client secret`.
    Ten dodatkowy klucz, _secret_, nie będzie do niczego potrzebny, bo i tak nie da się go ukryć przed użytkownikami.
    W końcu robimy aplikację _serverless_, wszystkie zasoby są publiczne.
    
Wprowadzone ustawienia spowodują stworzenie _User Pool_, w której jedynym wymaganym atrybutem będzie adres e-mail, użytkownicy będą mogli się samodzielnie rejestrować, ale muszą potwierdzić adres e-mail przesłanym im po rejestracji hasłem jednorazowym.
Jeśli chcesz przejrzeć inne ustawienia kreatora, pewnie odkryjesz, że możesz zmodyfikować wiadomości, które będą przesyłane mailowo, pozwolić na [_Multi-factor authentication_](https://en.wikipedia.org/wiki/Multi-factor_authentication), a także zdefiniować [Lambdy](https://en.wikipedia.org/wiki/AWS_Lambda), które mają być wykonane, np. kiedy użytkownik wysłał dane logowania, albo tuż po zalogowaniu.

Po stworzeniu _User Pool_ pojawią się dodatkowe informacje:

 - **Pool Id**, czyli identyfikator twojej _User Pool_.
 - **Pool ARN**, czyli taka amazonowa nazwa twojej _User Pool_, [unikalny identyfikator](http://docs.aws.amazon.com/general/latest/gr/aws-arns-and-namespaces.html) zasobów Amazona.
   Jeśli się dobrze przypatrzysz, zauważysz, że końcówka _Pool ARN_ to twoje _Pool ID_.
 - Wreszcie w `Apps` pojawiło się **App client id**, czyli identyfikator dla utworzonej aplikacji.

Aby połączyć się z Amazon Cognito, potrzebny będzie zarówno _Pool Id_, jak i _App client id_.
Teraz tylko kwestia, w jaki sposób podać te parametry w aplikacji, żeby jednocześnie nie dzielić się produkcyjną konfiguracją na GitHubie.
Odpowiedź w sumie jest prosta -- przekażemy je w zmiennych środowiskowych.


## Webpack a zmienne środowiskowe

Najpierw przypomnę jeszcze raz o jednej z ważniejszych kwestii, o której musimy cały czas pamiętać.
Robimy aplikację _serverless_, więc tak czy inaczej wartości zmiennych, które mają być wykorzystane w działającej aplikacji (a nie tylko np. podczas jej budowania), staną się publiczne.
Nie ma jednak sensu zaszywać ich w kodzie, ani plikach konfiguracyjnych, skoro możemy użyć zmiennych środowiskowych, które się świetnie nadają do takich rzeczy.
Tym bardziej, że pewnie będziemy używać innych _User Pools_ dla działającej aplikacji, a innej dla testów.

Zmienne środowiskowe możemy łatwo przekazać do Webpacka, a potem sam Webpack może je udostępnić w aplikacji.
Wystarczy dodać odpowiedni plugin do `webpack.config.js`:

```javascript
const webpack = require('webpack');

const noEnvVar = name => {
  throw `${name} environment variable is undefined.`;
};

const DefinePluginConfig = new webpack.DefinePlugin({
  COGNITO_POOL_ID: JSON.stringify(process.env.COGNITO_POOL_ID || noEnvVar('COGNITO_POOL_ID')),
  COGNITO_APP_CLIENT_ID: JSON.stringify(process.env.COGNITO_APP_CLIENT_ID || noEnvVar('COGNITO_APP_CLIENT_ID'))
});
```

I potem kawałek dalej:

```javascript
module.exports = {
  ...
  plugins: [..., DefinePluginConfig]
};
```

`COGNITO_POOL_ID` oraz `COGNITO_APP_CLIENT_ID` to będą właśnie te zmienne, pod które będą wstawione odpowiednie ID z Amazon Cognito.
W dodatku dopisałem jeszcze funkcję `noEnvVar`, która spowoduje, że start aplikacji się nie powiedzie, jeśli nie będą podane wartości tych zmiennych.
Wolę stosować takie podejście -- jasny komunikat błędu przy samym starcie, niż dawanie wartości domyślnych, albo błąd w trakcie działania aplikacji.

Teraz Webpack się nie uruchomi, a w konsoli pojawi się między innymi:

```
COGNITO_POOL_ID environment variable is undefined.
```

Mogę się pozbyć tych błędów, definiując zmienne środowiskowe wprost przed wywołaniem polecenia.
Np. tak:

```bash
COGNITO_POOL_ID='myPool123' COGNITO_APP_CLIENT_ID='myAppClient456' npm start
```

Zmienne te są w tym momencie dostępne globalnie w JavaScripcie.
Albo może dokładniej: Define Plugin podmieni ich wystąpienia w JavaScripcie na wartości ze zmiennych środowiskowych.
(Dlatego lepiej przy każdej zmianie związanej z tymi zmiennymi od nowa odpalić Webpacka, bo tak łatwo się nie aktualizują w _hot reload mode_).

Żeby jednak nie polegać za bardzo na wartościach globalnych i zamiast tego elegancko importować obiekty, stworzę jeszcze plik `config.js` z następującą zawartością:

```javascript
export const cognitoConfig = {
  poolId: COGNITO_POOL_ID,
  appClientId: COGNITO_APP_CLIENT_ID
};
```

Teraz możemy sprawdzić, czy wartości ze zmiennych rzeczywiście lądują w tym obiekcie.
Możemy na przykład w `index.js` dodać na chwilę:

```javascript
import {cognitoConfig} from './config';
console.log(cognitoConfig);
```


### Czy wartości tych zmiennych wrzucać na GitHuba?

No właśnie.
Jak rozwiązać ten problem?
Rzucać developerowi na twarz przy pierwszym uruchomieniu błędy, że nie ma tych zmiennych?
Samemu każdorazowo dodawać je przed `npm start`?
Napisać swój skrypt, nie wrzucany na GitHuba, w którym będę ustawiał te zmienne i odpalał aplikację?
Napisać instrukcję?

[![XKCD Manuals](https://imgs.xkcd.com/comics/manuals.png)](https://xkcd.com/1343/)

Kiedy mamt tego typu zagwozdki, przypominam sobie właśnie ten komiks XKCD.
Często decyzja o tym, że jakieś wartości wyciągnąć na zewnątrz do pliku konfiguracyjnego, czy też do zmiennych środowiskowych to tak naprawdę unikanie odpowiedzialności i przerzucenie jej na kogoś innego.
Więc warto się zastanawiać, żeby naszą aplikację było łatwo użyć i ograniczać konieczność jej konfiguracji.

Sam zdecydowałem się wrzucić prawdziwe wartości zmiennych na GitHuba, ale tylko dla skryptu `start` w `package.json`.
O tak:

```javascript
{
  ...
  "scripts": {
    "start": "COGNITO_POOL_ID='myPool123' COGNITO_APP_CLIENT_ID='myAppClient456' webpack-dev-server --content-base app --port 9090 --inline --hot",
    ...
  },
  ...
}
```

Dlaczego tak robię i upubliczniam te wartości?

 1. _User Pool_, dla której dane wrzuciłem na GitHuba, została stworzone wyłącznie na potrzeby startera. Kiedy zrobię online demo startera, użyję tam tych samych wartości które i tak będą publiczne, bo to przecież _serverless_.
 1. Raczej nikt nie użyje przypadkowo moich wartości na produkcji, bo zmienne dorzucę tylko do trybu developerskiego. A nawet jeśli ktoś skopiuje wartości zmiennych, to i tak tylko ja mam dostęp do danych.
 1. I ostatnie, bardzo ważne: jeśli wrzucę te zmienne do projektu, a przede wszystkim do trybu developerskiego, to programistom łatwiej będzie zacząć pracę ze staterem.
   A w `README` projektu mogę dać _disclaimer_, że ostrożnie ze zmiennymi i że te, które są, są tylko jako preview.

Na wszelki wypadek dodam jeszcze alarm dla billingu w AWS, żebym został powiadomiony, kiedy skończą mi się darmowe limity i będę musiał zacząć płacić.
Podążałem zgodnie z [tym](http://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/free-tier-alarms.html) tutorialem.
Najpierw w opcjach billingu ustawiłem, że chcę otrzymywać alarmy, a następnie ustawiłem alarm, jeśli koszt AWS przekroczy 0,01 USD.
Szczerze mówiąc nie liczę na to, że dla mojej demonstracyjnej _User Pool_ zostaną przekroczone darmowe limity, ale lepiej dmuchać na zimne i w razie czego mieć możliwość szybkiego wycofania się z tego pomysłu.



## Korzystanie z Amazon Cognito

Na szczęście komunikacji z Amazon Cognito nie trzeba pisać samodzielnie, wystarczy skorzystać z  biblioteki [amazon-cognito-identity-js](https://github.com/aws/amazon-cognito-identity-js).
Oprócz tego, konieczne jest jeszcze zainstalowania i dodanie do Webpacka Loadera dla plików JSON, bo z takich plików korzysta biblioteka do Cognito.

```bash
npm install --save-dev json-loader
npm install --save amazon-cognito-identity-js
```

A w pliku `webpack.config.js`:

```javascript
...

const JSONLoader = {
  test: /\.json$/,
  loader: 'json'
};

...

module.exports = {
  ...
  module: {
    loaders: [..., JSONLoader]
  },
  ...
};
```

Teraz można już korzystać z biblioteki.
Jej API jest może trochę zbyt rozbudowane i momentami niespójne, ale doskonale spełnia swoją rolę i w zupełności wystarcza do tego, żeby obsłużyć podstawowy przepływ, od rejestracji, poprzez potwierdzenie konta, aż do zalogowania użytkownika.


<p class="info-box">
 Przypominam, że Amazon Cognito jest integrowane z istniejącym <a href="https://github.com/withspace/serverless-webapp-starter">starterem</a> aplikacji w React.js.
 Jeśli chcesz zobaczyć kontekst, najlepiej zajrzyj na <a href="https://github.com/withspace/serverless-webapp-starter/pull/6">ten pull request</a> na GitHubie, w którym opisywane zmiany dołączane są do projektu.
 
 <br/>
 <br/>
 
 Jeśli chcesz jeszcze zobaczyć z bardzo wysokiego poziomu, jak działa rejestracja i logowanie w Amazon Cognito, a także jak wyglądają poszczególne widoki na interfejsie do rejestracji, potwierdzenia rejestracji i logowania, zajrzyj do mojego poprzedniego wpisu <a href="http://dzikowski.github.io/daj-sie-poznac/2017/04/09/cognito-rejestracja-i-logowanie/">Cognito: rejestracja i logowanie</a>.
</p>


### Organizacja kodu

Pamiętasz może klasę `Auth`, w której trzymam kontekst użytkownika?
Pisałem o niej we wpisie [Gdzie trzymać stan?](http://dzikowski.github.io/daj-sie-poznac/2017/03/25/gdzie-trzymac-stan/)
Klasa ta miała z założenia być fasadą dla różnych funkcjonalności związanych z rejestracją i logowaniem użytkownika.

Oprócz tego były jeszcze same dane użytkownika, które trzymałem w oddzielnym obiekcie.
Teraz zamiast zwykłego, dynamicznego obiektu, będzie to obiekt klasy `User`:

```javascript
class User {

  constructor(email, signedIn) {
    this.email = email;
    this.signedIn = signedIn;
  }

  static signedIn = (email) => new User(email, true);

  static signedOut = (email) => new User(email, false);
}
```

Obiekt tej klasy, reprezentujący aktualnego użytkownika, jest trzymany w stanie głównego komponentu aplikacji (`App`).
Aby React odświeżył wyrenderowanego HTMLa po zmianie użytkownika, musi być on aktualizowany metodą `setState` danego komponentu.
Aby użytkownik mógł być aktualizowany przez klasę `Auth`, musi ona mieć możliwość wywołania `setState` na komponencie `App` (a przy okazji przyda się też dostęp do użytkownika, który jest w stanie komponentu).
Stąd też przekazuję do klasy `Auth` funkcję, służącą do aktualizacji stanu użytkownika:

```javascript
class App extends Component {

  auth = new Auth({
    updateUser: user => this.setState({...this.state, user})
  });

  state = {
    user: User.signedOut(null)
  };

  ...
}
```

Zauważ przy tym, że obiekt klasy `Auth` nigdy nie będzie zmieniać swojego stanu, a jedynie wywoływać zmiany (części) stanu komponentu `App`.
Aby obsłużyć całość podstawowych funkcjonalnoći Amazon Cognito, wystarczy nam mniej więcej taka struktura klasy `Auth`:

```javascript
class Auth {

  constructor({updateUser}) {

    this.updateUser = (user) => {
      console.log('Update user', user);
      updateUser(user);
    };

    this.cognitoService = new CognitoService();
  }

  register({email, password, onSuccess, onFailure}) { ... }

  confirmRegistration({email, code, onSuccess, onFailure}) { ... }

  requestCodeAgain({email, onSuccess, onFailure}) { ... }

  signIn({email, password, onSuccess, onFailure}) { ... }

  signOut({email}) { ... }
}
```

Dodatkowo mam jeszcze klasę `CognitoService`, która posiada z grubsza takie same metody jak `Auth`, tyle że ma inną odpowiedzialność.
`CognitoService` bezpośrednio odwołuje się do Amazon Cognito, natomiast, `Auth` wywołuje odpowiednie metody z `CognitoService`, a także wywołuje aktualizacje stanu użytkownika, jeśli jest to pożądane.

Sam stan użytkownika trzymany jest ciągle w komponencie `App`.
Nie zamierzam teraz tego zmieniać, uważam, że na razie takie proste rozwiązanie w zupełności wystarczy, a nie ma sensu już teraz komplikować sobie życia bibliotekami do zarządzania stanu w stylu Redux, MobX, czy Flux.

`CognitoService` będzie wywoływane wyłącznie z poziomu klasy `Auth`, klasa `Auth` natomiast z poziomu odpowiednich komponentów.
Wszystkie zmiany stanu związane z wyświetlaniem loadera, wyświetlaniem błędów, czy przekierowaniami pomiędzy komponentami będą obługiwane także na poziomie poszczególnych komponentów.
Takie rozwiązanie doprowadzi do pewnej duplikacji, jednak liczę na to, że dzięki temu będzie czytelniejsze.


### Rejestracja

Zakładam, że podczas rejestracji do aplikacji wystarczy podać adres e-mail oraz hasło.
Po podaniu tych informacji i wysłaniu ich do Amazon Cognito, aplikacja powinna zapamiętać adres e-mail i przekierować do widoku z potwierdzeniem rejestracji.

Mamy w tej chwili komponent `Register`, który wyświetla formularz rejestracji.
Komponent ten docelowo powinien być odpowiedzialny za walidację (której jednak teraz nie zrobię), pokazywanie, czy dane w tej chwili się wczytują, czy też wystąpił błąd rejestracji.

Ten komponent oraz metody odpowiedzialne za rejestrację przejdę krok po kroku, reszta będzie skrótowo.
A na początek o tym, jaki może być stan komponentu:

```javascript
class Register extends React.Component {

  static emptyState = () => ({
    email: '',
    password: '',
    passwordRepeated: '',
    error: null,
    loading: false,
    success: false
  });

  state = Register.emptyState();
  
  handleChange = (name) => (value) => {
    this.setState({...this.state, [name]: value});
  };
  
  ...
}
```

Pierwsze trzy atrybuty to pola formularza.
Do rejestracji potrzebny jest adres e-mail i hasło, dodatkowo dobrą praktyką jest, aby w formularzach trzeba było powtórzyć hasło.
Kolejny atrybut, `error`, to obiekt reprezentujący błąd.
W tej chwili wrzucane tam będę błędy Amazon Cognito.
Wreszcie trzymam w stanie komponentu flagi `loading` (żeby pokazać loadera) oraz `success` (żeby przekierować do innego komponentu).

Poniżej jeszcze odpowiedni kawałek metody `render`:

```javascript
  render() {
    return (
      <div>
        ...
        <Input
          type='text'
          label='E-mail Address'
          name='email'
          value={this.state.email}
          onChange={this.handleChange('email')}
        />
        ...
        {this.state.error && <ErrorMessage text={this.state.error.message}/>}
        {this.state.loading
          ? <Loader text="Registering user..."/>
          : <Button label='Register' onClick={this.register} raised primary/>
        }
        {this.state.success && <Redirect push={true} to="/profile/confirm-registration"/>}
      </div>
    );
  }
}
```

Jest tutaj pole tekstowe na adres e-mail, które pochodzi z biblioteki [React Toolbox](http://react-toolbox.com/#/components/input).
W momencie, kiedy wartość pola się zmienia, wywoływana jest metoda zmieniająca stan komponentu (w tym wypadku wrzucająca do `state.email` wpisaną wartość).
Poniżej mam zdefiniowane pozostałe pola, których jednak nie pokazałem na tym listingu, a jeszcze niżej jest końcówka formularza z wyświetlaniem błędów, loadera lub przycisku i z przekierowaniem pod inny adres.

Jak widzisz odpowiednie komponenty pokazuję warunkowo w zależności od bieżącego stanu.
Jeśli mamy błąd, to pokaż wiadomość błędu.
Jeśli w tej chwili wczytujemy, to pokaż loadera, w przeciwnym wypadku pokaż przycisk umożliwiający rejestrację.
Jeśli wreszccie stan jest `success`, to przekieruj mnie pod inny adres.

`ErrorMessage` oraz `Loader` to są moje własne komponenty (możesz je podejrzeć w [pull requeście](https://github.com/withspace/serverless-webapp-starter/pull/6/files)).
`Button` pochodzi z React Toolbox, a `Redirect` z React Routera.

Ta końcówka metody `render` nie jest specjalnie ładna i wypadałoby ją zrefaktorować, a najlepiej w ogóle trzymać `loading`/`error`/`success` w jakimś innym komponencie, żeby można było go użyć w wielu miejscach, jednak _first things first_.
Najpierw niech wszystko zadziała i powstanie _business value_.

Po kliknięciu na przycisk wywołana jest rejestracja użytkownika.
Odpowiedni handler wygląda tak (handler, a nie metoda, tak jak pisałem już [tutaj](http://dzikowski.github.io/daj-sie-poznac/2017/03/23/pierwszy-mock/)):

```javascript
  register = () => {

    const onSuccess = () => {
      this.setState({...this.emptyState(), success: true});
    };

    const onFailure = (error) => {
      this.setState({...this.state, error, loading: false});
    };

    this.setState({...this.state, loading: true});

    this.props.auth.register({
      email: this.state.email,
      password: this.state.password,
      onSuccess,
      onFailure
    });
  };
```

Najpierw definiuję sobie odpowiednie funkcje, które będa wywołane, gdy rejestracja zakończy się sukcesem lub błędem.
W przypadku sukcesu po prostu zeruję stan i ustawiam `success` jako `true`, dzięki czemu wyrenderowany zostanie komponent `Redirect`, który doprowadzi do przekierowania do strony z potwierdzeniem rejestracji.
W przypadku niepowodzenia rejestracji uaktualniam stan o obiekt błędu oraz zaznaczam, że skończyło się ładowanie, żeby mógł zniknąć loader.

Zaraz po zdefiniowaniu tych dwóch funkcji ustawiam `loading` na `true`, żeby pokazał się loader, a następnie wywołuję odpowiednią metodę z dostępnego w `props` obiektu klasy `Auth`.

W klasie `Auth` wygląda to tak:

```javascript
  register({email, password, onSuccess, onFailure}) {

    const registerSuccess = () => {
      this.updateUser(User.signedOut(email));
      onSuccess();
    };

    this.cognitoService.register({email, password, ...{onSuccess: registerSuccess}, onFailure});
  }
```

Żadna magia.
Modyfikuję funkcję `onSuccess`, żeby jeszcze zaktualizowała dane użytkownika, a następnie wywołuję metodę `register` z `CognitoService`.
Z tej ostatniej klasy muszę pokazać trochę więcej niż tylko samą metodę:

```javascript
import {AuthenticationDetails, CognitoUserPool, CognitoUserAttribute, CognitoUser} from 'amazon-cognito-identity-js';
import {cognitoConfig} from "../config";

class CognitoService {

  userPool = new CognitoUserPool({
    UserPoolId: cognitoConfig.poolId,
    ClientId: cognitoConfig.appClientId
  });

  cognitoUser(email) {
    return new CognitoUser({Username: email, Pool: this.userPool});
  }

  register({email, password, onSuccess, onFailure}) {

    const emailAttr = new CognitoUserAttribute({
      Name: 'email',
      Value: email
    });

    this.userPool.signUp(email, password, [emailAttr], null, (error, response) => {
      if (error) {
        onFailure(error);
      } else {
        onSuccess();
      }
    });
  };
  
  ...
}
```

W powyższym listingu masz przykład, jak faktycznie wygląda użycie Amazon Cognito.
Podstawowe klasy to `CognitoUserPool` oraz `CognitoUser`.
Pierwsza dostarcza metod dla użytkownika, którego nie ma jeszcze w _User Pool_, czyli w zasadzie tylko metodę służącą do rejestracji.
Druga reprezentuje konkretnego użytkownika w _User Pool_ i ma metody obsługujące wysyłanie kodu jednorazowego, potwierdzenie rejestacji, zalogowanie i wylogowanie użytkownika.

Metoda `CognitoUserPool` służąca do rejestracji użytkownika (`signUp`) przyjmuje parametry:

 1. Nazwę użytkownika, która tutaj jest tożsama z adresem e-mail.
 1. Hasło.
 1. Listę atrybutów w postaci obiektów klasy `CognitoUserAtribute`. W tym przypadku wystarczy tylko adres e-mail, ale Cognito pozwala na zdefiniowanie także i innych atrybutów, np. imię, nazwisko, adres.
 1. Dodatkowe atrybuty dla AWS Lambdy, która może być wywołana po rejestracji (tutaj brak takich parametrów, czyli `null`).
 1. Funkcję-_callback_, która pozwala na obsłużenie sukcesu lub błędu wywołania.
 
W tym ostatnim przypadku, jeśli wystąpi błąd, w `error` znajdzie się obiekt błędu, opisujący, co poszło nie tak.
Obiekt ten jest w naszej aplikacji bezpośrednio przekazywany do komponentu, by w ostateczności wyświetlić użytkownikowi aplikacji `error.message`.
Komunikaty błędów są na tyle zrozumiałe, że na początek na pewno wystarczy samo ich wyświetlanie, bez konieczności specjalnej obsługi różnych typów błędów.

![Starter - register error](/assets/img/posts/starter-register-error.png)

Do ekranu potwierdzenia rejestracji powinniśmy zostać przekierowani automatycznie po rejestracji.
Oprócz tego, jak widzisz, jest jeszcze odpowiedni link w ekranie rejestracji.


### Potwierdzenie rejestracji

W chwili obecnej, aby się zarejestwować, należy w formularzu podać adres e-mail, a także otrzymany kod.
Najlepiej by było oczywiście, gdyby mailem od razu był wysyłany kod do potwierdzenia rejestracji; wchodzisz na maila, klikasz i rejestracja potwierdzona.
Oczywiście da się to zrobić, bo szablony maili przychodzących z Amazon Cognito można zmienić
Na razie jednak nie zaimplementowałem tego w ten sposób, skupiłem się na wersji minimum.

Pierwszą różnicą w stosunku do poprzedniego komponentu jest to, że początkowy stan może zawierać adres e-mail użytkownika:

```javascript
class ConfirmRegistration extends React.Component {

  static emptyState = () => ({
    email: this.props.user.email || '',
    code: '',
    error: null,
    loading: false,
    success:false
  });

  state = ConfirmRegistration.emptyState();
```

Przydatne to jest szczególnie wtedy, kiedy zaraz po rejestracji zostajemy przekierowani do tego widoku.
Nie trzeba wpisywać jeszcze raz własnego adresu e-mail -- zostanie ten, który podaliśmy w rejestracji.

Dodatkowo, w tym komponencie obsłużymy tak naprawdę dwie funkcjonalności: potwierdzanie kodu rejestracji i ponowne wysłanie kodu.
W praktyce bywa tak, że kod potwierdzajacy może zaginąć, albo się zdezaktualizować, więc taka funkcjonalność jest jak najbardziej na miejscu.

Poniżej odpowiednie metody z komponentu `ConfirmRegistration`:

```javascript
  confirmRegistration = () => {

    const onSuccess = () => {
      this.setState({...ConfirmRegistration.emptyState(), success: true})
    };

    const onFailure = (error) => {
      this.setState({...this.state, error, loading: false});
    };

    this.setState({...this.state, loading: true});

    this.props.auth.confirmRegistration({
      email: this.state.email,
      code: this.state.code,
      onSuccess,
      onFailure
    })
  };

  requestCodeAgain = () => {

    const onSuccess = (user) => {
      this.setState({...this.state, loading: false});
    };

    const onFailure = (error) => {
      this.setState({...this.state, error, loading: false});
    };

    this.setState({...this.state, loading: true});

    this.props.auth.requestCodeAgain({
      email: this.state.email,
      onSuccess,
      onFailure
    });
  };
```

Jak widzisz, są one bardzo podobne i działają na takiej samej zasadzie jak rejestracja użytkownika.
Teoretycznie mógłbym je spróbować zapisać jakoś zwięźlej, jednak zależało mi przede wszystkim na spójności kodu pomiędzy różnymi komponentami i na tym, żeby sam kod był bardziej zrozumiały.

Metodę render tutaj pominę, ponieważ wygląda bardzo podobnie do rejestracji.
Różni się praktycznie tylko innymi polami formularza i tym, że mamy dwa przyciski na dole, a nie jeden.
(Oczywiście możesz to podejrzeć w [pull requeście](https://github.com/withspace/serverless-webapp-starter/pull/6/files)).

Nie będzie też pewnie zaskoczeniem taki kod w klasie `Auth`:

```javascript
  confirmRegistration({email, code, onSuccess, onFailure}) {

    const confirmSuccess = () => {
      this.updateUser(User.signedOut(email));
      onSuccess();
    };

    this.cognitoService.confirmRegistration({email, code, ...{onSuccess: confirmSuccess}, onFailure});
  }

  requestCodeAgain({email, onSuccess, onFailure}) {

    const requestSuccess = () => {
      this.updateUser(User.signedOut(email));
      onSuccess();
    };

    this.cognitoService.requestCodeAgain({email, ...{onSuccess: requestSuccess}, onFailure})
  }
```

W `CognitoService` odpowiednie metody wyglądają z kolei następująco:

```javascript
  confirmRegistration({email, code, onSuccess, onFailure}) {

    const cognitoUser = this.cognitoUser(email);

    cognitoUser.confirmRegistration(code, true, (error, response) => {
      if (error) {
        onFailure(error);
      } else {
        onSuccess();
      }
    });
  };

  requestCodeAgain({email, onSuccess, onFailure}) {

    const cognitoUser = this.cognitoUser(email);

    cognitoUser.resendConfirmationCode((error, response) => {
      if (error) {
        onFailure(error);
      } else {
        onSuccess()
      }
    });
  };
```

Tak jak pisałem wcześniej --  tutaj mamy już do czynienia z użytkownikiem, więc odwołujemy się do `CognitoUser`, a nie `CognitoUserPool`, jak było w przypadku rejestracji.

![Starter - confirm registration](/assets/img/posts/starter-confirm-registration.png)



### Logowanie i wylogowanie

Po potwierdzeniu rejestracji użytkownik jest przekierowany do ekranu logowania.
Adres e-mail, podobnie jak po rejestracji, zostaje zachowany w stanie aplikacji i nie trzeba wpisywać go ponownie.
Komponent na logowanie wygląda bardzo podobnie do tych, które służyły do rejestracji oraz potwierdzania rejestracji.
Taka sama obsługa stanu, tylko trochę inne pola formularza i przyciski.

Wylogowanie użytkownika z kolei jest możliwe poprzez wybranie odpowiedniej pozycji z menu po prawej u góry.
W przeciwieństwie do pozostałych akcji, tutaj nie jest konieczne ani wypełnianie formularza, ani wysyłanie zapytań do Amazon Cognito.
Biblioteka _amazon-cognito-identity-js_ po prostu wyczyści odpowiedni _cache_.

W przypadku logowania i wylogowania się z aplikacji nie jest też potrzebna obsługa przekierowań.
W starterze ten problem jest rozwiązany na poziomie React Routera -- jeśli użytkownik się zaloguje, komponent z logowaniem przestanie być dla niego dostępny i użytkownik zostanie automatycznie przekierowany do strony głównej.
Jeśli z kolei użytkownik jest na stronie, która jest prywatna i się wyloguje, również ta strona przestanie być dla dostępne i zostanie przekierowany do strony głównej.

Dla porządku zamieszczam resztę metod klasy `Auth`:

```javascript
  signIn({email, password, onSuccess, onFailure}) {

    const signInSuccess = () => {
      this.updateUser(User.signedIn(email), onSuccess);
      onSuccess();
    };

    this.cognitoService.signIn({email, password, ...{onSuccess: signInSuccess}, onFailure});
  }

  signOut({email}) {
    this.cognitoService.signOut({email: email, onSuccess: () => this.updateUser(User.signedOut(email))});
  }
```

A także resztę metod klasy `CognitoService`:

```javascript
  signIn({email, password, onSuccess, onFailure}) {

    const cognitoUser = this.cognitoUser(email);

    const authenticationDetails = new AuthenticationDetails({
      Username: email,
      Password: password
    });

    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (response) => onSuccess(),
      onFailure: (error) => onFailure(error)
    });
  };

  signOut({email, onSuccess}) {
    this.cognitoUser(email).signOut();
    onSuccess();
  };
```

I w tym ostatnim niespodzianka.
Jak widzisz, API biblioteki trochę się tutaj różni i metoda `signIn` wygląda nieco inaczej niż poprzednie.
Nic to jednak strasznego, da się z tym żyć.


## Podsumowanie

Tak, wpis wyszedł mi taki długi, że zasługuje na podsumowanie.
Jest to jeden z najdłuższych moich wpisów i na pewno najdłuższy w konkursie.
Jednocześnie jest on bardzo ważny, bo omawia konfigurację i implementację kluczowej funkcjonalności mojego [startera](https://github.com/withspace/serverless-webapp-starter), czyli integrację z Amazon Cognito.

Jeśli śledzisz mojego bloga, pewnie wiesz, że zrobiłem sobie tygodniową przerwę w wypuszczeniu postów.
Podczas tej _przerwy_ nie siedziałem jednak bezczynnie, tylko implementowałem wszystko to, co własnie teraz publikuję.
W ostatnim [retro](http://dzikowski.github.io/daj-sie-poznac/2017/04/30/retro-nr-2/) stwierdziłem, że przecież ciągle brakuje mi tej kluczowej funkcjonalności, choć pracuję nad projektem już dwa miesiące.
Dlatego też postanowiłem się skupić na implementacji, kosztem przerwy w blogowaniu.
Z efektów tego podejścia jestem bardzo zadowolony.

Integracja z Amazon Cognito wreszcie jest i działa, a kod wygląda tak, że można go pokazać, choć można go też znacznie ulepszyć.
Ciągle brakuje wielu rzeczy, za które zaraz się zabieram (niekoniecznie w tej kolejności):

 1. Walidacji pól formularza i komunikatów błędów, gdy np. pole zostało puste, albo wprowadzono niepoprawny adres e-mail.
 1. Personalizacji e-maili, które przychodzą z Amazon Cognito (zastanawiam się, czy nie powinny być konfigurowalne w kodzie projektu).
 1. Walidacji komponentów Reacta (np. sprawdzania, czy podano wymagane `props`).
 1. Testów!
 1. Refaktoringu wielu rzeczy -- duplikacji `handleChange` w formularzu i stanu w obsłudze formularzy, odpowiedniej struktury katalogów i nazw plików zgodnie z jakąś konwencją (np. [Airbnb](https://github.com/airbnb/javascript/tree/master/react)).
 1. Automatycznego logowania, które jest możliwe w Amazon Cognito.
 1. Lepszego UX formularzy -- nie sprawdzałem, jak działa przycisk Tab, nie można wysłać formularza przez wciśnięcie Enter.
 1. Demo.
 1. Jakiegoś sensownego zarządzania stanem (por. [tutaj](
http://stackoverflow.com/questions/36326210/what-is-the-core-difference-of-redux-reflux-in-using-react-based-application
)).

Wszystkie te punkty pokazują, że taki z pozoru prosty projekt ma swoją głębię.
Lista na pewno nie jest skończona i mógłbym wymyślać kolejne punkty.
Trudno mi powiedzieć, co w tej chwili jest najważniejsze i od czego zacznę usprawnienia.
Wiem jednak, że mam w czym wybierać.
 

