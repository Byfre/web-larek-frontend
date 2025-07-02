import { ensureElement } from "../utils/utils";
import { Component } from "./base/Component";
import { IProduct } from "../types";
import { CATEGORY_MODIFIERS } from "../utils/constants";



interface IProductActions {
  onClick?: (event: MouseEvent) => void;
  addToBasket?: (event: MouseEvent) => void;
  deleteFromBasket?: (event: MouseEvent) => void;
}

export abstract class Product extends Component<IProduct> {
  protected _title: HTMLElement;
  protected _price: HTMLElement;

  constructor(container: HTMLElement) {
    super(container)
    this._title = ensureElement('.card__title', this.container)
    this._price = ensureElement('.card__price', this.container)
  }

  set title(value: string) {
    this.setText(this._title, value);
  }

  set price(value: number | null) {
    this.setText(this._price, value !== null ? value + ' синапсов' : 'Бесценно');
  }
}

export class ProductPreview extends Product {
  protected _category: HTMLElement;
  protected _text: HTMLElement;
  protected _image: HTMLImageElement;
  protected _button: HTMLButtonElement

  constructor(container: HTMLElement, actions: IProductActions) {
    super(container)
    this._category = ensureElement<HTMLElement>('.card__category', this.container)
    this._text = ensureElement<HTMLElement>('.card__text', this.container)
    this._image = ensureElement<HTMLImageElement>('.card__image', this.container)
    this._button = ensureElement<HTMLButtonElement>('.card__button', this.container)
    if (actions.addToBasket) {
      this._button.addEventListener('click', actions.addToBasket);
    }

  }
  //Установка текста категории и css-класса, для изменения цвета плашки
  set category(value: string) {
    this.setText(this._category, value);
    Object.values(CATEGORY_MODIFIERS).forEach(modifier => {
      this._category.classList.remove(`card__category_${modifier}`);
    });
    // Добавляем нужный модификатор, если он есть в mapping
    const modifier = CATEGORY_MODIFIERS[value];
    if (modifier) {
      this._category.classList.add(`card__category_${modifier}`);
    }
  }

  set description(value: string) {
    this.setText(this._text, value);
  }

  set image(value: string) {
    this.setImage(this._image, value)
  }

  //Для изменения состояния кнопки, если товар уже в корзине или он не имеет цены
  setButtonState(inBasket: boolean, hasPrice: boolean): void {
    this._button.disabled = inBasket || !hasPrice;

    if (!hasPrice) {
      this._button.textContent = 'Не для продажи';
    } else {
      this._button.textContent = inBasket ? 'В корзине' : 'В корзину';
    }
  }
}

export class ProductCatalogItem extends Product {
  protected _category: HTMLElement;
  protected _image: HTMLImageElement;

  constructor(container: HTMLElement, actions: IProductActions) {
    super(container)
    if (actions.onClick) {
      this.container.addEventListener('click', actions.onClick);
    }
    this._category = ensureElement<HTMLElement>('.card__category', this.container)
    this._image = ensureElement<HTMLImageElement>('.card__image', this.container)
  }

  set category(value: string) {
    this.setText(this._category, value);
    Object.values(CATEGORY_MODIFIERS).forEach(modifier => {
      this._category.classList.remove(`card__category_${modifier}`);
    });
    // Добавляем нужный модификатор, если он есть в mapping
    const modifier = CATEGORY_MODIFIERS[value];
    if (modifier) {
      this._category.classList.add(`card__category_${modifier}`);
    }
  }

  set image(value: string) {
    this.setImage(this._image, value)
  }
}

export class ProductBasketItem extends Product {
  protected _index: HTMLElement
  protected _button: HTMLButtonElement

  constructor(container: HTMLElement, actions: IProductActions) {
    super(container)
    this._index = ensureElement<HTMLElement>('.basket__item-index', this.container)
    this._button = ensureElement<HTMLButtonElement>('.card__button', this.container)
    if (actions.deleteFromBasket) {
      this._button.addEventListener('click', actions.deleteFromBasket);
    }
  }

  set index(value: number) {
    this.setText(this._index, value)
  }

  get index(): number {
    return Number(this._index.textContent)
  }
}