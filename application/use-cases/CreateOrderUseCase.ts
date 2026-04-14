// Caso de Uso: CreateOrderUseCase
// Casos de uso representam regras de negócio específicas da aplicação.
// Eles orquestram o fluxo de dados para dentro e para fora das entidades, e direcionam essas entidades a usar suas regras de negócio empresariais.
// Casos de uso são independentes de frameworks, bancos de dados e UI.

import { OrderId } from '../../domain/value-objects/OrderId';
import { Order } from '../../domain/entities/Order';
import { OrderRepository } from '../../domain/repositories/OrderRepository';
import { CreateOrderDto } from '../../shared/dtos/CreateOrderDto';

export class CreateOrderUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

  /**
   * Executa o caso de uso para criar um novo pedido.
   * @param dto - Objeto de Transferência de Dados contendo os dados de entrada.
   * @returns O ID do pedido criado.
   */
  async execute(dto: CreateOrderDto): Promise<string> {
    // Cria um novo OrderId (pode ser gerado pelo caso de uso ou domínio)
    const orderId = new OrderId(Date.now().toString()); // geração simples de ID para demonstração

    // Cria a entidade Order (validação de regras de negócio acontece no construtor)
    const order = new Order(orderId, dto.customerName, dto.totalAmount);

    // Persiste o pedido via repositório
    await this.orderRepository.save(order);

    // Retorna o ID do pedido criado
    return order.getId().getValue();
  }
}