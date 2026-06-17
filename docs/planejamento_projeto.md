# Planejamento: Expansão do Pré-Projeto para Projeto de TCC

**Prazo de entrega:** 19 de junho de 2026 (19h)  
**Tamanho esperado:** 20–25 páginas  
**Formato:** PDF

---

## Foco da expansão (instrução do coordenador)

O norte é responder **"como será feito"** — não repetir fundamentação teórica. As três seções prioritárias são:

1. **Metodologia** — stack tecnológica, diagrama de arquitetura, requisitos, método de validação
2. **Resultados Parciais e Esperados** — o que é tangível agora; entrega exata do MVP
3. **Cronograma** — obrigatório, com milestones até a entrega da monografia

Referencial teórico, 3.1, 3.2 e 3.4 são secundários — pequenos ajustes, não reescrita.

---

## Diagnóstico atual (pré-projeto ~15 páginas)

| Seção | Status | Ação |
|---|---|---|
| Introdução | ✅ Aprovado | Só capitalização e objetivos em lista |
| Referencial Teórico | ⚠️ Secundário | Pequeno aprofundamento em 2.1 e 2.4 se sobrar tempo |
| 3.1 Delimitação | ✅ Aprovado | Sem alteração — detalhes ficam para o TCC |
| 3.2 Coleta de dados | ✅ Base ok | Ajuste menor se necessário |
| 3.3 DSDM | ⚠️ Fraco | Justificar a escolha e explicar MoSCoW brevemente |
| 3.4 Avaliação | ✅ Base ok | Ajuste menor se necessário |
| 3.5 Arquitetura | 🔴 Incompleto | **Criar: stack + diagrama + requisitos** |
| Resultados Parciais | 🔴 Vago | **Reescrever: entrega concreta do MVP** |
| Cronograma | 🔴 Ausente | **Criar do zero** |

---

## Stack tecnológica definida

| Camada | Tecnologia | Observação |
|---|---|---|
| Backend | **NestJS** (Node.js + TypeScript) | Arquitetura modular, alinha com Hexagonal/Clean já descrita |
| Frontend Web (admin) | **Next.js** (TypeScript) | SSR/SSG, boas práticas, React Query para cache de dados |
| Estilização Web | **Tailwind CSS + shadcn/ui** | Componentização, acessibilidade, consistência visual |
| Mobile (associado) | **React Native + Expo** (TypeScript) | Multiplataforma, reuso de lógica com o frontend web |
| Banco de Dados | **PostgreSQL** | Relacional, adequado ao domínio associativo |
| ORM | **TypeORM** | Maduro, integração nativa com NestJS, suporte a migrations complexas e relacionamentos avançados |
| Autenticação | **JWT + RBAC** | Perfis: administrador / associado |
| Linguagem unificada | **TypeScript** em todas as camadas | Reduz contexto de troca, tipos compartilháveis |

> A justificativa de cada escolha deve aparecer no texto da seção 3.5.1 — não apenas a listagem, mas o *porquê* acadêmico/técnico de cada decisão (ex.: TypeScript end-to-end reduz erros de contrato entre camadas; Prisma permite migrations versionadas adequadas a um projeto com esquema em evolução).

---

## Plano de alterações

### 1. Correções pontuais (rápidas)

- [ ] Capitalização das subseções — padronizar para MAIÚSCULAS em todo o documento
- [ ] Objetivos específicos — converter o parágrafo da linha 85 em alíneas a), b), c), d)

---

### 2. Metodologia — expansão principal (3.5)

#### 3.3 DSDM — adicionar justificativa (1 parágrafo)
- Explicar os princípios-chave: prazo fixo, escopo variável, priorização MoSCoW, timeboxing
- Justificar escolha frente ao Scrum: DSDM é desenhado para projetos com data de entrega definida — alinha ao calendário do TCC
- Citar DSDM Consortium (2014) e Stapleton (1997)
- A tabela MoSCoW fica na 3.5.4 e pode ser referenciada aqui

#### 3.5 Arquitetura — expandir com subsubseções

##### 3.5.1 Stack tecnológica (nova)
- Tabela com as tecnologias e parágrafo justificando as escolhas principais
- Destacar a decisão de TypeScript end-to-end como redutor de erros de contrato entre camadas
- Mencionar que React Native + Expo permite compartilhamento de lógica e tipos com o frontend web

##### 3.5.2 Diagrama de arquitetura (nova)
- Diagrama de componentes: App Mobile (RN/Expo) → API REST (NestJS) → Domínio (Use Cases) → Adapters → PostgreSQL / Serviços externos
- Fazer em draw.io ou Figma, exportar PNG, incluir como `\figure` no LaTeX
- **Status: a fazer antes da escrita**

##### 3.5.3 Modelagem do banco de dados
- **Decisão: deixar para o TCC** — o modelo definitivo depende do levantamento com o Pia do Sul
- No Projeto: mencionar as entidades principais identificadas até agora (Associado, Mensalidade, Evento, Reserva, Ingresso, Usuário) e sinalizar que o modelo completo será definido na fase de requisitos
- Opcional: incluir um diagrama ER preliminar/conceitual se houver tempo

