---
title:  Komponenty wyższego rzędu
layout: post
comments: true
tags: 
category: daj-sie-poznac
description: Tak jak w programowaniu funkcyjnym mamy funkcje wyższego rzędu, tak w React.js mamy komponenty wyższego rzedu, których rola jest podobna. Pozwalają na wyabstahowanie jakiejś części logiki na zewnątrz. W tym poście pokażę, jak zrefaktorowałem kilka formularzy z wykorzystaniem komponentów wyższego rzędu i jakie są z tego korzyści.
---

W [sekcji o komponentach wyższego rzędu](https://facebook.github.io/react/docs/higher-order-components.html) w dokumentacji Racta znajduje się świetny przykład, do czego może służyć taka abstrakcja.
Mamy dwa komponenty, `CommentList` i `BlogPost`, oba z nich subskrybują zmiany w jakimś zewnętrznym `DataSource`.
Kiedy dane się zmienią, wywoływany jest wewnętrzny callback, który w pierwszym przypadku pobierze listę komentarzy, a w drugim blogposta.
Potem w obu przypadkach uaktualni stan.

Znaczna część wewnętrznej logiki jest tutaj zduplikowana.
Komponenty różnią się praktycznie tylko metodą `render` i funkcją która pobiera uaktualnione dane z `DataSource`.
Tymczasem można oba komponenty zmienić na funkcyjne, które będą przyjmować dane w `props` i stworzyć strukturę podobną do tego:

```javascript
function withSubscription(WrappedComponent, selectData) {
  return class extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        data: selectData(DataSource, props)
      };
    }
    ...
    render() {
      return <WrappedComponent data={this.state.data} {...this.props} />;
    }
  };
}

const CommentListWithSubscription = withSubscription(
  CommentList,
  (DataSource) => DataSource.getComments()
);

const BlogPostWithSubscription = withSubscription(
  BlogPost,
  (DataSource, props) => DataSource.getBlogPost(props.id)
});
```

Na komponenty wyższego rzędu natknąłem się ostatnio debugując także kod React Toolbox (np. [tutaj](https://github.com/react-toolbox/react-toolbox/blob/dev/components/menu/Menu.js)), albo w dobrych praktykach Airbnb ([tutaj](https://github.com/airbnb/javascript/tree/master/react#naming)).


## Obsługa stanu formularza

W moim [starterze](https://github.com/withspace/serverless-webapp-starter), konkretnie w obsłudze autoryzacji z Amazon Cognito, mam trzy komponenty, które działają w zbliżony sposób.
Mają przyciski i kliknięcie na dany przycisk powoduje zmianę stanu najpierw na `state.loading`, potem wywoływana jest odpowiednia funkcja Amazon Cognito, a potem w zależności or rezultatu wywołania na `state.error`, albo `state.success`.

```javascript
export default class ConfirmRegistration extends React.Component {

  ...

  handleRegistrationConfirmation = () => {
    const onSuccess = () => {
      this.setState({ ...this.initialState(), success: true });
    };

    const onFailure = (error) => {
      this.setState({ ...this.state, error, loading: false });
    };

    this.setState({ ...this.state, loading: true });

    this.props.auth.confirmRegistration({ ... });
  };

  render() {
    return (
      <div>
        ...
        {this.state.error && <ErrorMessage text={this.state.error.message} />}
        {this.state.loading
          ? <Loader text="Confirming registration code..." />
          : <div>
            <Button label="Confirm registration" onClick={this.handleRegistrationConfirmation} raised primary />
            &nbsp;
            <Button label="Request code again" onClick={this.handleRequestingCodeAgain} />
          </div>
        }
        {this.state.success && <Redirect push to="/profile/sign-in" />}
      </div>
    );
  }
}
```

Mamy skomplikowaną i nie do końca przejrzystą logikę związaną z pokazywaniem, że trwa _loading_, że wystąpił błąd, albo że wszystko zakończyło się sukcesem, a wszystko w bardzo podobny sposób we wszystkich trzech komponentach.

Na powyższym listingu w funkcji `handleRegistrationConfirmation` najpierw ustawiamy stan na `loading: true`, żeby pokazał się loader.
Następnie, jeśli wszystko zakończyło się sukcesem resetujemy stan (czyli dodajemy też `loading: false`) i ustawiamy `success: true`).
Jeśli wystąpił błąd, wrzucamy obiekt błędu do stanu jako `error: error`.
Wreszcie wykorzystujemy te informacje, żeby pokazać lub ukryć przyciski formularza, loadera, czy też informację o błędzie.
To są dwa takie większe kawałki logiki, którą trzeba powtarzać dla każdego z trzech moich komponentów: `Register`, `ConfirmRegistration` oraz `SignIn`.


## Komponent wyższego rzędu

Zgodnie z przyjęta niedawno [konwencją](http://dzikowski.github.io/daj-sie-poznac/2017/05/21/struktura-katalogow/), na tworzony komponent wyższego rzędu zarezerwowałem cały folder w `components`:

```
app/components/withFormState/
├── FormState.js
├── FormStateInfo.jsx
├── index.js
└── withFormState.jsx
```

`FormState` to klasa, której obiekty będę przekazywać jako _prop_ o nazwie `form` do obudowanego komponentu.
Ponieważ chcę przekazać kilka elementów, wygodniej mi było na to stworzyć klasę, niż za każdym razem sprawdzać kilka `PropTypes`.

```javascript
export default class FormState {
  constructor({ startLoading, handleFailure, handleSuccess, infoComponent }) {
    this.startLoading = startLoading;
    this.handleFailure = handleFailure;
    this.handleSuccess = handleSuccess;
    this.infoComponent = infoComponent;
  }
}
```

Jak widzisz, będę przekazywał w obiekcie kilka funkcji.
Na rozpoczęcie _loading_, na obsługę błędu i obsługę sukcesu.
Dodatkowo w `infoComponent` znajdzie się komponent, który będzie zawierał informację o tym, czy właśnie trwa _loading_, czy mamy błąd itp.
Komponent ten wygląda następująco:

```javascript
export default function FormStateInfo({ loading, error, success }) {
  if (loading) { return <Loader >{loading}</Loader>; }
  if (error) { return <ErrorMessage>{error}</ErrorMessage>; }
  if (success) { return <SuccessMessage>{success}</SuccessMessage>; }
  return <div />;
}
```

Odwołuję się tutaj do istniejących już wcześniej komponentów, które mam w projekcie (jeśli chcesz, [zajrzyj](https://github.com/withspace/serverless-webapp-starter/blob/master/app/components/messages.jsx)).
Zakładam, że wszystkie _props_, czyli `loading`, `error` i `success` mają mieć postać komponentu, a ich domyślną wartością jest `null`.
Dlatego mam jeszcze zdefiniowane `PropTypes` i domyślne wartości (ESLint by mi nie odpuścił), jednak dla czystości listingu, pomijam ten kawałek kodu.

W `index.js` oczywiście wyeksportowane są te komponenty i klasy, które mają być widoczne.
Nic skomplikowanego, a pozwala ładnie utrzymać czystość organizacji projektu:

```javascript
import FormState from './FormState';
import withFormState from './withFormState';

export { FormState, withFormState };
```

Wreszcie plik z komponentem wyższego rzędu, `withFormState.jsx`.
Wrzucę tutaj jego zawartość w całości, a potem zaraz opowiem po kolei, o co w tym wszystkim chodzi:

```javascript
import React from 'react';
import FormState from './FormState';
import FormStateInfo from './FormStateInfo';

export default function withFormState(WrappedComponent) {
  class WithFormState extends React.Component {

    state = {
      loading: null,
      error: null,
      success: null,
    };

    handleFailure = (info) => this.setState({ ...this.state, error: info, loading: null });

    handleSuccess = (info) => this.setState({ ...this.state, success: info, loading: null });

    startLoading = (info) => this.setState({ ...this.state, loading: info });

    render() {
      const form = new FormState({
        startLoading: this.startLoading,
        handleFailure: this.handleFailure,
        handleSuccess: this.handleSuccess,
        infoComponent: <FormStateInfo {...this.state} />,
      });
      return <WrappedComponent form={form} {...this.props} />;
    }
  }

  const wrappedComponentName = WrappedComponent.displayName || WrappedComponent.name || 'Component';

  WithFormState.displayName = `withFormState(${wrappedComponentName})`;

  return WithFormState;
}
```

Zobacz, co tu się dzieje.
Po pierwsze, w tym miejscu trzymam stan na `loading`, `error` i `success`.
Ten stan nie będzie nigdzie wyciekał na zewnątrz, bo nie jest to potrzebne.
I jest w jednym miejscu, właśnie w tym komponencie -- nie musimy go nigdzie powtarzać w komponentach z formularzami, co naprawdę bardzo upraszcza ich logikę.

Dalej mam trzy handlery, które będa przekazywane do komponentów z formularzami.
Założyłem, że to właśnie te komponenty najlepiej _wiedzą_, kiedy ma się zacząć _loading_, a kiedy wywołanie się kończy sukcesem lub błędem.
I właśnie te trzy handlery będą wywoływane w poszczególnych komponentach z formularzami: `handleFailure`, `handleSuccess`, `startLoading`.

W metodzie `render` najpierw tworzę obiekt `FormState`, o którym pisałem przed chwilą, i który ma trzymać wszystkie handlery i obiekty przekazywane dalej w `props`.
`FormState`, oprócz handlerów, otrzymuje tutaj jeszcze komponent, którego można użyć do pokazania aktualnego stanu formularza.
Podczas renderowania komponentu przekazuję właśnie ten obiekt jako `form`, a także props, które nie są stricte związane z komponentem wyższego rzędu (zgodnie z [konwencją](https://facebook.github.io/react/docs/higher-order-components.html#convention-pass-unrelated-props-through-to-the-wrapped-component)).

Wreszcie, zgodnie z inną [konwencją](https://facebook.github.io/react/docs/higher-order-components.html#convention-wrap-the-display-name-for-easy-debugging), przekazuję komponentowi odpowiednie `displayName`, żeby w razie czego łatwo się to wszystko debugowało.

Po tych zmianach zmieni się oczywiście kod komponentów z formularzami.
Po pierwsze, w handlerze `handleRegistrationConfirmation` od tej pory nie trzeba będzie pisać własnych zmian stanu dotyczącego _loading/success/error_, tylko skorzystamy z handlerów dostarczanych w `props`, a informacje o tym, że chcemy przekierować do innego ekranu jest bardziej widoczna:

```javascript
  handleRegistrationConfirmation = () => {
    const onSuccess = () => {
      this.setState(this.initialState());
      this.props.form.handleSuccess(<Redirect push to="/profile/sign-in" />);
    };

    const onFailure = (error) => {
      this.props.form.handleFailure(error.message);
    };

    this.props.form.startLoading('Confirming registration...');

    this.props.auth.confirmRegistration({
      email: this.state.email,
      code: this.state.code,
      onSuccess,
      onFailure,
    });
  };
```

Po drugie, w metodzie `render` możemy pozbyć się mnóstwa kodu, który służył na wyświetlanie loadera lub błędu, a zamiast tego użyjemy dostarczanego komponentu:

```javascript
  render() {
    return (
      <div>
        <h1>Confirm registration</h1>
        {this.props.form.infoComponent}
        ...
        <Button label="Confirm registration" onClick={this.handleRegistrationConfirmation} raised primary />
        &nbsp;
        <Button label="Request code again" onClick={this.handleRequestingCodeAgain} />
      </div>
    );
  }
}
```

I wreszcie, musimy uaktualnić `props`, a także sposób eksportowania komponentu.
Nie eksportujemy już bowiem zwykłego `ConfirmRegistration`, tylko `ConfirmRegistration` obudowane w komponent wyższego rzędu.

```javascript
ConfirmRegistration.propTypes = {
  form: PropTypes.instanceOf(FormState).isRequired,
  ...
};

const ConfirmRegistrationExt = withFormState(ConfirmRegistration);
export default ConfirmRegistrationExt;
```

I to jest tutaj akurat ważne, żeby wyeksportować już stworzony komponent, a nie tworzyć go dynamicznie, np. w metodzie `render`.
W przeciwnym wypadku React może mieć problemy z zarządzaniem stanem i z wydajnością.
Więcej możesz poczytać o tym w [dokumentacji](https://facebook.github.io/react/docs/higher-order-components.html#dont-use-hocs-inside-the-render-method).


## Obsługa wartości pól

Jest jeszcze jeden kawałek logiki, który się powtarza w komponentach: obsługa wartości pól formularza.
Jest to zrobionie [klasycznie](https://facebook.github.io/react/docs/forms.html): wartości trzymane są w `state`, a po zmianie w polu formularza wywoływany jest odpowiedni handler, który zmieni `state`.

```javascript
class ConfirmRegistration extends React.Component {

  state = {
    email: this.props.user.email || '',
    code: '',
  };

  handleChange = name => value => this.setState({ ...this.state, [name]: value });

  ...

  render() {
    return (
      <div>
        ...
        <Input
          type="text"
          label="E-mail Address"
          name="email"
          value={this.state.email}
          onChange={this.handleChange('email')}
        />
        ...
      </div>
    );
  }
}
```

Zauważ, że tutaj mamy tak naprawdę aż trzy aspekty, związane z zarządzaniem wartością pól formularza:

1. Odczytanie wartości ze stanu (`value={this.state.email}`).
1. Zmiana stanu po zmianie wartości w polu formularza (`onChange={this.handleChange('email')}`).
1. Ustawienie domyślnych wartości, które czasami mogą być zależne od `props` (`email: this.props.user.email || '',`).

W dodatku ten kawałek logiki wydaje się czymś innym niż to, co jest obsługiwane przez stworzony już poprzednio komponent wyższego rzędu (`withFormState`).
Owszem, moje formularze potrzebują zarówno stanu w rozumieniu _loading/success/error_, jak i wartości pól, niemniej jednak łatwo sobie wyobrazić takie formularze, które potrzebują jednej z tych rzeczy.
W związku tym wolałbym nie mieszać w jednym komponencie tych dwóch kawałków.

Zamiast tego mogę zostawić jak jest i zarządzać na razie wartościami pól wewnątrz każdego z komponentów, albo zrobić na to oddzielny komponent wyższego rzędu.
Oczywiście pierwsze rozwiązanie jest za proste, więc zrobię ten nowy komponent &#128578;.


## Drugi komponent wyższego rzędu

Drugi komponent wyższego rzędu nazywa się bardzo podobnie (`withFormFields`) i ma podobną strukturę:

```
app/components/withFormFields
├── FormFields.js
├── index.js
└── withFormFields.jsx
```

`FormFields` jest klasą-kontenerem dla wartości pól i handlerów:

```javascript
export default class FormFields {
  constructor(values, handleChange) {
    this.values = values;
    this.handleChange = handleChange;
  }
}
```

W `index.js` oczywiście exportuję te klasy, które mają być dostępne na zewnątrz:

```javascript
import FormFields from './FormFields';
import withFormFields from './withFormFields';

export { FormFields, withFormFields };
```

I wreszcie kod komponentu:

```javascript
export default function withFormFields(WrappedComponent, getDefaultValues) {
  class WithFormFields extends React.Component {

    state = {
      fields: getDefaultValues(this.props),
    };

    handleChange = name => value => {
      const fields = { ...this.state.fields, [name]: value };
      this.setState({ fields });
    };
    
    reset = () => this.setState({fields: getDefaultValues(this.props)});

    render() {
      const fields = new FormFields(this.state.fields, this.handleChange);
      return <WrappedComponent fields={fields} {...this.props} />;
    }
  }

  const wrappedComponentName = WrappedComponent.displayName || WrappedComponent.name || 'Component';

  WithFormFields.displayName = `withFormFields(${wrappedComponentName})`;

  return WithFormFields;
}
```

Wszystkie wartości pól trzymam w `state.fields`.
W momencie kiedy tworzony jest obiekt, wywoływana jest funkcja `getDefaultValues`, która przyjmuje `props` i na tej podstawie zwraca domyślne wartości pól.
Funkcja `handleChange`, tak jak wcześniej, służy do zmiany stanu, reprezentującego wartości pól formularza.

Zmiany komponentów formularza, na przykład `ConfirmRegistration` są trywialne.
Po prostu zamiast `this.state.email` odwołujemy się do `this.props.fields.values.email` a zamiast do `this.handleChange` do `this.props.fields.handleChange`.
Nie będzie też już potrzebny handler `handleChange` w formularzu, ani inicjowanie stanu (!).

Zmieni się także znacząco sposób inicjalizacji komponentu, ponieważ muszę obudować go jeszcze jednym komponentem wyższego rzędu i podać domyślne wartości:

```javascript
const ConfirmRegistrationExt = withFormState(withFormFields(
  ConfirmRegistration,
  ({ user }) => ({ email: user.email || '', code: '' }),
));

export default ConfirmRegistrationExt;
```


## Dalsze zmiany

Można w sumie wprowadzić jeszcze dwie zmiany, dzięki którym kod będzie dużo ładniejszy.
Po pierwsze, zauważ, że ten kod jest imperatywny: 

```javascript
  handleRegistrationConfirmation = () => {
    const onSuccess = () => { ... };

    const onFailure = (error) => { ... };

    this.props.form.startLoading('Confirming registration...');

    this.props.auth.confirmRegistration({
      email: this.props.fields.values.email,
      code: this.props.fields.values.code,
      onSuccess,
      onFailure,
    });
  };
```

Szczególnie chodzi mi linijkę, kiedy wywoływane jest `startLoading`.
Tak naprawdę, to komponent odpowiedzialny za stan formularza powinien sam wiedzieć, żeby wywołać `startLoading`, a nie powinno być konieczności pisania tego wprost.
Lepiej byłoby zapisać ten kod w taki sposób:

```javascript
  handleRegistrationConfirmation = () => {
    const onSuccess = () => { ... };

    const onFailure = (error) => { ... };

    const action = () => {
      this.props.auth.confirmRegistration({
        email: this.props.fields.values.email,
        code: this.props.fields.values.code,
        onSuccess,
        onFailure,
      });
    };

    this.props.form.submit(action, 'Confirming registration...');
  }
```

Zamiast wywoływania wprost `startLoading`, przekazuję do formularza funkcję, opisująca to, co ma się wydarzyć oraz etykietę, która ma pojawić się w _loaderze_.
Żeby to było możliwe, musimy oczywiście zmienić trochę kod komponentu `withFormState`.
Po pierwsze, klasa `FormState` teraz zamiast atrybutu`startLoading` będzie miała `submit`, a po drugie sam komponent `formState` będzie miał tak zdefiniowany handler, który będzie potem przekazywany do instancji `FormState`:

```javascript
    submit = (operation, info) => {
      this.setState({ ...this.state, loading: info });
      return operation();
    };
```

Tym samym pozbyliśmy się uciążliwego wywoływanie wprost funkcji `startLoading` i teraz możemy zabrać się za drugi refaktoring, który warto zrobić, żeby znacznie uprościć kod komponentów z formularzami.

Zauważ, że teraz komponenty z formularzami nigdzie nie mają już zdefiniowanego stanu, ani go bezpośrednio nie ustawiają.
Wszystko to dzieje się w tle, na takich _props_ jak `form` i `fields`.

Tak, właśnie do tego zmierzam.
Możemy z formularzy zrobić _stateless functional components_!

W pierwszym kroku wyodrębnię handlery do osobnych funkcji, tak żeby mogły od razu przyjąć props jako parametry (zoabcz przy okazji, o ile przejrzyściej wygląda kod, kiedy nie trzeba pisać `this.props` przed każdym odwołaniem do `auth`, `form` i `fields`):

```javascript
function confirmRegistration({ auth, form, fields }) {
  const onSuccess = () => {
    fields.reset();
    form.handleSuccess(<Redirect push to="/profile/sign-in" />);
  };

  const onFailure = (error) => {
    form.handleFailure(error.message);
  };

  const action = () => {
    auth.confirmRegistration({
      email: fields.values.email,
      code: fields.values.code,
      onSuccess,
      onFailure,
    });
  };

  form.submit(action, 'Confirming registration...');
}
```

W sumie tę funkcję można napisać jeszcze bardziej elegancko, bo `onFailure` jest bardzo krótkie:

```javascript
function confirmRegistration({ auth, form, fields }) {
  const onSuccess = () => {
    fields.reset();
    form.handleSuccess(<Redirect push to="/profile/sign-in" />);
  };

  const action = () =>
    auth.confirmRegistration({
      email: fields.values.email,
      code: fields.values.code,
      onSuccess,
      onFailure: (error) => form.handleFailure(error.message),
    });

  form.submit(action, 'Confirming registration...');
}
```

W kolejnym kroku przerobię jeszcze komponent `ConfirmRegistration` na bezstanowy komponent funkcyjny.
Właśnie tak:

```javascript
function ConfirmRegistration({ auth, form, fields }) {
  return (
    <div>
      <h1>Confirm registration</h1>
      {form.infoComponent}
      <Input
        type="text"
        label="E-mail Address"
        name="email"
        value={fields.values.email}
        onChange={fields.handleChange('email')}
      />
      ...
      <Button
        label="Confirm registration"
        onClick={() => confirmRegistration({ auth, form, fields })}
        raised
        primary
      />
      ...
    </div>
  );
}
```

Eksporty, walidacja `PropTypes`, wykorzystanie komponentów -- to wszystko zostaje tak jak było, po prostu zmienione zostało _wnętrze_ komponentu.


## Po co to wszystko

Podstawową zaletą wyodrębniania komponentów wyższego rzędu jest rozbicie kłębka logiki na odrębne i względnie niezależne części.
Na początku mieliśmy komponenty z formularzami, które zawierały w sobie wszystko.
Zarówno trzymały stan formularza, pokazywały _loadera_ i błędy, a także wywoływały odpowiednie metody z usługi służącej do autoryzacji.
Dzięki opisanemu w tym poście refaktoringowi udało się podzielić logikę na cztery części:

1. Komponent z formularzem (np. `ConfirmRegistration`) to sam widok. Wyświetla pola i przyciski, dodatkowo podpina odpowiednie handlery do przycisków.
1. Logika odpowiedzialna za definicję tego, co ma się dziać po kliknięciu przycisku (jaką metodę z usługi autoryzacji wywołać, co ma się stać w przypadku błędu lub sukcesu), została przeniesiona do osobnych funkcji (np. `confirmRegistration`).
1. Obsługa stanu formularza, związana stricte z pokazywaniem informacji użytkownikowi (co się dzieje, że był błąd, że się udało wykonać operację) została przeniesiona do komponentu `withFormState`.
1. Obsługa wartości pól formularza została przeniesiona do komponentu `withFormFields`.

Przed tymi zmianami cała logika była zduplikowana w trzech komponentach: `Register`, `ConfirmRegistration` i `SignIn`.
A coś takiego, to duże ryzyko popełnienia błędu.
W każdym z tych komponentów można popełnić drobną pomyłkę, każdy z nich trzeba testować osobno i w całości.
Po rozbiciu te kawałki logiki znajdują się w izolowanych miejscach, zaimplementowane są raz i również raz można je przetestować.

Same formularze też teraz dużo łatwiej przetestować osobno, bo są funkcyjne.
Przyjmują tylko `props` i dla danego zestawu `props` zawsze wyrenderuje się to samo.
Nie mają żadnego wewnętrznego stanu, który trzeba by brać pod uwagę w testach.
Czyli są _pure functions_.

Ten stan jest dopiero _nakładany_ komponentami wyższego rzędu, ale i te komponenty i ich zmiany stanu można przetestować w izolacji, obudowując nimi dowolny komponent formularza (np. taki przygotowany specjalnie na potrzeby testów).

Wreszcie, dzięki temu, że udało się wyizolować logicznie spójne i niezależne klocki, dużo łatwiejsze powinno być wprowadzanie zmian do takiego kodu.
Zdefiniowane komponenty wyższego rzędu łatwo będzie użyć w innym miejscu, dla nowego formularza.
Istniejące komponenty formularzy będzie łatwiej zmieniać, bo są prostsze i nie mają dodatkowej logiki na obsługę stanu.

Zauważ jeszcze jedną rzecz.
Kiedy zaczynałem pisać te formularze, całą logikę zawarłem w jednym miejscu, wtedy było to wystarczające.
Potem logika została zduplikowana, potem jeszcze raz, i dopiero potem postanowiłem ją wydzielić.
To jest dobre podejście.
Często można popłynąć i na samym początku próbować stworzyć abstrakcję, która potem okazuje się nie do końca adekwatna i trudna w utrzymaniu.

Na początku duplikacja, potem abstrakcja.
Na duplikacji uczysz się kodu, dowiadujesz się, co faktycznie jest potrzebne i jak powinno działać.
Potem, kiedy masz już kilka przykładów, masz wystarczającą więdzę o tym, jaka powinna być ta abstrakcja.
Dopiero wtedy jest dobry moment, żeby taką abstrakcję stworzyć samodzielnie, albo skorzystać z jakiejś biblioteki, która już taką abstrakcję obsługuje.
Dlatego na przykład w moim starterze ciągle nie ma Reduxa, który często jest z automatu dołączany do aplikacji w React.js.
Po prostu nie ma sensu za szybko komplikować sobie projektu.

Wszystkie zmiany związane z tym refaktoringiem możesz zobaczyć w odpowiednim [pull requeście](https://github.com/withspace/serverless-webapp-starter/pull/12/files).

