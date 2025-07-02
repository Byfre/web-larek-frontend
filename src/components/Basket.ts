import { IProduct } from "../types";
import { ensureElement } from "../utils/utils";
import { IEvents } from "./base/events";
import { Component } from "./base/Component";

export interface IBasket {
  items: IProduct[];
  total: HTMLElement;
  list: HTMLElement
  button: HTMLButtonElement
}

export class Basket extends Component<IBasket> {
  protected _items: IProduct[]
  protected _list: HTMLElement
  protected _total: HTMLElement
  protected _button: HTMLButtonElement

  constructor(container: HTMLElement, events: IEvents) {
    super(container)
    this._list = ensureElement<HTMLUListElement>('.basket__list', this.container)
    this._total = ensureElement<HTMLElement>('.basket__price', this.container)
    this._button = ensureElement<HTMLButtonElement>('.basket__button', this.container)
    this._button.addEventListener('click', () => {
      events.emit('basket:submit')
    })
  }

  set total(value: number) {
    this.setText(this._total, String(`${value} синапсов`));
  }

  set list(items: HTMLElement[]) {
    this._list.replaceChildren(...items);
  }

  setSubmitDisabled(state: boolean) {
    this._button.disabled = state;
  }
}
