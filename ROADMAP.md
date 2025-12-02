# 📍 ROADMAP DO PROJETO -- ALUGARZIN

Este documento apresenta todas as sprints planejadas, entregues e em
desenvolvimento para o sistema Alugarzin.

------------------------------------------------------------------------

🟦 **Sprint 1 --- Autenticação (Concluída)**\
**RF-1 --- Cadastro de Usuário**\
- Formulário com validação\
- Envio ao backend\
- Hash de senha com bcrypt\
- Salvar no MySQL via Sequelize

**RF-2 --- Login com JWT**\
- Geração de token\
- Middleware de autenticação\
- Auth-Guard no front\
- Armazenamento seguro no navegador

------------------------------------------------------------------------

🟩 **Sprint 2 --- Painel do Usuário (Concluída)**\
**RF-4 --- Exibir informações do usuário logado**\
- Carregar dados via token\
- Preencher DOM dinamicamente

**RF-5 --- Upload de Fotos de Perfil**\
- Multer configurado\
- Salvamento no servidor

------------------------------------------------------------------------

🟧 **Sprint 3 --- Imóveis (Concluída)**\
**RF-3 --- Cadastro de Imóvel**\
- Upload de múltiplas imagens\
- Salvar as informações\
- Relacionamento Usuário → Imóveis

**RF-6 --- Visualização Detalhada**\
- Página dedicada\
- Exibir imagens, preço, localização e comodidades

------------------------------------------------------------------------

🟥 **Sprint 4 --- Funcionalidades Avançadas (Atual)**\
**RF-7 --- Edição e Exclusão de Anúncio**\
- Rota PUT / DELETE\
- Autorização por token\
- Atualização de imagens

**RF-8 --- Sistema de Contato**\
- Envio de mensagem\
- Salvamento no BD\
- Envio de email (opcional)

**RF-10 --- Logout Seguro**\
- Revogação local do token\
- Redirecionamento controlado\
- Bloqueio do botão voltar

------------------------------------------------------------------------

🟪 **Sprint 5 --- Favoritos e Busca (Futura)**\
**RF-11 --- Salvar Favoritos**\
**RF-12 --- Listar Favoritos**\
**RF-13 --- Busca Avançada**\
- Filtros\
- CEP\
- Comodidades

------------------------------------------------------------------------

🟫 **Sprint 6 --- Publicação e SEO (Futura)**\
**RF-14 --- Compartilhamento**\
**RF-15 --- SEO e metatags dinâmicas**

------------------------------------------------------------------------

🟫 **Sprint 7 --- Infraestrutura (Futura)**\
**RF-16 --- Deploy Back-end**\
- Railway / Render / VPS

**RF-17 --- Deploy Front-end**\
- Vercel / Netlify

**RF-18 --- Certificados SSL**

------------------------------------------------------------------------

🏁 **Finalização**\
- Documentação final\
- Apresentação\
- Demonstração funcional
