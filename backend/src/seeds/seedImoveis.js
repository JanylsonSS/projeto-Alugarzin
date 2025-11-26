import sequelize from "../database/connection.js";
import Usuario from "../models/Usuario.js";
import Imovel from "../models/Imovel.js";

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('DB connected.');

    // Ensure models are synced (in dev it's already alter:true in server)
    await Usuario.sync();
    await Imovel.sync();

    // Create or find demo user
    const demoEmail = 'demo@alugarzin.local';
    let user = await Usuario.findOne({ where: { email: demoEmail } });
    if (!user) {
      const senha = 'senha123';
      const senha_hash = await Usuario.criptografarSenha(senha);
      user = await Usuario.create({
        nome: 'Usuário Demo',
        email: demoEmail,
        senha_hash,
        telefone: '11999999999',
        cidade: 'São Paulo',
        estado: 'SP',
        foto_perfil: '/uploads/perfis/default.png'
      });
      console.log('Demo user created:', demoEmail, 'senha:', senha);
    } else {
      console.log('Demo user exists:', demoEmail);
    }

    // Sample properties to insert
    const sample = [
      {
        usuario_id: user.id,
        titulo: 'Casa aconchegante no bairro Jardim',
        descricao: 'Casa com 2 quartos, sala, cozinha e quintal.',
        preco: 1200,
        periodo: 'mensal',
        cep: '01234-000',
        rua: 'Rua das Flores',
        numero: '123',
        bairro: 'Jardim',
        cidade: 'São Paulo',
        estado: 'SP',
        tipolocal: 'Casa',
        tipoanuncio: 'Aluguel',
        quartos: '2',
        banheiros: '1',
        vagas: '1',
        comodidades: ['Mobiliado','Wi-Fi'],
        imagens: ['/frontend/image/imovel1.jpg','/frontend/image/imovel2.jpg'],
        imagem_url: '/frontend/image/imovel1.jpg'
      },
      {
        usuario_id: user.id,
        titulo: 'Apartamento próximo ao centro',
        descricao: 'Apartamento de 1 quarto, ideal para estudante.',
        preco: 900,
        periodo: 'mensal',
        cep: '20000-000',
        rua: 'Avenida Central',
        numero: '45',
        bairro: 'Centro',
        cidade: 'Rio de Janeiro',
        estado: 'RJ',
        tipolocal: 'Apartamento',
        tipoanuncio: 'Aluguel',
        quartos: '1',
        banheiros: '1',
        vagas: '0',
        comodidades: ['Aceita pets'],
        imagens: ['/frontend/image/imovel3.jpg'],
        imagem_url: '/frontend/image/imovel3.jpg'
      }
    ];

    for (const item of sample) {
      // avoid duplicates by title + usuario
      const exists = await Imovel.findOne({ where: { titulo: item.titulo, usuario_id: user.id } });
      if (!exists) {
        await Imovel.create(item);
        console.log('Inserted imovel:', item.titulo);
      } else {
        console.log('Imovel already exists:', item.titulo);
      }
    }

    console.log('Seeding finished.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();
