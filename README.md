# Projeto Alugarzin

O **Alugarzin** é um sistema Web completo para divulgação, busca e
gerenciamento de imóveis para aluguel ou venda.\
O projeto inclui autenticação JWT, cadastro e login de usuários,
publicação de anúncios, visualização detalhada, edição e exclusão, além
de funcionalidades de contato entre interessados.

------------------------------------------------------------------------

## 🚀 Tecnologias Utilizadas

### **Frontend**

-   HTML5, CSS3, JavaScript (ES Modules)
-   Bootstrap Icons
-   Axios para requisições HTTP
-   Manipulação dinâmica de DOM
-   Autenticação no frontend via *auth-guard.js*

### **Backend**

-   Node.js + Express.js
-   JWT para autenticação
-   Bcrypt para hash de senha
-   Multer para upload de imagens
-   Sequelize (ORM)
-   MySQL (via phpMyAdmin)

### **Banco de Dados**

-   MySQL com tabelas:
    -   `usuarios`
    -   `imoveis`
    -   `imagens`
    -   `favoritos`
    -   `mensagens`

------------------------------------------------------------------------

## 📌 Funcionalidades Principais

### ✔ Cadastro e Login (JWT)

### ✔ Painel do Usuário

### ✔ Cadastro de Imóvel

### ✔ Visualização Detalhada do Imóvel

### ✔ Edição e Exclusão

### ✔ Sistema de Contato

### ✔ Logout Seguro

### ✔ Salvamento de Favoritos

------------------------------------------------------------------------

## 📂 Estrutura do Projeto

/backend\
/src\
/controllers\
/routes\
/models\
/middleware\
/frontend\
/css\
/js\
/pages

------------------------------------------------------------------------

## 🧪 Testes

Requisições podem ser testadas no Insomnia ou Postman.

------------------------------------------------------------------------

## 🛠 Como rodar o projeto

### **Backend**

``` bash
cd backend
npm install
npm start
```

### **Frontend**

O frontend roda diretamente pelo Live Server, Vite ou servidor estático.

------------------------------------------------------------------------

## 👥 Equipe do Projeto

Janylson --- Full Stack Developer (UECE)

------------------------------------------------------------------------

## 📜 Licença

Projeto acadêmico --- livre para fins de estudo.
