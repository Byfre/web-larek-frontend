import { FormErrors, IAppState, IProduct, OrderRequest, Contacts } from "../types";
import { IEvents } from "./base/events";
import { Model } from "./base/Model";


//Для преобразования данных с сервера
export class ProductData extends Model<IProduct> {
  category: string;
  title: string;
  description: string;
  image: string;
  price: number | null;
  id: string;
}

export class AppState extends Model<IAppState> {
  catalog: ProductData[];
  basket: string[];
  order: IProduct[];
  contacts: Contacts = {
    address: '',
    email: '',
    phone: '',
    paymenttype: ''
  }
  formErrors: FormErrors = {}
  loading: boolean;
  preview: string | null;

  // Преобразует полученные с сервера данные в данные приложения
  setCatalog(items: IProduct[]) {
    this.catalog = items.map((item) => new ProductData(item, {} as IEvents))
    this.events.emit('items:changed', this.catalog)
  }

  // Сохраняет айди выбранной для предпросмотра карточки
  setPreview(item: IProduct) {
    this.preview = item.id
    this.events.emit('preview:changed', item)
  }

  // Получение карточки по айди
  getCardById(id: string): ProductData | undefined {
    return this.catalog.find(item => item.id === id);
  }

  //Получение товаров, лежащих в корзине
  getBasketProducts(): IProduct[] {
    return this.catalog.filter((item) => this.basket.includes(item.id))
  }

  //Получение количества товаров в корзине
  getBasketAmount(): number {
    return this.basket.length;
  }

  //Получение цены корзины
  calculateTotal(): number {
    const basketProducts = this.getBasketProducts();
    // Считаем сумму с проверкой на наличие цены
    return basketProducts.reduce((total: number, item: IProduct) => {
      return total + (item.price || 0); // Если price нет, считаем как 0
    }, 0);
  }

  //Добавление товара в корзину
  addToBasket(id: string): void {
    // Проверяем, нет ли уже этого товара в корзине
    if (!this.basket.includes(id)) {
      this.basket.push(id);
    }
    this.events.emit('basket:update', this.getBasketProducts());
  }

  //Удаление товара из корзины
  deleteFromBasket(id: string): void {
    this.basket = this.basket.filter(itemId => itemId !== id);
    this.events.emit('basket:update', this.getBasketProducts());
  }

  // Заполняет объект contacts введенными пользователем данными, запускает валидацию. 
  setOrderField(field: keyof Contacts, value: string): void {
    this.contacts[field] = value;
    // Валидируем только соответствующую часть формы
    if (field === 'address' || field === 'paymenttype') {
      if (this.validateAdress()) {
        this.events.emit('address:ready', this.contacts);
      }
    } else {
      if (this.validateContactDetails()) {
        this.events.emit('contactDetails:ready', this.contacts);
      }
    }
  }

  //Валидация адреса
  validateAdress(): boolean {
    const errors: typeof this.formErrors = {};
    if (!this.contacts.address) {
      errors.address = 'Укажите адрес';
    }
    if (!this.contacts.paymenttype) {
      errors.paymenttype = 'Выберите способ оплаты';
    }
    this.formErrors = errors;
    this.events.emit('orderFormErrors:change', this.formErrors);
    return Object.keys(errors).length === 0;
  }

  //Валидация контактов
  validateContactDetails(): boolean {
    const errors: typeof this.formErrors = {};
    if (!this.contacts.email) {
      errors.email = 'Укажите email';
    }
    if (!this.contacts.phone) {
      errors.phone = 'Укажите телефон';
    }
    this.formErrors = errors;
    this.events.emit('contactsFormErrors:change', this.formErrors);
    return Object.keys(errors).length === 0;
  }

  // Проверка, что сумма корзины больше нуля. Используется для отключения кнопки сабмита
  isBasketTotalValid(): boolean {
    return this.calculateTotal() > 0;
  }

  //Формирует объект заказа для отправки на сервер
  getOrderRequest(): OrderRequest {
    // Проверяем, что все обязательные поля заполнены
    if (!this.contacts.address || !this.contacts.email ||
      !this.contacts.phone || !this.contacts.paymenttype) {
      throw new Error('Не все обязательные поля заполнены');
    }
    // Преобразуем paymenttype в значения, ожидаемые сервером
    const paymentType = this.contacts.paymenttype === 'cash' ? 'cash' : 'card';
    // Фильтруем товары с нулевой ценой чтобы исключить их отправку на сервер
    const validItems = this.basket.filter(itemId => {
      const product = this.catalog.find(p => p.id === itemId);
      return product && product.price !== null && product.price > 0;
    });

    return {
      payment: paymentType,
      email: this.contacts.email,
      phone: this.contacts.phone,
      address: this.contacts.address,
      total: this.calculateTotal(),
      items: validItems
    };
  }

  // Полностью очищает корзину
  clearBasket(): void {
    this.basket = [];
  }
}





