export interface EnderecoViaCep {
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
}

// ViaCEP (https://viacep.com.br) — API pública, sem chave, usada só pra pré-preencher o
// formulário; a pessoa sempre pode corrigir os campos depois. CEP não encontrado ou erro de rede
// devolve null, sem quebrar o formulário — preenchimento manual continua funcionando.
export async function buscarEnderecoPorCep(cep: string): Promise<EnderecoViaCep | null> {
  const digitos = cep.replace(/\D/g, "");
  if (digitos.length !== 8) return null;

  try {
    const resposta = await fetch(`https://viacep.com.br/ws/${digitos}/json/`);
    if (!resposta.ok) return null;
    const dados = (await resposta.json()) as EnderecoViaCep & { erro?: boolean };
    if (dados.erro) return null;
    return {
      logradouro: dados.logradouro,
      bairro: dados.bairro,
      localidade: dados.localidade,
      uf: dados.uf,
    };
  } catch {
    return null;
  }
}
