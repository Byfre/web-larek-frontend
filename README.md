# Проектная работа "Веб-ларек"

Стек: HTML, SCSS, TS, Webpack

Структура проекта:
- src/ — исходные файлы проекта
- src/components/ — папка с JS компонентами
- src/components/base/ — папка с базовым кодом

Важные файлы:
- src/pages/index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/index.ts — точка входа приложения
- src/scss/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами

## Установка и запуск
Для установки и запуска проекта необходимо выполнить команды

```
npm install
npm run start
```

или

```
yarn
yarn start
```
## Сборка

```
npm run build
```

или

```
yarn build
```
## Данные и типы данных, используемые в приложении

Интерфейс общего внутреннего состояния приложения

```
interface IAppState {
  catalog: ProductData[];
  basket: string[];
  order: IProduct[];
  loading: boolean;
  contacts: Contacts
}
```

Карточка товара

```
 interface IProduct {
  category: string;
  title: string;
  description: string;
  image: string;
  price: number | null;
  id: string;
}
```
Заказ для отправки на сервер

```
type OrderRequest = {
  payment: PaymentType,
  email: string,
  phone: string,
  address: string,
  total: number,
  items: string[]
}
```
Контактные данные пользователя

```
 type Contacts = {
  address: string,
  email: string,
  phone: string,
  paymenttype: PaymentType | string,
}
```
Тип, описывающий ошибки валидации форм

```
 type FormErrors = Partial<Record<keyof Contacts, string>>;
```
Способы оплаты

```
 type PaymentType = 'cash' | 'card'
```

## Архитектура приложения

Код приложения разделен на слои согласно парадигме MVP: 
- слой представления, отвечает за отображение данных на странице, 
- слой данных, отвечает за хранение и изменение данных
- презентер, отвечает за связь представления и данных.
- Используется событийно-ориентированный подход

### Базовый код

#### Класс Api
Содержит в себе базовую логику отправки запросов. В конструктор передается базовый адрес сервера и опциональный объект с заголовками запросов.
Методы: 
- `get` - выполняет GET запрос на переданный в параметрах ендпоинт и возвращает промис с объектом, которым ответил сервер
- `post` - принимает объект с данными, которые будут переданы в JSON в теле запроса, и отправляет эти данные на ендпоинт переданный как параметр при вызове метода. По умолчанию выполняется `POST` запрос, но метод запроса может быть переопределен заданием третьего параметра при вызове.

#### Класс EventEmitter
Брокер событий позволяет отправлять события и подписываться на события, происходящие в системе. Класс используется в презентере для обработки событий и в слоях приложения для генерации событий.  
Основные методы, реализуемые классом описаны интерфейсом `IEvents`:
- `on` - подписка на событие
- `emit` - инициализация события
- `onAll` - позволяет слушать все события, используется для отладки   

### Слой данных

#### Класс Model
Абстрактный базовый класс, который служит основой для создания моделей данных в приложении

#### Класс AppState
Наследуется от Model, отвечает за хранение и логику работы с данными всего приложения. При изменении определенных данных инициирует соответствующие события.
В полях класса хранятся следующие данные:
 - catalog: ProductData[] - массив объектов карточек
 - basket: string[] - массив id карточек, находящихся в корзине
 - order: IProduct[] - массив объектов карточек в заказе
 - contacts: Contacts = {
    address: '',
    email: '',
    phone: '',
    paymenttype: ''
  } - контактные данные, заполненные пользователем
 - formErrors: FormErrors - ошибки валидации
 - loading: boolean - состояние процесса загрузки
 - preview: string | null - id карточки, выбранной для предпросмотра

 Также класс предоставляет набор методов для взаимодействия с этими данными.
 - setCatalog(items: IProduct[]) - Преобразует полученные с сервера данные в данные приложения
  

 - setPreview(item: IProduct) - Сохраняет айди выбранной для предпросмотра карточки
   

 - getCardById(id: string): ProductData | undefined - Получение карточки по айди
  

 - getBasketProducts(): IProduct[]  - Получение товаров, лежащих в корзине
  

 - getBasketAmount():number  - Получение количества товаров в корзине
  
 
 - calculateTotal(): number - Получение цены корзины
  

 - addToBasket(id: string): void  - Добавление товара в корзину
  

 - deleteFromBasket(id: string): void  - Удаление товара из корзины
  

 - setOrderField(field: keyof Contacts, value: string): void  - Заполняет объект contacts введенными пользователем данными, запускает валидацию. 
  

 - validateAdress(): boolean - Валидация адреса
   
 - validateContactDetails(): boolean -Валидация контактов
   

 - isBasketTotalValid(): boolean - Проверка, что сумма корзины больше нуля. Используется для отключения кнопки сабмита
   

 - getOrderRequest(): OrderRequest - Формирует объект заказа для отправки на сервер
   

 - clearBasket(): void - Полностью очищает корзину
  
    #### Класс ProductData 
    Служит для преобразования данных, полученных с сервера, для хранения внутри приложения.

    ### Классы представления
