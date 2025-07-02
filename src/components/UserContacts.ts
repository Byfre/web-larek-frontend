import { Form } from "./Form";
import { IEvents } from "./base/events";

export interface IUserContacts {
  phone: string;
  email: string;
}

export class UserContacts extends Form<IUserContacts> {
  constructor(container: HTMLFormElement, protected events: IEvents) {
    super(container, events);
  }
}
