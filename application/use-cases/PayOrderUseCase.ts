// Caso de Uso: PayOrderUseCase
// Responsável por processar o pagamento de um pedido.
// Ele usa o serviço de domínio para validação e o repositório para buscar e persistir o pedido.

import { OrderId } from '../../domain/value-objects/OrderId';
import { OrderRepository } from '../../domain/repositories/OrderRepository';
import { OrderDomainService } from '../../domain/services/OrderDomainService';

export class PayOrderUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

  /**
   * Executa o caso de uso para pagar um pedido.
   * @param orderId - O ID do pedido a ser pago.
   * @throws Error se o pedido não for encontrado ou não puder ser pago.
   */
  async execute(orderId: string): Promise<void> {
    // Busca o pedido pelo ID
    const order = await this.orderRepository.findById(new OrderId(orderId));
    if (!order) {
      throw new Error('Pedido não encontrado');
    }

    // Valida se o pedido pode ser pago (usando serviço de domínio)
    OrderDomainService.validateForPayment(order);

    // Executa o pagamento (lógica de negócio na entidade)
    order.pay();

    // Persiste o pedido atualizado
    await this.orderRepository.save(order);
  }
}