Все классы представления отвечают за отображение внутри контейнера (DOM-элемент) передаваемых в них данных и наследуются от базового класса Component.

#### Базовый Класс Component
Класс является дженериком и родителем всех компонентов слоя представления. В дженерик принимает тип объекта, в котором данные будут передаваться в метод render для отображения данных в компоненте. В конструктор принимает элемент разметки, являющийся основным родительским контейнером компонента. Содержит метод render, отвечающий за сохранение полученных в параметре данных в полях компонентов через их сеттеры, возвращает обновленный контейнер компонента.

#### Класс Page  
  Наследуется от Component\
  Конструктор принимает родительский элемент и обработчик событий.\
  constructor(container: HTMLElement, protected events: IEvents)
  
  Поля класса:
 - counter: number

 - catalog: HTMLElement[]

 - locked: boolean;

  Сеттеры:

set counter(value: number) - отображает кол-во товаров в корзине

set catalog(items: HTMLElement[]) - заполняет страницу карточками товаров

set locked(value: boolean) - блокирует страницу при открытии модалки

#### Класс Basket
Наследуется от Component\
Конструктор принимает родительский элемент и обработчик событий.\
constructor(container: HTMLElement, protected events: IEvents)

Поля класса:
 - _items: IProduct[]

 - _list: HTMLElement

 - _total: HTMLElement

 - _button: HTMLButtonElement

 Сеттеры:

 set total(value: number) - установить сумму

 set list(items: HTMLElement[]) - заполняет список товаров

 Методы:\
 setSubmitDisabled(state: boolean) - отключает кнопку подтверждения

#### Класс Product 
  Абстрактный базовый класс для карточки товара.\
  Наследуется от Component\
  Конструктор принимает родительский элемент.\
  constructor(container: HTMLElement);

  Поля класса:
 - _title: HTMLElement

 - _price: HTMLElement
 
 Сеттеры:

 set title(value: string) - устанавливает название

 set price(value: number | null) - устанавливает цену

 #### Класс ProductPrewiew
 Наследуется от Product.\
  Конструктор принимает родительский элемент и объект коллбэков\
 constructor(container: HTMLElement, actions: IProductActions)\
 Поля класса:
- _category: HTMLElement;

- _text: HTMLElement;

- _image: HTMLImageElement;

- _button: HTMLButtonElement

 Сеттеры:

 set category(value: string) - установка текста категории и css-класса

 set description(value: string) - установка описания

 set image(value: string) - установка изображения

 Методы:\
 setButtonState(inBasket: boolean, hasPrice: boolean): void - изменение состояния кнопки, если товар уже в корзине или он не имеет цены.

 #### Класс ProductCatalogItem
 Наследуется от Product\
 Конструктор принимает родительский элемент и объект коллбэков\
 constructor(container: HTMLElement, actions: IProductActions)\
  Поля класса:
  - _category: HTMLElement;

  - _image: HTMLImageElement;

Сеттеры:

 set category(value: string) - установка текста категории и css-класса

 set image(value: string) - установка изображения

 #### Класс ProductBasketItem
 Наследуется от Product\
 Конструктор принимает родительский элемент и объект коллбэков\
 constructor(container: HTMLElement, actions: IProductActions)\
 Поля класса:
