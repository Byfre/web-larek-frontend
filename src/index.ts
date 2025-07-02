import { LarekApi } from './components/LarekApi';
import './scss/styles.scss';
import { API_URL, CDN_URL } from './utils/constants';
import { cloneTemplate, ensureElement } from './utils/utils';
import { Contacts, IProduct } from './types';
import { Page } from './components/Page';
import { EventEmitter } from './components/base/events';
import { ProductBasketItem, ProductCatalogItem, ProductPreview } from './components/Product';
import { AppState } from './components/AppState';
import { Modal } from './components/Modal';
import { Basket } from './components/Basket';
import { Order } from './components/Order';
import { UserContacts } from './components/UserContacts';
import { Success } from './components/Success';

const api = new LarekApi(CDN_URL, API_URL)
const events = new EventEmitter()
const appData = new AppState({ basket: [] }, events)

// Чтобы мониторить все события, для отладки
events.onAll(({ eventName, data }) => {
  console.log(eventName, data);
})

// Глобальные контейнеры
const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);


//Шаблоны
const catalogItemTpl = ensureElement<HTMLTemplateElement>('#card-catalog')
const cardPreviewTpl = ensureElement<HTMLTemplateElement>('#card-preview');
const cardBasketTpl = ensureElement<HTMLTemplateElement>('#card-basket');
const basketTpl = ensureElement<HTMLTemplateElement>('#basket');
const orderTpl = ensureElement<HTMLTemplateElement>('#order');
const contactsTpl = ensureElement<HTMLTemplateElement>('#contacts');
const successTpl = ensureElement<HTMLTemplateElement>('#success')

//Компоненты
const order = new Order(cloneTemplate(orderTpl), events)
const contacts = new UserContacts(cloneTemplate(contactsTpl), events);
const success = new Success(cloneTemplate(successTpl), events);
const basket = new Basket(cloneTemplate(basketTpl), events)

//Отрисовка начального состояния страницы
events.on('items:changed', () => {
  page.catalog = appData.catalog.map((product: IProduct) => {
    const actions = {
      onClick: () => { events.emit('item:selected', product) }
    }
    const card = new ProductCatalogItem(cloneTemplate(catalogItemTpl), actions)
    return card.render(product)
  })
})

//Открыть конкретную карточку
events.on('item:selected', (item: IProduct) => {
  appData.setPreview(item)
})

events.on('preview:changed', () => {
  const selectedProduct = appData.getCardById(appData.preview)
  const actions = {
    addToBasket: () => { events.emit('basket:add', selectedProduct) }
  }
  const card = new ProductPreview(cloneTemplate(cardPreviewTpl), actions)
  const isInBasket = appData.basket.includes(selectedProduct.id);
  const hasPrice = selectedProduct.price !== null;
  card.setButtonState(isInBasket, hasPrice);
  modal.content = card.render(selectedProduct)
  modal.open()
})

//Добавление карточки в корзину
events.on('basket:add', (selectedProduct: IProduct) => {
  appData.addToBasket(selectedProduct.id)
  modal.close()
})


events.on('basket:open', () => {
  events.emit('basket:update', appData.getBasketProducts());
  modal.open();
});

//Удаление карточки из корзины
events.on('basket:delete', (item: IProduct) => {
  appData.deleteFromBasket(item.id);
})

// Обновление состояния корзины
events.on('basket:update', (products: IProduct[]) => {
  const productCards = products.map((product, index) => {
    const actions = {
      deleteFromBasket: () => events.emit('basket:delete', product)
    };
    const card = new ProductBasketItem(cloneTemplate(cardBasketTpl), actions);
    card.index = index + 1;
    return card.render(product);
  });
  basket.list = productCards;
  basket.total = appData.calculateTotal()
  basket.setSubmitDisabled(!appData.isBasketTotalValid());
  page.counter = appData.getBasketAmount();
  modal.content = basket.render();
});

// Переход к начальному экрану оформления заказа
events.on('basket:submit', () => {
  modal.content = order.render()
})

// Переход к заполнению имейла и телефона, при оформлении заказа
events.on('order:submit', () => {
  modal.content = contacts.render()
})

//Отправка заказа на сервер
events.on('contacts:submit', () => {
  api.post('/order', appData.getOrderRequest())
    .then((res) => {
      events.emit('order:success', res);
      appData.clearBasket()
      page.counter = 0

    })
    .catch((err) => {
      console.log(err)
    })

})

//Открытие окна успешного заказа
events.on('order:success', (res) => {
  modal.content = success.render(res)
})

events.on('success:close', () => {
  modal.close()
})

// Изменилось состояние валидации адреса и формы оплаты
events.on('orderFormErrors:change', (errors: Partial<Contacts>) => {
  const { paymenttype, address } = errors;
  order.valid = !paymenttype && !address;
  order.errors = Object.values({ paymenttype, address }).filter(i => !!i).join('; ');
});

// Изменилось состояние валидации имейла и телефона
events.on('contactsFormErrors:change', (errors: Partial<Contacts>) => {
  const { email, phone } = errors;
  contacts.valid = !email && !phone;
  contacts.errors = Object.values({ email, phone }).filter(i => !!i).join('; ');
});

// Изменились введенные данные для оформления заказа. Изменение способа оплаты
// реализовано отдельно в классе Order, с помощью передачи в обработчик paymenttype, cash/card, т.к. эти значения берутся не из инпутов.
events.on('orderInput:change', (data: { field: keyof Contacts, value: string }) => {
  appData.setOrderField(data.field, data.value);
  console.log(appData.contacts)
});

events.on('modal:open', () => {
  page.locked = true
});

events.on('modal:close', () => {
  page.locked = false
});

//Получение начального списка товаров
api.getProducts()
  .then((products: IProduct[]) => {
    appData.setCatalog(products)
  })
  .catch((err) => {
    console.log(err)
  })