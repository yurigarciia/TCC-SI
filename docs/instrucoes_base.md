# CONTEXTO MESTRE DO PRÉ-PROJETO DE TCC

## Identificação do trabalho
Curso: Sistemas de Informação  
Instituição: Faculdade Antônio Meneghetti  
Autor: Yuri Garcia Baptista  
Tipo de documento: Pré-projeto de Trabalho de Conclusão de Curso  

## Título atual
DESENVOLVIMENTO E AVALIAÇÃO DE UM ECOSSISTEMA DIGITAL PARA GESTÃO DE ASSOCIADOS E EVENTOS EM ENTIDADES TRADICIONALISTAS GAÚCHAS

## Natureza do trabalho
Este trabalho é um pré-projeto de TCC com foco aplicado, voltado ao desenvolvimento de software. O objetivo não é apenas analisar um problema, mas propor, modelar, desenvolver e avaliar um MVP de uma solução real.

## Tema geral
O tema está inserido no campo da cultura regional gaúcha e do Movimento Tradicionalista Gaúcho (MTG), com foco específico nas entidades tradicionalistas gaúchas e em seus processos administrativos.

## Delimitação temática
O trabalho não estuda o MTG como sistema centralizador. O foco está nas entidades tradicionalistas enquanto organizações autônomas, especialmente na gestão:
- de associados
- de mensalidades
- de eventos sociais tradicionais
- de reservas de mesas e ingressos
- do relacionamento entre entidade e associado

## Recorte funcional
O ecossistema digital proposto é composto por:
- plataforma web para administração da entidade
- aplicativo mobile para associados

## Escopo do sistema
O sistema proposto foca em:
- cadastro e gestão de associados
- controle de mensalidades
- gestão de eventos sociais
- reserva e compra de ingressos e mesas
- acesso do associado às suas informações
- fluxos administrativos mediados pela entidade, quando necessário

## Escopo dos eventos
O foco principal do trabalho está em bailes e fandangos. Rodeios artísticos e outros tipos de evento podem ser considerados em expansão futura, mas não são o foco do MVP.

## Não escopo / exclusões importantes
Este trabalho NÃO contempla:
- integração com o banco de dados do Cartão de Identidade Tradicionalista (CIT)
- integração com sistemas institucionais do MTG
- tratamento direto de dados financeiros sensíveis
- implementação de um sistema completo final de mercado
- abrangência total de todas as necessidades do tradicionalismo

## Justificativa central do problema
O problema central identificado é que a gestão de associados e eventos sociais em entidades tradicionalistas ocorre, em grande parte, de forma:
- manual
- fragmentada
- pouco digitalizada
- dependente de planilhas, documentos físicos e comunicação informal

Isso gera:
- retrabalho
- baixa padronização
- pouca transparência
- dificuldade de continuidade administrativa
- sobrecarga em dirigentes voluntários
- dificuldade de acesso à informação por parte dos associados

## Relevância social e organizacional
As entidades tradicionalistas:
- preservam cultura regional
- promovem convivência comunitária
- mantêm departamentos artísticos e grupos de dança
- organizam bailes e fandangos como parte central da dinâmica institucional
- movimentam grande número de eventos e recursos financeiros no RS

O trabalho defende que a digitalização da gestão pode coexistir com a preservação cultural.

## Pergunta de pesquisa
Como um ecossistema digital integrado pode facilitar e qualificar a gestão de associados e eventos sociais em entidades tradicionalistas gaúchas, respeitando suas especificidades culturais e organizacionais?

## Objetivo geral
Desenvolver e avaliar um ecossistema digital entidade-associado voltado à gestão de associados e de eventos sociais tradicionais, com ênfase em bailes e fandangos, no contexto das entidades tradicionalistas gaúchas.

## Objetivos específicos
- identificar requisitos essenciais relacionados à gestão de associados, mensalidades e eventos
- descrever a arquitetura e os principais componentes do ecossistema digital proposto
- implementar funcionalidades básicas do sistema
- avaliar o funcionamento do ecossistema a partir de cenários de uso reais, quando possível, ou simulados

## Campo de aplicação
O estudo de caso será realizado no:
CPF Pia do Sul  
Santa Maria/RS  
13ª Região Tradicionalista (13ª RT)

Essa entidade atua como parceira do projeto e será o campo de aplicação do estudo de caso.

## Importância metodológica do parceiro
A existência do parceiro não deve ser tratada como propaganda, mas como elemento de viabilidade metodológica. Ela permite:
- levantamento de requisitos em contexto real
- observação das rotinas administrativas
- validação do MVP
- coleta de feedback

