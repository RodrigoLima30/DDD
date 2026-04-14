// Controlador: OrderController
// Controladores lidam com entrada (ex: requisições HTTP) e delegam aos casos de uso.
// Eles não devem conter lógica de negócios, apenas tradução entre formato externo (ex: HTTP) e casos de uso da aplicação.
// Em uma aplicação real, isso seria conectado a um framework web (Express, NestJS, etc.).
// Neste template, simulamos o controlador como uma classe que pode ser instanciada e usada.

import { CreateOrderUseCase } from '../../application/use-cases/CreateOrderUseCase';
import { PayOrderUseCase } from '../../application/use-cases/PayOrderUseCase';
import { CreateOrderDto } from '../../shared/dtos/CreateOrderDto';

export class OrderController {
  constructor(
    private readonly createOrderUseCase: CreateOrderUseCase,
    private readonly payOrderUseCase: PayOrderUseCase
  ) {}

  /**
   * Simula o tratamento de uma requisição POST /orders para criar um novo pedido.
   * @param body - O corpo da requisição (deve corresponder ao CreateOrderDto).
   * @returns O ID do pedido criado.
   */
  async handleCreateOrder(body: CreateOrderDto): Promise<string> {
    // Em um controlador real, você poderia validar o corpo aqui (ex: com uma biblioteca de validação)
    // mas assumimos que já está validado ou o caso de uso lançará um erro.
    return await this.createOrderUseCase.execute(body);
  }

  /**
   * Simula o tratamento de uma requisição PUT /orders/:id/pay para pagar um pedido.
   * @param orderId - O ID do pedido a ser pago (dos parâmetros da URL).
   */
  async handlePayOrder(orderId: string): Promise<void> {
    await this.payOrderUseCase.execute(orderId);
  }

  // Métodos adicionais para outros endpoints (ex: getOrder, cancelOrder) podem ser adicionados aqui.
}