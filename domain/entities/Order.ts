// Entidade: Order
// Uma Entidade é um objeto definido por sua identidade, não apenas por seus atributos.
// Dois Pedidos com os mesmos dados mas IDs diferentes são considerados entidades diferentes.
// Entidades podem ter estado mutável e lógica de negócios.

import { OrderId } from '../value-objects/OrderId';

export class Order {
  private readonly id: OrderId;
  private customerName: string;
  private totalAmount: number;
  private status: 'pending' | 'paid' | 'cancelled';

  constructor(id: OrderId, customerName: string, totalAmount: number) {
    // Validação das regras de negócio
    if (!customerName || customerName.trim() === '') {
      throw new Error('Nome do cliente não pode estar vazio');
    }
    if (totalAmount <= 0) {
      throw new Error('Valor total deve ser maior que zero');
    }

    this.id = id;
    this.customerName = customerName.trim();
    this.totalAmount = totalAmount;
    this.status = 'pending'; // status inicial
  }

  // Getters (acesso somente leitura às propriedades)
  public getId(): OrderId {
    return this.id;
  }

  public getCustomerName(): string {
    return this.customerName;
  }

  public getTotalAmount(): number {
    return this.totalAmount;
  }

  public getStatus(): 'pending' | 'paid' | 'cancelled' {
    return this.status;
  }

  // Métodos de negócio que podem modificar o estado (encapsulando regras de negócio)
  public pay(): void {
    if (this.status === 'paid') {
      throw new Error('Pedido já está pago');
    }
    if (this.status === 'cancelled') {
      throw new Error('Não é possível pagar um pedido cancelado');
    }
    this.status = 'paid';
  }

  public cancel(): void {
    if (this.status === 'paid') {
      throw new Error('Não é possível cancelar um pedido pago');
    }
    this.status = 'cancelled';
  }

  // Opcional: atualizar nome do cliente (se o negócio permitir)
  public updateCustomerName(newName: string): void {
    if (!newName || newName.trim() === '') {
      throw new Error('Nome do cliente não pode estar vazio');
    }
    this.customerName = newName.trim();
  }
}