## Perfil do público e diretriz de acessibilidade
O trabalho reconhece que o público das entidades tradicionalistas é heterogêneo e inclui pessoas idosas e usuários com menor familiaridade digital.

Por isso, o sistema não deve pressupor uso exclusivamente digital e autônomo. O projeto considera:
- fluxos mediados por atendentes ou membros da entidade
- registros administrativos feitos pela diretoria ou equipe
- transações e reservas realizadas em atendimento presencial, com posterior validação e registro no sistema
- adoção gradual da solução

Essa diretriz é importante e não deve ser removida do texto.

## Posicionamento sobre pagamentos
Como o sistema poderá contemplar reserva e eventual comercialização de ingressos, foi definido que:
- o tratamento direto de dados financeiros sensíveis não será feito pelo sistema
- a arquitetura poderá prever integração com gateways de pagamento terceirizados
- isso deve ser tratado de forma arquitetural e acadêmica, não comercial
- o texto não deve amarrar a solução a um provedor específico como Mercado Pago
- a ideia central é usar provedores externos para reduzir complexidade e aumentar segurança

## Arquitetura do sistema
A proposta arquitetural definida até o momento é:
- backend com API REST
- Arquitetura Hexagonal (Ports and Adapters)
- princípios da Clean Architecture
- foco em domínio e casos de uso
- baixo acoplamento
- separação entre interface, aplicação, domínio e infraestrutura

Estrutura conceitual do backend:
- camada de aplicação (casos de uso)
- camada de domínio
- ports (interfaces)
- adapters (implementações)
- possibilidade de integração com serviços externos na infraestrutura

## Tom e estilo do documento
O texto deve manter:
- linguagem acadêmica
- clareza
- objetividade
- boa densidade conceitual
- tom formal, mas não artificial
- equilíbrio entre fundamentação e praticidade

Evitar:
- linguagem comercial
- tom de propaganda
- promessas exageradas
- detalhamento técnico excessivo
- informalidade
- repetições desnecessárias
- uso de termos pejorativos ao falar do público mais velho

Preferir:
- “pessoas idosas”
- “usuários com menor familiaridade digital”
- “adoção gradual”
- “fluxos mediados pela entidade”
- “entidade parceira”
- “ecossistema digital”
- “solução proposta”
- “sistema proposto”

## Decisões importantes já tomadas
- o título já foi definido
- o foco não é o MTG central, mas as entidades
- o foco do MVP são bailes e fandangos
- o sistema é web + mobile
- o parceiro é o CPF Pia do Sul
- a metodologia é aplicada, qualitativa, com pesquisa bibliográfica e estudo de caso
- o pré-projeto já está com estrutura montada e não deve ser radicalmente reescrito
- o texto não deve ficar raso nem genérico
- o texto deve preservar a densidade e o contexto já construídos

## Estrutura atual do pré-projeto
1. Introdução  
1.1 Problema de pesquisa  
1.2 Justificativa  
1.3 Objetivos  
2. Referencial teórico  
2.1 Entidades tradicionalistas e organizações do terceiro setor  
2.2 Gestão administrativa em entidades culturais e associativas  
2.3 Sistemas de informação como suporte à gestão organizacional  
2.4 Ecossistemas digitais e plataformas integradas  
2.5 Transformação digital em organizações culturais tradicionais  
3. Metodologia  
3.1 Delimitação do estudo e campo de aplicação  
3.2 Coleta de dados e instrumentos  
3.3 Metodologia de desenvolvimento de software  
3.4 Procedimentos de avaliação e testes  
3.5 Arquitetura proposta do ecossistema digital  
4. Resultados parciais e esperados  
5. Referências bibliográficas

## Referências já utilizadas e importantes
- MTG, 2023
- Savaris, 2022
- Uliana, 2019
- Fabricio et al., 2019
- Martini, 2019
- Jardim, 2022
- Silva e Albarello, 2024
- Laudon e Laudon, 2014

## Instruções para revisão e edição
Ao revisar ou reescrever trechos deste pré-projeto:
1. preservar a coerência com o escopo já definido
2. não retirar o foco em bailes e fandangos
3. não transformar o trabalho em análise genérica de gestão
4. não ignorar a heterogeneidade do público atendido
5. não remover o parceiro do estudo de caso
6. não substituir a proposta arquitetural por outra abordagem
7. não simplificar em excesso o texto a ponto de ficar raso
8. melhorar clareza, coesão e formalidade sem descaracterizar o conteúdo já construído