// Implementação da Infraestrutura: InMemoryOrderRepository
// Esta é uma implementação concreta da interface OrderRepository.
// Ela vive na camada de infraestrutura porque lida com preocupações de armazenamento.
// Para fins de demonstração, usamos um mapa em memória.
// Em uma aplicação real, isso poderia ser substituído por uma implementação de banco de dados.

import { Order } from '../../domain/entities/Order';
import { OrderId } from '../../domain/value-objects/OrderId';
import { OrderRepository } from '../../domain/repositories/OrderRepository';

export class InMemoryOrderRepository implements OrderRepository {
  // Armazenamento em memória (simulando um banco de dados)
  private orders: Map<string, Order> = new Map();

  async save(order: Order): Promise<void> {
    // Armazena ou atualiza o pedido pelo seu ID
    this.orders.set(order.getId().getValue(), order);
  }

  async findById(id: OrderId): Promise<Order | null> {
    const order = this.orders.get(id.getValue());
    return order ?? null;
  }

  async delete(id: OrderId): Promise<void> {
    this.orders.delete(id.getValue());
  }

  async findAll(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }
}