- _index: HTMLElement

- _button: HTMLButtonElement\
 
 Сеттеры:

 set index(value: number): void - установить индекс
 
 Геттеры:

 get index(): number - получить индекс

#### Класс Modal
Наследуется от Component\
Конструктор принимает родительский элемент и обработчик событий.\
constructor(container: HTMLElement, protected events: IEvents)\
 Поля класса:
 - _closeButton: HTMLButtonElement;

 - _content: HTMLElement;

 Сеттеры:\
 set content(value: HTMLElement) - устанавливает содержимое модалки

 Методы:\
 open() - открывает модалку

 close() - закрывает модалку
  
  #### Класс Form
  Базовый класс формы. Наследуется от Component.\
  Устанавливает слушатели изменения введенных данных, передает их значения.\
  Конструктор принимает родительский элемент и обработчик событий.\
  constructor(container: HTMLElement, protected events: IEvents)
  
  Поля класса:
 - _submit: HTMLButtonElement - кнопка сабмита

 - _errors: HTMLElement - элемент для вывода ошибок валидации

  Сеттеры:\
  set valid(value: boolean) - управляет состоянием кнопки сабмита

  set errors(value: string) - выводит тексты ошибок

 #### Класс Order
 Наследуется от Form.\
 Реализует переключение кнопок выбора типа оплаты.\
 Конструктор принимает родительский элемент и обработчик событий.\
 constructor(container: HTMLElement, protected events: IEvents)

   Поля класса:
 - _card: HTMLButtonElement - кнопка оплаты картой

 - _cash: HTMLButtonElement - кнопка оплаты наличными

 #### Класс UserContacts
 Наследуется от Form.\
 Конструктор принимает родительский элемент и обработчик событий.\
 constructor(container: HTMLElement, protected events: IEvents)

 #### Класс Success
 Наследуется от Component.\
 Конструктор принимает родительский элемент и обработчик событий.\
 constructor(container: HTMLElement, protected events: IEvents)

 Поля класса:
 - _button: HTMLButtonElement - кнопка "За новыми покупками"
 
 - _description: HTMLElement - финальная сумма, отправленного заказа

 Сеттеры:\
 set total(value: number) - отображение финальной суммы заказа

### Слой коммуникации

#### Класс LarekApi
Наследует базовый класс Api и предоставляет методы реализующие взаимодействие с бэкендом сервиса.

## Взаимодействие компонентов
Код, описывающий взаимодействие представления и данных между собой находится в файле `index.ts`, выполняющем роль презентера.\
Взаимодействие осуществляется за счет событий генерируемых с помощью брокера событий и обработчиков этих событий, описанных в `index.ts`\
В `index.ts`создаются экземпляры всех необходимых классов, и настраивается обработка событий.

*Список всех событий, которые могут генерироваться в системе:*\
*События изменения данных (генерируются классами моделями данных)*
- `items:changed` - изменение списка товаров
- `preview:changed` - сохранен айди выбранной для предпросмотра карточки
- `basket:update` - обновилось содержимое корзины
- `address:ready` - прошли валидацию адрес и способ оплаты
- `contactDetails:ready` - прошли валидацию телефон и имейл
- `orderFormErrors:change` - изменились ошибки в форме заказа
- `contactsFormErrors:change` - изменились ошибки в форме контактов

*События, возникающие при взаимодействии пользователя с интерфейсом (генерируются классами, отвечающими за представление)*
- `item:selected` - выбрана карточка для превью
- `basket:add` - карточка добавлена в корзину
- `basket:delete` - карточка удалена из корзины
- `basket:open` - открытие модального окна корзины
- `basket:submit` - преход к модальному окну с формой адреса и способа оплаты
- `order:submit` - преход к модальному окну с формой имейла и телефона
- `contacts:submit` - отправка заказа на сервер после полного заполнения контактов
- `order:success` - открытие окна успешного заказа
- `success:close` - закрытие окна успешного заказа после оформления
- `orderInput:change` - изменение данных, введенных в поля формы
- `modal:open` - открылось модальное окно
- `modal:close` - закрылось модальное окно

