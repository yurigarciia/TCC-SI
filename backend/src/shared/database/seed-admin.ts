import 'dotenv/config';
import * as bcrypt from 'bcryptjs';
import dataSource from './data-source';

async function seedAdmin(): Promise<void> {
  const email = process.env.SEED_ADMIN_EMAIL ?? 'diretoria@piadosul.org.br';
  const senha = process.env.SEED_ADMIN_SENHA ?? 'mudar123';
  const nome = process.env.SEED_ADMIN_NOME ?? 'Diretoria';

  await dataSource.initialize();

  const existente = await dataSource.query<Array<{ id: string }>>(
    'SELECT id FROM usuarios WHERE email = $1',
    [email],
  );
  if (existente.length > 0) {
    console.log(`Usuário ${email} já existe — nada a fazer.`);
  } else {
    const senhaHash = await bcrypt.hash(senha, 10);
    await dataSource.query(
      'INSERT INTO usuarios (nome, email, senha_hash, perfil) VALUES ($1, $2, $3, $4)',
      [nome, email, senhaHash, 'administrador'],
    );
    console.log(
      `Usuário administrador ${email} criado. Senha inicial: ${senha}`,
    );
  }

  await dataSource.destroy();
}

seedAdmin().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
