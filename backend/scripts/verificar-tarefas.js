#!/usr/bin/env node
/*
 * Verificação automatizada de conclusão de tarefa — TCC-FINAL/avaliacao/plano-avaliacao.md §6.1.
 *
 * Consulta o banco direto (mesma convenção dos outros scripts ad-hoc desta sessão), de forma
 * objetiva e independente da autopercepção do participante, se o estado esperado da tarefa foi
 * alcançado. Não decide por si só "concluiu sozinho / com ajuda / não concluiu" — isso cruza este
 * resultado com o registro de observação do moderador (nº de intervenções). Ver roteiro-sessao.md
 * para quando rodar cada comando durante a sessão.
 *
 * Uso (de dentro de backend/, pra reaproveitar node_modules e .env já configurados):
 *   node scripts/verificar-tarefas.js 1 <cpf>
 *   node scripts/verificar-tarefas.js 2 <cpf> [trecho do nome do evento]
 *   node scripts/verificar-tarefas.js 3 <cpf> [competencia AAAA-MM]
 *
 * CPF pode vir com ou sem pontuação/traço (só os dígitos são usados).
 */
require('dotenv').config();
const { Client } = require('pg');

function formatarCpf(cpf) {
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

function formatarDataHora(valor) {
  return valor ? new Date(valor).toLocaleString('pt-BR') : null;
}

function imprimirAjuda() {
  console.log(`
Uso: node scripts/verificar-tarefas.js <fluxo> <cpf> [parâmetro extra]

  1 <cpf>                                Fluxo 1 — Cadastro de associado
  2 <cpf> [trecho do nome do evento]     Fluxo 2 — Compra de ingresso e check-in
  3 <cpf> [competencia AAAA-MM]          Fluxo 3 — Pagamento de mensalidade

Exemplos:
  node scripts/verificar-tarefas.js 1 91199000001
  node scripts/verificar-tarefas.js 2 911.990.000-01 "Baile da Invernada"
  node scripts/verificar-tarefas.js 3 91199000001 2026-11
`);
}

async function buscarAssociado(client, cpf) {
  const { rows } = await client.query(
    'SELECT id, nome, status, usuario_id, categoria_socio_id FROM associados WHERE cpf = $1',
    [cpf],
  );
  return rows[0] ?? null;
}

async function verificarFluxo1(client, cpf) {
  console.log(`\n=== Fluxo 1 — Cadastro de associado — CPF ${formatarCpf(cpf)} ===\n`);

  const { rows } = await client.query(
    `SELECT a.id, a.nome, a.status, a.usuario_id, a.criado_em,
            c.nome AS categoria_nome
     FROM associados a
     LEFT JOIN categorias_socio c ON c.id = a.categoria_socio_id
     WHERE a.cpf = $1`,
    [cpf],
  );

  if (rows.length === 0) {
    console.log('❌ Nenhum associado encontrado com esse CPF. Tarefa NÃO concluída.');
    return;
  }

  const a = rows[0];
  console.log(`Nome: ${a.nome}`);
  console.log(`Status: ${a.status}`);
  console.log(`Categoria de sócio: ${a.categoria_nome ?? '(nenhuma)'}`);
  console.log(`Cadastrado em: ${formatarDataHora(a.criado_em)}`);

  const statusEsperado = a.status === 'ativo' || a.status === 'pendente_validacao';
  console.log(
    statusEsperado
      ? '✅ Critério de conclusão (associado existe com status ativo ou pendente_validacao): OK'
      : `❌ Status inesperado para a tarefa: "${a.status}".`,
  );

  console.log(
    a.usuario_id
      ? '✅ Conta de login vinculada (associado concluiu auto-cadastro ou "vincular conta").'
      : 'ℹ️  Sem conta de login vinculada ainda — esperado se só a diretoria cadastrou (Fluxo 1, papel Diretoria), sem o passo do associado ter rodado.',
  );
}

async function verificarFluxo2(client, cpf, filtroEvento) {
  const associado = await buscarAssociado(client, cpf);
  console.log(
    `\n=== Fluxo 2 — Compra de ingresso e check-in — ${associado ? associado.nome : `CPF ${formatarCpf(cpf)}`} ===\n`,
  );

  if (!associado) {
    console.log('❌ Associado não encontrado com esse CPF.');
    return;
  }

  const params = [associado.id];
  let filtroSql = '';
  if (filtroEvento) {
    filtroSql = ' AND ev.nome ILIKE $2';
    params.push(`%${filtroEvento}%`);
  }

  const { rows } = await client.query(
    `SELECT i.codigo, i.status, i.usado_em, i.criado_em, i.preco, ev.nome AS evento_nome
     FROM ingressos i
     JOIN eventos ev ON ev.id = i.evento_id
     WHERE i.associado_id = $1 ${filtroSql}
     ORDER BY i.criado_em DESC
     LIMIT 5`,
    params,
  );

  if (rows.length === 0) {
    console.log(
      '❌ Nenhum ingresso encontrado para esse associado' +
        (filtroEvento ? ` no evento "${filtroEvento}"` : '') +
        '. Tarefa NÃO concluída (compra).',
    );
    return;
  }

  for (const r of rows) {
    const codigo = `#${String(r.codigo).padStart(3, '0')}`;
    const validado = r.usado_em ? ` — entrada validada em ${formatarDataHora(r.usado_em)}` : '';
    console.log(`Ingresso ${codigo} — "${r.evento_nome}" — status: ${r.status}${validado}`);
  }

  const maisRecente = rows[0];
  console.log(
    '✅ Ingresso emitido (critério da etapa do associado — comprou pelo app): OK',
  );
  console.log(
    maisRecente.status === 'usado'
      ? '✅ Entrada validada (critério da etapa da diretoria — check-in confirmado): OK'
      : 'ℹ️  Entrada ainda não validada — normal antes do passo de check-in da diretoria. Rode este comando de novo depois do check-in.',
  );
}

async function verificarFluxo3(client, cpf, competencia) {
  const associado = await buscarAssociado(client, cpf);
  console.log(
    `\n=== Fluxo 3 — Pagamento de mensalidade — ${associado ? associado.nome : `CPF ${formatarCpf(cpf)}`} ===\n`,
  );

  if (!associado) {
    console.log('❌ Associado não encontrado com esse CPF.');
    return;
  }

  const params = [associado.id];
  let filtroSql = '';
  if (competencia) {
    filtroSql = ' AND competencia = $2';
    params.push(competencia);
  }

  const { rows } = await client.query(
    `SELECT competencia, status, forma_pagamento, pago_em, valor
     FROM mensalidades
     WHERE associado_id = $1 ${filtroSql}
     ORDER BY competencia DESC
     LIMIT 6`,
    params,
  );

  if (rows.length === 0) {
    console.log(
      '❌ Nenhuma mensalidade encontrada' +
        (competencia ? ` para a competência ${competencia}` : '') +
        ' pra esse associado.',
    );
    return;
  }

  for (const r of rows) {
    const pagamento = r.pago_em
      ? ` — pago em ${formatarDataHora(r.pago_em)} (${r.forma_pagamento})`
      : '';
    console.log(`Competência ${r.competencia} — status: ${r.status}${pagamento}`);
  }

  const alvo = rows[0];
  console.log(
    alvo.status === 'paga'
      ? '✅ Mensalidade paga (critério de conclusão da tarefa): OK'
      : `❌ Mensalidade ainda com status "${alvo.status}" — tarefa NÃO concluída.`,
  );
}

async function main() {
  const [, , fluxo, cpfArg, extra] = process.argv;

  if (!fluxo || !cpfArg) {
    imprimirAjuda();
    process.exitCode = 1;
    return;
  }

  const cpf = cpfArg.replace(/\D/g, '');
  if (cpf.length !== 11) {
    console.log(`❌ CPF inválido: "${cpfArg}" (precisa ter 11 dígitos).`);
    process.exitCode = 1;
    return;
  }

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    switch (fluxo) {
      case '1':
        await verificarFluxo1(client, cpf);
        break;
      case '2':
        await verificarFluxo2(client, cpf, extra);
        break;
      case '3':
        await verificarFluxo3(client, cpf, extra);
        break;
      default:
        imprimirAjuda();
        process.exitCode = 1;
    }
  } finally {
    await client.end();
  }
}

main().catch((erro) => {
  console.error('Erro ao rodar a verificação:', erro.message);
  process.exitCode = 1;
});