##### 3.5.4 Requisitos funcionais e não-funcionais (nova)
Tabela de requisitos base (antes da reunião com o parceiro — refinamento no TCC):

**Módulo Associados**
| Req | Descrição | MoSCoW |
|---|---|---|
| RF01 | Cadastrar associado com dados pessoais e vínculo à entidade | Must |
| RF02 | Consultar e editar dados de associado | Must |
| RF03 | Registrar dependentes vinculados ao associado | Should |
| RF04 | Controlar status do associado (ativo, inativo, suspenso) | Must |

**Módulo Mensalidades**
| Req | Descrição | MoSCoW |
|---|---|---|
| RF05 | Registrar pagamento de mensalidade por associado | Must |
| RF06 | Visualizar histórico de pagamentos | Must |
| RF07 | Emitir comprovante de pagamento | Should |
| RF08 | Gerar relatório de inadimplência | Should |

**Módulo Eventos**
| Req | Descrição | MoSCoW |
|---|---|---|
| RF09 | Cadastrar evento (baile/fandango) com data, local e capacidade | Must |
| RF10 | Definir configuração de mesas e ingressos por evento | Must |
| RF11 | Registrar reserva de mesa por associado (fluxo administrativo) | Must |
| RF12 | Registrar compra/retirada de ingresso | Must |
| RF13 | Consultar disponibilidade de mesas em tempo real | Should |
| RF14 | Associado consultar suas reservas pelo app mobile | Must |

**Requisitos Não-Funcionais**
| Req | Descrição | MoSCoW |
|---|---|---|
| RNF01 | Interfaces com fluxos mediados (registro pela entidade em nome do associado) | Must |
| RNF02 | Autenticação com controle de perfis (administrador / associado) | Must |
| RNF03 | Aplicativo mobile compatível com Android e iOS via Expo | Must |
| RNF04 | API documentada (ex.: Swagger via NestJS) | Should |
| RNF05 | Tempo de resposta das operações principais < 2s | Should |

> Esses requisitos são base pré-reunião. Serão refinados e expandidos no TCC após levantamento com o Pia do Sul.

---

### 4. Resultados Parciais e Esperados — tornar concreto

- Descrever o que já está definido como entrega do MVP: quais telas/fluxos existirão
- Se houver protótipo Figma: incluir capturas como figuras no LaTeX
- Se não houver: listar explicitamente as telas previstas por módulo (ex.: "O MVP contemplará as seguintes telas no painel web: login, listagem de associados, cadastro de associado, lançamento de mensalidade, cadastro de evento, controle de reservas")
- Referenciar os cenários de uso que serão avaliados pelo SUS

---

### 5. Cronograma de Atividades — criar

| Atividade | Jul/26 | Ago/26 | Set/26 | Out/26 | Nov/26 |
|---|---|---|---|---|---|
| Reunião de requisitos com CPF Pia do Sul | ✓ | | | | |
| Modelagem definitiva do banco de dados | ✓ | | | | |
| Setup do ambiente (repositório, CI, infra) | ✓ | | | | |
| Desenvolvimento: módulo Associados + Mensalidades | ✓ | ✓ | | | |
| Desenvolvimento: módulo Eventos + Reservas + Ingressos | | ✓ | ✓ | | |
| App mobile — fluxos do associado | | | ✓ | | |
| Testes funcionais internos | | | ✓ | ✓ | |
| Avaliação com usuários no Pia do Sul (SUS + entrevistas) | | | | ✓ | |
| Análise dos resultados e ajustes | | | | ✓ | |
| Escrita da monografia (paralela ao desenvolvimento) | ✓ | ✓ | ✓ | ✓ | ✓ |
| Entrega final da monografia | | | | | ✓ |

---

## Estimativa de páginas após expansão

| Seção | Atual | Estimado |
|---|---|---|
| Introdução + subseções | ~3 | ~3,5 |
| Referencial Teórico | ~3 | ~5 |
| Metodologia (com stack, diagrama, requisitos) | ~4 | ~9 |
| Resultados Parciais e Esperados | ~1 | ~2 |
| Cronograma | 0 | ~1 |
| Referências | ~1 | ~1,5 |
| **Total estimado** | **~15** | **~22** |

---

## Ordem de execução sugerida

**Bloco 1 — O que o coordenador cobrou (prioridade máxima)**
1. Fazer o diagrama de arquitetura (draw.io / Figma) — desbloqueia a escrita da 3.5.2
2. Escrever 3.5.1 — stack tecnológica com justificativas
3. Escrever 3.5.2 — diagrama de arquitetura como figura no LaTeX
4. Escrever 3.5.4 — tabela de requisitos com MoSCoW
5. Reescrever Resultados Parciais — entrega concreta do MVP
6. Criar seção de Cronograma

**Bloco 2 — Melhorias complementares (se sobrar tempo)**
7. Justificar DSDM na 3.3 (1 parágrafo)
8. Correções pontuais (capitalização, objetivos em lista)
9. Revisar .bib (Stapleton, DSDM Consortium, e eventuais novas refs do referencial)

**Deixar para o TCC (não fazer agora)**
- Modelagem detalhada do banco de dados
- Detalhamento do contexto atual do Pia do Sul
- Expansão do referencial teórico (2.1, 2.4)
