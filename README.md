# Estrutura de Projeto com Domain-Driven Design (DDD)

Este documento detalha a aplicação dos conceitos de Domain-Driven Design (DDD) neste projeto, abrangendo as camadas arquiteturais, conceitos fundamentais, organização de pastas, responsabilidades de cada arquivo e diretrizes para extensão e manutenção.

---

## Sumário
1. [O que é DDD?](#o-que-é-ddd)
2. [Conceitos Nucleares](#conceitos-nucleares)
3. [Arquitetura em Camadas](#arquitetura-em-camadas)
4. [Estrutura de Pastas](#estrutura-de-pastas)
5. [Responsabilidades dos Arquivos](#responsabilidades-dos-arquivos)
6. [Como Utilizar Esta Estrutura](#como-utilizar-estrutura)
7. [Benefícios da Abordagem](#benefícios-da-abordagem)
8. [Considerações Avançadas](#considerações-avançadas)
9. [Conclusão](#conclusão)

---

## O que é DDD?

Domain-Driven Design (DDD) é uma abordagem de desenvolvimento de software que prioriza:
- **Domínio Core**: A parte mais crítica da lógica de negócio.
- **Linguagem Ubíqua**: Um vocabulário compartilhado entre desenvolvedores e especialistas de domínio.
- **Contextos Delimitados (Bounded Contexts)**: Frontiras claras onde um modelo específico é consistente e válido.
- **Design Estratégico**: Padrões de alto nível para gerenciar complexidade e alinhar times (ex.: Context Mapping, Anti-Corruption Layer).
- **Design Tático**: Blocos de construção para expressar o modelo de domínio (Entidades, Objetos de Valor, Agregados, Serviços de Domínio, Repositórios, Fábricas, Módulos, Eventos de Domínio).

Este projeto exemplifica uma arquitetura em camadas inspirada nos princípios do DDD, com ênfase na separação de preocupações e independência da camada de domínio.

---

## Conceitos Nucleares

### 1. Entidades
Objetos que possuem identidade distintiva que persiste ao longo do tempo e apesar de mudanças de estado.
- **Identidade**: Definida por um identificador (ex.: `OrderId`).
- **Mutabilidade**: Podem mudar de estado, mas sua identidade permanece.
- **Exemplo**: `Order` representa um pedido no sistema, identificado por `OrderId`.

### 2. Objetos de Valor (Value Objects)
Objetos imutáveis que descrevem características ou atributos, onde a igualdade é baseada no valor, não na identidade.
- **Imutabilidade**: Após criados, seu estado não pode ser alterado.
- **Exemplos**: `OrderId` (se tratado como VO), `Money`, `Address`, `Email`.
- **Nota**: Neste exemplo simples, `OrderId` é modelado como um VO para demonstrar imutabilidade e comparação por valor.

### 3. Agregados (Aggregates)
Um cluster de objetos associados que são tratados como uma unidade única para modificações de dados. O **Aggregate Root** é a entidade de entrada que controla o acesso aos demais objetos do agregado.
- **Limite de Consistência**: Todas as mudanças dentro do agregado devem ser consistentes.
- **Referências Externas**: Objetos fora do agregado devem referenciar apenas o root.
- **Exemplo**: `Order` é o aggregate root, podendo conter itens (`OrderItem`) como entidades ou VOs internos.

### 4. Repositórios (Repositories)
Abstração que encapsula o acesso a persisten­cia, fornecendo uma interface de coleção para os agregados.
- **Separation of Concerns**: Isola a lógica de domínio dos detalhes de infraestrutura (SQL, NoSQL, APIs).
- **Contract First**: Definida como interface na camada de domínio; implementada na camada de infraestrutura.
- **Operações Típicas**: `save(aggregate)`, `findById(id)`, `findAll(criteria)`, `remove(aggregate)`.
- **Exemplo**: `OrderRepository` define o contrato; `InMemoryOrderRepository` oferece uma implementação em memória.

### 5. Serviços (Services)
Quando uma operação não cabe naturalmente dentro de uma entidade ou objeto de valor (por envolver múltiplos agregados ou não ter estado), é modelada como serviço.
- **Serviço de Domínio (Domain Service)**: Contém lógica de negócio que não pertence a nenhum objeto específico, mas ainda pertence ao domínio.
  - **Exemplo**: `OrderDomainService` pode conter validações complexas (ex.: verificar estoque, aplicar regras de desconto progressivo).
- **Serviço de Aplicação (Application Service)**: Orquestra casos de uso, coordenando entre domínio e infraestrutura, sem conter regras de negócio.
  - **Exemplo**: `CreateOrderUseCase`, `PayOrderUseCase`.

### 6. Objetos de Transferência de Dados (DTOs)
Objetos simples usados para transportar dados entre camadas, especialmente entre a camada de interfaces (controllers) e a de aplicação (use cases), evitando expor o modelo de domínio diretamente.
- **Sem Comportamento**: Apenas campos (getters/setters opcionalmente).
- **Exemplo**: `CreateOrderDto` contém os dados necessários para criar um pedido (cliente ID, lista de itens, etc.).

### 7. Fábricas (Factories)
Encapsulam a criação de objetos complexos ou agregados, garantindo que invariantes sejam satisfeitos na instanciação.
- **Uso**: Quando a construção envolve lógica significativa ou depende de múltiplos objetos.
- **Exemplo**: Uma `OrderFactory` poderia garantir que um pedido seja criado com um `OrderId` válido e estado inicial correto.

### 8. Módulos/Packages
Agrupamento lógico de conceitos relacionados, refletindo a estrutura do domínio e facilitando a navegação no código.
- **Exemplo**: Pastas `entities`, `value-objects`, `services`, `repositories` dentro de `domain`.

---

## Arquitetura em Camadas

O projeto adota uma arquitetura hexagonal (ports and adapters) em camadas, respeitando a **Regra de Dependência**: as dependências apontam para dentro, ou seja, camadas externas podem depender de internas, mas nunca o inverso.

```
Interfaces (Controladores)
        ↓
Aplicação (Casos de Uso)
        ↓
Domínio (Entidades, VOs, Serviços de Domínio, Interfaces de Repositório)
        ↓
Infraestrutura (Implementações de Repositório, Provedores externos)
        ↓
Compartilhado (DTOs, utilitários, exceções)
```

### Responsabilidades de Cada Camada

#### 1. Camada de Interfaces (Interfaces Layer)
- **Função**: Lidar com preocupações externas (HTTP, mensageria, CLI, gRPC, etc.).
- **Componentes**: Controladores, presenters, gateways de entrada.
- **Responsabilidade**: Traduzir requisições externas em chamadas de caso de uso e formatar respostas.
- **Independência**: Não conhece detalhes de domínio além dos DTOs que recebe; não contém lógica de negócio.
- **Exemplo**: `OrderController.ts` define endpoints REST (`POST /orders`, `POST /orders/:id/pay`).

#### 2. Camada de Aplicação (Application Layer)
- **Função**: Orquestrar fluxos de casos de uso, coordenando entre domínio e infraestrutura.
- **Componentes**: Casos de uso (application services), orchestradores, serviços de aplicação.
- **Responsabilidade**:
  - Receber entrada (geralmente DTO) da camada de interfaces.
  - Validar entrada de forma leve (ex.: presença de campos obrigatórios).
  - Invocar operações de domínio (entidades, serviços de domínio).
  - Persistir alterações via repositórios.
  - Tratar exceções de domínio e converter em respostas apropriadas.
- **Restrição**: Não contém regras de negócio; apenas orquestra.
- **Exemplo**: `CreateOrderUseCase.ts` recebe `CreateOrderDto`, cria um `Order` via fábrica ou construtor, valida regras de domínio (possivelmente via `OrderDomainService`) e salva via `OrderRepository`.

#### 3. Camada de Domínio (Domain Layer)
- **Função**: O coração do modelo de negócio; contém a riqueza do domínio.
- **Componentes**: Entidades, Objetos de Valor, Agregados (implícitos), Serviços de Domínio, Interfaces de Repositório, Fabricas, Módulos, Eventos de Domínio (se aplicável).
- **Responsabilidade**:
  - Representar conceitos de negócio com comportamento e invariantes.
  - Impor consistência e validar regras de negócio.
  - Ser totalmente independente de frameworks, bancos de dados ou outras preocupações técnicas.
- **Dependências**: Nenhuma dependência de camadas externas; apenas depende de padrões da linguagem ou utilitários genéricos (ex.: bibliotecas de validação de UUID).
- **Exemplo**: `Order.ts` (entidade com métodos como `addItem(item)`, `calculateTotal()`), `OrderId.ts` (VO imutável), `OrderDomainService.ts` (validação de regras complexas como descontos por volume).

#### 4. Camada de Infraestrutura (Infrastructure Layer)
- **Função**: Implementar detalhes técnicos que suportam as camadas internas.
- **Componentes**: Implementações de repositórios, clientes de serviços externos (email, pagamento, SMS), configuradores de ORM, adapters de mensageria.
- **Responsabilidade**:
  - Cumprir os contratos definidos pelas interfaces de repositório da camada de domínio.
  - Lidar com preocupações de persistência (SQL, NoSQL, arquivos), comunicação externa, tratamento de erros de infraestrutura.
  - Permitir a troca de tecnologia sem afetar domínio ou aplicação (ex.: trocar `InMemoryOrderRepository` por `PostgreSQLOrderRepository`).
- **Dependências**: Pode depender de bibliotecas externas (ex.: TypeORM, Sequelize, Axios) e de interfaces da camada de domínio.
- **Exemplo**: `InMemoryOrderRepository.ts` implementa `OrderRepository` usando estruturas em memória (Map ou Array) para desenvolvimento e testes.

#### 5. Camada Compartilhada (Shared Layer)
- **Função**: Código que pode ser reutilizado transversalmente por várias camadas.
- **Componentes**: DTOs, exceções customizadas, utilitários de logging, helpers de serialização, constantes, enums.
- **Responsabilidade**:
  - Facilitar comunicação entre camadas (DTOs são o principal exemplo).
  - Proveer mecanismos comuns sem violar a camada de domínio (ex.: uma exceção `DomainException` pode ser compartilhada).
- **Cuidado**: Não colocar lógica de domínio aqui; apenas dados ou utilitários genéricos.
- **Exemplo**: `CreateOrderDto.ts` transporta dados da controller para o use case.

---

## Estrutura de Pastas

```
DDD/
├── application/
│   └── use-cases/
│       ├── CreateOrderUseCase.ts
│       └── PayOrderUseCase.ts
├── domain/
│   ├── entities/
│   │   └── Order.ts
│   ├── repositories/
│   │   └── OrderRepository.ts
│   ├── services/
│   │   └── OrderDomainService.ts
│   └── value-objects/
│       └── OrderId.ts
├── infrastructure/
│   ├── providers/        (reservado para integrações externas: email, pagamento, notificação)
│   └── repositories/
│       └── InMemoryOrderRepository.ts
├── interfaces/
│   └── controllers/
│       └── OrderController.ts
└── shared/
    └── dtos/
        └── CreateOrderDto.ts
```

### Detalhamento de Cada Pasta

- **`application/use-cases`**
  - Casos de uso que representam as operações que o sistema pode executar sob solicitação de um ator (usuário, outro sistema).
  - Cada caso de uso é tipicamente uma classe com um método `execute(dto: DTO): Promise<Result>`.

- **`domain/entities`**
  - Entidades com identidade, estado e comportamento.
  - Métodos que alteram o estado devem validar invariantes (ex.: `Order.prototype.addItem` verifica se o item já existe ou se quantidade > 0).

- **`domain/value-objects`**
  - Objetos imutáveis; implementam `equals(other)` e podem ser usados como chaves em maps ou elementos de sets.
  - Exemplos típicos: identificadores, faixas de valores (money), intervalos de datas.

- **`domain/repositories`**
  - Interfaces que definem o contrato de persistência. Não contêm implementação.
  - Assinaturas assíncronas quando envolvem I/O (`Promise<Order | null>`).

- **`domain/services`**
  - Serviços que encapsulam operações de domínio que não pertencem a uma única entidade.
  - Exemplo: cálculo de imposto que depende de regras de múltiplas jurisdições.

- **`infrastructure/providers`**
  - Espaço para adaptadores de serviços de terceiros (ex.: `EmailProvider`, `PaymentGatewayProvider`).

- **`infrastructure/repositories`**
  - Implementações concretas das interfaces de repositório.
  - Podem variar conforme ambiente: `InMemoryOrderRepository` (dev/test), `PostgreSQLOrderRepository` (prod), `MongoOrderRepository`.

- **`interfaces/controllers`**
  - Pontos de entrada que recebem requisições externas (HTTP, WebSocket, etc.).
  - Transformam o payload em DTO, chamam o use case apropriado e retornam resposta (status code, body).

- **`shared/dtos`**
  - Objetos simples de transferência de dados, geralmente interfaces ou classes sem métodos.
  - Podem ser validados por bibliotecas de validação (class-validator, Joi) antes de chegar ao use case.

---

## Responsabilidades dos Arquivos

### Camada de Domínio

- **`domain/entities/Order.ts`**
  - Representa um pedido com identidade (`OrderId`), coleção de itens, métodos de negócio.
  - Exemplo de métodos:
    - `addItem(item: OrderItem): void` – valida estoque, quantidade mínima, etc.
    - `removeItem(itemId: OrderId): void`
    - `calculateTotal(): Money` – soma dos itens mais descontos/impostos.
    - `isPayable(): boolean` – verifica se o pedido pode ser pago (estado, valor > 0).
  - Garante que o objeto nunca entre em estado inconsistente.

- **`domain/value-objects/OrderId.ts`**
  - VO imutável que encapsula um identificador (UUID, ULID, string).
  - Métodos: `equals(other: OrderId): boolean`, `toString(): string`.
  - Construtor privado ou factory para garantir validade (ex.: não aceita null/empty).

- **`domain/services/OrderDomainService.ts`**
  - Lógica de negócio que não cabe dentro de `Order`.
  - Exemplo de métodos:
    - `validateOrder(order: Order): void` – verifica regras complexas (ex.: cliente pode ter apenas 5 pedidos pendentes).
    - `applyDiscount(order: Order, coupon: Coupon): void` – desconto baseado em regras de negócio.
    - `calculateTaxes(order: Order, taxTable: TaxTable): Money` – depende de fatores externos (tabela de impostos).
  - Pode receber dependências via injeção (repositórios de leitura, serviços externos).

- **`domain/repositories/OrderRepository.ts`**
  - Interface TypeScript (ou abstrata em outras linguagens) que declara:
    ```ts
    interface OrderRepository {
      save(order: Order): Promise<void>;
      findById(id: OrderId): Promise<Order | null>;
      findByCustomerId(customerId: CustomerId): Promise<Order[]>;
      delete(id: OrderId): Promise<void>;
    }
    ```
  - Define o contrato sem preocupações de implementação.

### Camada de Aplicação

- **`application/use-cases/CreateOrderUseCase.ts`**
  - Orquestra a criação de um pedido.
  - Fluxo típico:
    1. Validação leve do DTO (campos obrigatórios, tipos básicos).
    2. Criação de `OrderId` (via factory ou VO construtor).
    3. Criação da instância `Order` (possivelmente através de uma fábrica para garantir consistência).
    4. Validações de domínio (pode delegar a `OrderDomainService`).
    5. Persistência via `orderRepository.save(order)`.
    6. Retorno de DTO de resposta (ex.: `OrderResponseDto` com ID criado).

- **`application/use-cases/PayOrderUseCase.ts`**
  - Processa o pagamento de um pedido.
  - Fluxo:
    1. Busca o pedido pelo ID (`orderRepository.findById`).
    2. Se não encontrado, lança `OrderNotFoundException`.
    3. Verifica se o pedido já está pago (regra de domínio).
    4. Processa pagamento (pode chamar um `PaymentProvider` via infraestrutura ou delegar a um serviço de domínio).
    5. Atualiza estado do pedido (`order.markAsPaid()`) e persiste.
    6. Possivelmente dispara eventos de domínio (`OrderPaidEvent`) para integração com outros contextos (notificação, estoque).

### Camada de Infraestrutura

- **`infrastructure/repositories/InMemoryOrderRepository.ts`**
  - Implementação simples para desenvolvimento/teste.
  - Usa estrutura em memória (ex.: `Map<OrderId, Order>` ou `Array<Order>`).
  - Métodos:
    - `save`: adiciona ou substitui no mapa.
    - `findById`: busca no mapa e retorna cópia profunda (para evitar vazamento de referência).
    - Simula latência aleatória opcional para testes de comportamento assíncrono.
  - Não deve ser usada em produção; serve como mock ou stub.

### Camada de Interfaces

- **`interfaces/controllers/OrderController.ts`**
  - Controlador REST (exemplo com Express ou similares).
  - Endpoints:
    - `POST /orders`
      - Recebe `CreateOrderDto` no body.
      - Chama `createOrderUseCase.execute(dto)`.
      - Retorna `201 Created` com `Location` header e corpo contendo `OrderResponseDto`.
    - `POST /orders/:id/pay`
      - Extrai `id` do parâmetro de rota.
      - Chama `payOrderUseCase.execute({ orderId: id })`.
      - Retorna `200 OK` com corpo indicando sucesso ou `400/409` em caso de falha de negócio.
  - Tratamento de erros:
    - Exceções de domínio (`DomainException`) → `400 Bad Request`.
    - Exceções de negócio específicas (`OrderNotFoundException`) → `404 Not Found`.
    - Erros inesperados → `500 Internal Server Error` (logado, não exposto ao cliente).

### Camada Compartilhada

- **`shared/dtos/CreateOrderDto.ts`**
  - Interface ou classe simples:
    ```ts
    interface CreateOrderDto {
      customerId: string; // ou CustomerId VO
      items: { productId: string; quantity: number }[];
      // opcional: couponCode?: string;
    }
    ```
  - Pode ser validado por middleware (ex.: usando `class-validator`):
    ```ts
    import { IsNotEmpty, IsArray, ValidateNested } from 'class-validator';
    export class CreateOrderDto {
      @IsNotEmpty()
      customerId: string;

      @IsArray()
      @ValidateNested({ each: true })
      items: { productId: string; quantity: number }[];
    }
    ```

---

## Como Utilizar Esta Estrutura

### 1. Adicionando uma Nova Funcionalidade
1. **Entender o Contexto Delimitado** – Se o projeto possuir múltiplos bounded contexts, identifique ao qual a nova feature pertence.
2. **Modelar o Domínio**
   - Crie ou atualize Entidades, VOs e/ou Agregados em `domain/entities` e `domain/value-objects`.
   - Adicione lógica de negócio em `domain/services` se necessário.
   - Defina ou estenda interfaces de repositório em `domain/repositories`.
3. **Implementar Caso de Uso**
   - Crie uma nova classe em `application/use-cases` (ex.: `CancelOrderUseCase.ts`).
   - Orquestre a operação: validação de entrada, chamada a domínio, persistência.
4. **Expor via Interface**
   - Adicione um endpoint em `interfaces/controllers` (ex.: `OrderController.ts`) que chame o caso de uso.
   - Defina DTOs de entrada e saída em `shared/dtos` se necessário.
5. **Implementar Persistência**
   - Forneça uma implementação concreta do repositório em `infrastructure/repositories` (ou mock para testes).
   - Se for troca de tecnologia, apenas essa camada muda.
6. **Escrever Testes**
   - Testes unitários de entidades, VOs e serviços de domínio (sem mocks de infraestrutura).
   - Testes de caso de uso com repositórios mockados.
   - Testes de controlador com casos de uso mockados.
   - Testes de integração usando uma implementação real ou in-memory do repositório.

### 2. Trocando Mecanismo de Persistência
- Basta criar uma nova implementação da interface de repositório (ex.: `PostgreSQLOrderRepository`) em `infrastructure/repositories`.
- Configurar o container de injeção de dependência (se houver) para usar a nova implementação.
- Nenhuma alteração necessária em `domain` ou `application`.

### 3. Evoluindo o Modelo de Domínio
- Alterações em entidades ou VOs devem ser guiadas por testes unitários de domínio.
- Se mudar a assinatura de um repositório, atualize todas as implementações e os casos de uso que o utilizam (o compilador ajudará em linguagens tipadas).
- Use eventos de domínio para desacoplar reações a mudanças (ex.: quando um pedido é pago, atualizar estoque em outro bounded context via mensagem).

---

## Benefícios da Abordagem

- **Separação Claro de Responsabilidades (SRP)**: Cada camada tem um motivo único para mudar.
- **Independência de Tecnologia**: A camada de domínio não sabe se os dados vem de PostgreSQL, MongoDB ou serviço externo.
- **Testabilidade**: Lógica de negócio pode ser testada em isolamento, sem necessidade de banco de dados ou container web.
- **Manutenibilidade**: Mudanças em regras de negócio afetam apenas a camada de domínio; mudanças de infraestrutura são isoladas.
- **Escalabilidade**: Novos casos de uso podem ser adicionados sem impactar o core existente.
- **Alinhamento com o Negócio**: O código reflete conceitos de domínio, facilitando a comunicação com especialistas (linguagem ubíqua).
- **Flexibilidade para Evolução**: Estrutura suporta padrões avançados como CQRS, Event Sourcing, Arquitetura de Hexágonos, e múltiplos bounded contexts.

---

## Considerações Avançadas

À medida que o projeto amadurece, pode-se incorporar:

### a. Eventos de Domínio (Domain Events)
- Entidades publicam eventos quando ocorrem mudanças significativas (ex.: `OrderCreatedEvent`, `OrderPaidEvent`).
- Handlers (no mesmo ou outro bounded context) reagem a esses eventos (atualizar estoque, enviar e-mail, iniciar saga).
- Implementação: usar um dispatcher simples ou integrar com um barramento de mensagens (RabbitMQ, Kafka).

### b. CQRS (Command Query Responsibility Segregation)
- Separar modelos de leitura e escrita.
- Use Cases de escrita (commands) permanecem como está.
- Queries podem usar repositórios otimizados para leitura (projeções, views matérialisadas, ou até um banco de dados separado para read model).
- Benefício: escalar leitura e escrita independentemente.

### c. Arquitetura de Hexágonos Ports & Adapters
- Refinar a ideia de camadas definindo portas (interfaces) e adaptadores (implementações).
- Facilita a troca de tecnologias sem tocar no core.

### d. Injeção de Dependência (DI) e Container
- Utilizar um container (ex.: `typedi`, `inversify`, NestJS DI) para gerenciar dependências de use cases, repositórios e serviços.
- Melhora testabilidade e desacoplamento.

### e. Validação Avançada
- Aplicar validação de DTOs em camada de interfaces usando bibliotecas como `class-validator`, `joi`, ou `zod`.
- Validações de domínio mais complexas permanecem dentro de entidades ou serviços de domínio.

### f. Tratamento de Exceções de Domínio
- Definir hierarquia de exceções (`DomainException` → subclasses como `BusinessRuleViolationException`, `EntityNotFoundException`).
- Centralizar o tratamento em middleware de controllers para retornar códigos HTTP apropriados.

### g. Documentação de API Gerada a Partir de Casos de Uso
- Ferramentas como `tsoa` (para Express/NestJS) podem gerar OpenAPI/Swagger a partir dos controllers, mantendo sincronia com os casos de uso.

---

## Conclusão

Esta estrutura fornece uma base sólida para aplicar os princípios do Domain-Driven Design em um projeto TypeScript/Node.js. Ao separar claramente as responsabilidades em camadas e focar no modelo de domínio, conseguimos um código que é:

- **Expressivo**: fácil de ler e mapear para conceitos de negócio.
- **Seguro**: invariantes são protegidos pelas entidades e VOs.
- **Adaptável**: mudanças tecnológicas ou de escopo afetam apenas as camadas relevantes.
- **Testável**: cada camada pode ser verificada isoladamente com diferentes níveis de mock.

À medida que o domínio cresce, considere introduzir mais bounded contexts, padrões de integração (eventos, sagas) e técnicas de escalabilidade (CQRS, read models). Lembre-se de que DDD é tanto sobre organização de código quanto sobre colaboração entre desenvolvedores e especialistas de domínio para criar um modelo que realmente resolva os problemas do negócio.

*Documento mantido como referência viva do projeto; atualize-o conforme a arquitetura evolui.*