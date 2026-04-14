// Interface do Repositório: OrderRepository
// Repositórios são interfaces que definem métodos para acessar e persistir agregados/entidades.
// Eles vivem na camada de domínio para expressar as necessidades do domínio, mas as implementações vivem na infraestrutura.

import { Order } from '../entities/Order';
import { OrderId } from '../value-objects/OrderId';

export interface OrderRepository {
  // Salva um pedido (criar ou atualizar)
  save(order: Order): Promise<void>;

  // Busca um pedido pelo seu ID
  findById(id: OrderId): Promise<Order | null>;

  // Deleta um pedido
  delete(id: OrderId): Promise<void>;

  // Opcional: busca todos os pedidos (se necessário pelos casos de uso)
  findAll(): Promise<Order[]>;
}