// Valor Objeto: OrderId
// Representa o identificador único de um Pedido.
// Valor Objetos são imutáveis e definidos por seus atributos, não por identidade.
// Dois OrderIds com o mesmo valor são considerados iguais.

export class OrderId {
  private readonly value: string;

  constructor(value: string) {
    // Validação: OrderId deve ser uma string não vazia
    if (!value || value.trim() === '') {
      throw new Error('OrderId não pode estar vazio');
    }
    this.value = value.trim();
  }

  // Getter para acessar o valor (somente leitura)
  public getValue(): string {
    return this.value;
  }

  // Comparação de igualdade baseada no valor
  public equals(other: OrderId): boolean {
    return this.value === other.value;
  }

  // Opcional: para depuração / logging
  public toString(): string {
    return this.value;
  }
}