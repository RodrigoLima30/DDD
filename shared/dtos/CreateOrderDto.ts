// Objeto de Transferência de Dados: CreateOrderDto
// Usado para transferir dados do controller para o caso de uso.
// DTOs devem ser objetos simples sem lógica de negócios.

export interface CreateOrderDto {
  customerName: string;
  totalAmount: number;
}