import { ensureElement } from "../utils/utils";
import { Component } from "./base/Component";
import { IEvents } from "./base/events";

export interface ISuccess {
  description: number;
}

export class Success extends Component<ISuccess> {
  protected _button: HTMLButtonElement;
  protected _description: HTMLElement;

  constructor(container: HTMLElement, protected events: IEvents) {
    super(container);

    this._button = ensureElement<HTMLButtonElement>('.order-success__close', this.container)
    this._description = ensureElement<HTMLElement>('.order-success__description', this.container)

    this._button.addEventListener('click', () => {
      this.events.emit('success:close')
    })
  }
  set total(value: number) {
    this.setText(this._description, `Списано ${value} синапсов`);
  }

}



