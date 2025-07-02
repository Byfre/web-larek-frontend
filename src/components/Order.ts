import { Form } from "./Form";
import { IEvents } from "./base/events";

export interface IOrder {
  address: string;
  paymenttype: string;
}

export class Order extends Form<IOrder> {
  protected _card: HTMLButtonElement;
  protected _cash: HTMLButtonElement;

  constructor(container: HTMLFormElement, protected events: IEvents) {
    super(container, events);

    this._card = container.elements.namedItem('card') as HTMLButtonElement;
    this._cash = container.elements.namedItem('cash') as HTMLButtonElement;

    //Используется для переключения кнопок выбора типа оплаты
    if (this._cash) {
      this._cash.addEventListener('click', () => {
        this._cash.classList.add('button_alt-active')
        this._card.classList.remove('button_alt-active')
        this.onInputChange('paymenttype', 'cash')
      })
    }
    if (this._card) {
      this._card.addEventListener('click', () => {
        this._card.classList.add('button_alt-active')
        this._cash.classList.remove('button_alt-active')
        this.onInputChange('paymenttype', 'card')
      })
    }
  }

}