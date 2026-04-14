// Serviço de Domínio: OrderDomainService
// Serviços de Domínio contêm lógica de negócios que não pertencem a nenhuma única entidade ou objeto de valor.
// Eles são stateless e frequentemente usados para validações, cálculos ou operações que abrangem múltiplos agregados.
// Neste exemplo, usamos para validar um pedido para pagamento (também poderia ser usado por outros casos de uso).

import { Order } from '../entities/Order';

export class OrderDomainService {
  /**
   * Valida se um pedido pode ser pago.
   * Lança um erro se o pedido não estiver em um estado válido para pagamento.
   * Esta validação pode ser reutilizada por vários casos de uso (ex: pagamento, agendamento).
   */
  public static validateForPayment(order: Order): void {
    if (order.getStatus() === 'paid') {
      throw new Error('Pedido já está pago');
    }
    if (order.getStatus() === 'cancelled') {
      throw new Error('Não é possível pagar um pedido cancelado');
    }
    // Regras adicionais de negócio poderiam ser adicionadas aqui, ex:
    // - O pedido deve ter sido criado nos últimos 30 dias
    // - O cliente não deve estar na lista negra
    // - etc.
  }

  /**
   * Valida se um pedido pode ser cancelado.
   * Lança um erro se o pedido não estiver em um estado válido para cancelamento.
   */
  public static validateForCancellation(order: Order): void {
    if (order.getStatus() === 'paid') {
      throw new Error('Não é possível cancelar um pedido pago');
    }
    // Já cancelado? Isso está bem, mas podemos lançar se quisermos evitar operações redundantes
    if (order.getStatus() === 'cancelled') {
      throw new Error('Pedido já está cancelado');
    }
  }
}