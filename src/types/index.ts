import { ProductData } from "../components/AppState";

//Интерфейс для состояния приложения
export interface IAppState {
  catalog: ProductData[];
  basket: string[];
  order: IProduct[];
  loading: boolean;
  contacts: Contacts
}

//Интерфейс товара
export interface IProduct {
  category: string;
  title: string;
  description: string;
  image: string;
  price: number | null;
  id: string;
}

//Тип заказа для отпраки на сервер
export type OrderRequest = {
  payment: PaymentType,
  email: string,
  phone: string,
  address: string,
  total: number,
  items: string[]
}

//Тип контактов пользователя
export type Contacts = {
  address: string,
  email: string,
  phone: string,
  paymenttype: PaymentType | string,
}

export type FormErrors = Partial<Record<keyof Contacts, string>>;

export type PaymentType = 'cash' | 'card'