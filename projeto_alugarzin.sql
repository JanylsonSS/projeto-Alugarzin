-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 01-Dez-2025 às 18:20
-- Versão do servidor: 10.4.32-MariaDB
-- versão do PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `projeto_alugarzin`
--

-- --------------------------------------------------------

--
-- Estrutura da tabela `favoritos`
--

CREATE TABLE `favoritos` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `imovel_id` int(11) NOT NULL,
  `data_cadastro` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `favoritos`
--

INSERT INTO `favoritos` (`id`, `usuario_id`, `imovel_id`, `data_cadastro`) VALUES
(3, 12, 14, '2025-11-27 19:58:04'),
(5, 10, 15, '2025-11-27 21:53:30');

-- --------------------------------------------------------

--
-- Estrutura da tabela `imoveis`
--

CREATE TABLE `imoveis` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `titulo` varchar(100) DEFAULT NULL,
  `descricao` text DEFAULT NULL,
  `preco` float NOT NULL,
  `periodo` varchar(20) DEFAULT NULL,
  `cep` varchar(20) DEFAULT NULL,
  `rua` varchar(255) DEFAULT NULL,
  `numero` varchar(50) DEFAULT NULL,
  `bairro` varchar(255) DEFAULT NULL,
  `cidade` varchar(80) DEFAULT NULL,
  `estado` varchar(100) DEFAULT NULL,
  `tipolocal` varchar(50) DEFAULT NULL,
  `tipoanuncio` varchar(50) DEFAULT NULL,
  `quartos` varchar(10) DEFAULT NULL,
  `banheiros` varchar(10) DEFAULT NULL,
  `vagas` varchar(10) DEFAULT NULL,
  `comodidades` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`comodidades`)),
  `imagens` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`imagens`)),
  `imagem_url` varchar(255) DEFAULT NULL,
  `data_cadastro` datetime DEFAULT NULL,
  `mobiliado` tinyint(1) NOT NULL DEFAULT 0,
  `piscina` tinyint(1) NOT NULL DEFAULT 0,
  `area_gourmet` tinyint(1) NOT NULL DEFAULT 0,
  `ar_condicionado` tinyint(1) NOT NULL DEFAULT 0,
  `wifi` tinyint(1) NOT NULL DEFAULT 0,
  `aceita_pets` tinyint(1) NOT NULL DEFAULT 0,
  `varanda` tinyint(1) NOT NULL DEFAULT 0,
  `portaria_24h` tinyint(1) NOT NULL DEFAULT 0,
  `garagem` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `imoveis`
--

INSERT INTO `imoveis` (`id`, `usuario_id`, `titulo`, `descricao`, `preco`, `periodo`, `cep`, `rua`, `numero`, `bairro`, `cidade`, `estado`, `tipolocal`, `tipoanuncio`, `quartos`, `banheiros`, `vagas`, `comodidades`, `imagens`, `imagem_url`, `data_cadastro`, `mobiliado`, `piscina`, `area_gourmet`, `ar_condicionado`, `wifi`, `aceita_pets`, `varanda`, `portaria_24h`, `garagem`) VALUES
(14, 8, 'Apartamento Aconchegante na Aldeota', 'Ótima localização, próximo a shoppings e serviços, ideal para quem busca conforto e praticidade.', 520000, NULL, '60125-100', 'Rua Silva Paulet', '1120', 'Aldeota', 'Fortaleza', 'CE', 'Apartamento', 'Venda', '3', '2', '2', '[\"Garagem\",\"Ar Condicionado\",\"Aceita Pets\",\"Varanda\",\"Portaria 24h\"]', '[\"/uploads/imoveis/1764269605767-122172640.jpg\",\"/uploads/imoveis/1764269605770-883734490.jpg\",\"/uploads/imoveis/1764269605775-331517179.jpg\"]', '/uploads/imoveis/1764269605767-122172640.jpg', '2025-11-27 18:49:58', 0, 0, 0, 0, 0, 0, 0, 0, 0),
(15, 8, 'Kitnet reformada perto da UFC', 'Perfeita para estudantes, compacta e funcional.', 1150, 'mensal', '60415-200', 'Rua Waldery Uchôa', '520', 'Benfica', 'Fortaleza', 'CE', 'Kitnet/Conjugado', 'Aluguel', '2', '1', '0', '\"Mobiliado\"', '[\"/uploads/imoveis/1764269791807-922138733.jpg\",\"/uploads/imoveis/1764269791807-400642737.jpg\",\"/uploads/imoveis/1764269791807-541780591.jpg\"]', '/uploads/imoveis/1764269791807-922138733.jpg', '2025-11-27 18:54:47', 0, 0, 0, 0, 0, 0, 0, 0, 0),
(16, 8, 'Casa ampla no Passaré', 'Casa com quintal grande, ideal para famílias.', 350000, NULL, '60862-200', 'Rua Pedro Dantas', '90', 'Passaré', 'Fortaleza', 'CE', 'Casa', 'Venda', '4+', '3', '2', '[\"Piscina\",\"Garagem\",\"Área Gourmet\"]', '[\"/uploads/imoveis/1764269975636-762901447.jpg\",\"/uploads/imoveis/1764269975636-816698622.jpg\",\"/uploads/imoveis/1764269975637-7116565.jpg\"]', '/uploads/imoveis/1764269975636-762901447.jpg', '2025-11-27 18:59:35', 0, 1, 1, 0, 0, 0, 0, 0, 1),
(17, 9, 'Sobrado moderno no Eusébio', 'Acabamento premium, condomínio fechado com segurança 24h.', 780000, NULL, '61760-210', 'Rua das Palmeiras', '301', 'Coaçu', 'Eusébio', 'CE', 'Sobrado', 'Venda', '4+', '4+', '3', '[\"Piscina\",\"Garagem\",\"Área Gourmet\"]', '[\"/uploads/imoveis/1764270588017-300351066.jpg\",\"/uploads/imoveis/1764270588017-718880639.jpg\",\"/uploads/imoveis/1764270588019-177710396.jpg\"]', '/uploads/imoveis/1764270588017-300351066.jpg', '2025-11-27 19:05:38', 0, 0, 0, 0, 0, 0, 0, 0, 0),
(18, 9, 'Terreno amplo no Porto das Dunas', 'Excelente para construir casa de veraneio ou investimento.', 320000, NULL, '61700-000', 'Rua do Ouro', '250', 'Porto das Dunas', 'Aquiraz', 'CE', 'Terreno/Lote', 'Venda', '0', '0', '0', NULL, '[\"/uploads/imoveis/1764271003717-438250648.png\",\"/uploads/imoveis/1764271003723-670012231.jpg\",\"/uploads/imoveis/1764271003725-412376368.jpg\"]', '/uploads/imoveis/1764271003717-438250648.png', '2025-11-27 19:06:48', 0, 0, 0, 0, 0, 0, 0, 0, 0),
(19, 9, 'Casa simples e funcional', 'Ideal para quem busca economia e tranquilidade.', 850, 'mensal', '61760-150', 'Rua Projetada 5', '64', 'Tamatanduba', 'Eusébio', 'CE', 'Casa', 'Aluguel', '2', '1', '1', '[\"Garagem\",\"Aceita Pets\"]', '[\"/uploads/imoveis/1764271243158-56658602.jpg\",\"/uploads/imoveis/1764271243158-509289372.jpg\",\"/uploads/imoveis/1764271243159-248184884.jpg\"]', '/uploads/imoveis/1764271243158-56658602.jpg', '2025-11-27 19:08:30', 0, 0, 0, 0, 0, 0, 0, 0, 0),
(20, 10, 'Casa com piscina no Icaraí', 'Espaço perfeito para lazer, com piscina e área gourmet.', 450000, NULL, '61627-050', 'Rua Estrela do Mar', '889', 'Icaraí', 'Caucaia', 'CE', 'Casa', 'Venda', '3', '2', '2', '[\"Piscina\",\"Garagem\"]', '[\"/uploads/imoveis/1764271756275-402753826.jpg\",\"/uploads/imoveis/1764271756283-483755259.jpg\",\"/uploads/imoveis/1764271756284-194231054.jpg\"]', '/uploads/imoveis/1764271756275-402753826.jpg', '2025-11-27 19:25:07', 0, 0, 0, 0, 0, 0, 0, 0, 0),
(21, 10, 'Apartamento simples próximo ao centro', 'Boa opção para quem deseja morar perto de tudo.', 750, 'mensal', '61600-050', 'Rua Dom Bosco', '199', 'Centro', 'Caucaia', 'CE', 'Apartamento', 'Aluguel', '2', '1', '0', NULL, '[\"/uploads/imoveis/1764271729570-377971463.jpg\",\"/uploads/imoveis/1764271729572-692952036.jpg\",\"/uploads/imoveis/1764271729574-125192755.jpg\"]', '/uploads/imoveis/1764271729570-377971463.jpg', '2025-11-27 19:26:22', 0, 0, 0, 0, 0, 0, 0, 0, 0),
(22, 10, 'Kitnet mobiliada', 'Pronta para morar. Ideal para solteiros.', 980, 'mensal', '61635-120', 'Rua Cruzeiro', '77', 'Parque Soledade', 'Caucaia', 'CE', 'Kitnet/Conjugado', 'Aluguel', '1', '1', NULL, '[\"Mobiliado\",\"Aceita Pets\"]', '[\"/uploads/imoveis/1764271893506-924646932.jpg\",\"/uploads/imoveis/1764271893507-178823822.jpg\",\"/uploads/imoveis/1764271893508-373207762.jpg\"]', '/uploads/imoveis/1764271893506-924646932.jpg', '2025-11-27 19:31:33', 1, 0, 0, 0, 0, 1, 0, 0, 0),
(23, 11, 'Casa nova no Jaçanaú', 'Casa recém-construída, ótimo acabamento.', 155000, NULL, '61936-100', 'Rua 22', '445', 'Jaçanaú', 'Maracanaú', 'CE', 'Casa', 'Venda', '2', '1', '1', '\"Garagem\"', '[\"/uploads/imoveis/1764272157055-458794119.jpg\",\"/uploads/imoveis/1764272157056-530109389.jpg\",\"/uploads/imoveis/1764272157058-848777076.jpg\"]', '/uploads/imoveis/1764272157055-458794119.jpg', '2025-11-27 19:35:57', 0, 0, 0, 0, 0, 0, 0, 0, 0),
(24, 11, 'Consultório pronto pra uso', 'Perfeito para dentistas ou psicólogos.', 1900, 'mensal', '61910-005', 'Rua João de Almeida', '55', 'Pajuçara', 'Maracanaú', 'CE', 'Consultório', 'Aluguel', '3', '1', '1', '[\"Mobiliado\",\"Garagem\",\"Ar Condicionado\"]', '[\"/uploads/imoveis/1764272343999-572221494.jpg\",\"/uploads/imoveis/1764272344000-77429813.jpg\",\"/uploads/imoveis/1764272344002-988325058.jpg\"]', '/uploads/imoveis/1764272343999-572221494.jpg', '2025-11-27 19:38:49', 0, 0, 0, 0, 0, 0, 0, 0, 0),
(25, 11, 'Apartamento com vista livre', 'Condomínio tranquilo, ideal para famílias.', 185000, NULL, '61914-200', 'Rua Humberto Monte', '890', 'Parque Luzia', 'Maracanaú', 'CE', 'Apartamento', 'Venda', '2', '1', '1', '\"Garagem\"', '[\"/uploads/imoveis/1764272507146-594292338.jpg\",\"/uploads/imoveis/1764272507147-634629819.jpg\",\"/uploads/imoveis/1764272507147-808965320.jpg\"]', '/uploads/imoveis/1764272507146-594292338.jpg', '2025-11-27 19:41:47', 0, 0, 0, 0, 0, 0, 0, 0, 1),
(26, 12, 'Chácara para lazer em Maranguape', 'Perfeita para finais de semana com a família.\r\n', 260000, NULL, '61940-000', 'Sitio Boa Água', '12', 'Zona Rural', 'Maranguape', 'CE', 'Chácara/Sítio', 'Venda', '3', '2', '4+', '[\"Piscina\",\"Garagem\",\"Área Gourmet\"]', '[\"/uploads/imoveis/1764272879205-264769475.jpg\",\"/uploads/imoveis/1764272879214-215699396.jpg\",\"/uploads/imoveis/1764272879216-695055577.jpg\"]', '/uploads/imoveis/1764272879205-264769475.jpg', '2025-11-27 19:44:26', 0, 0, 0, 0, 0, 0, 0, 0, 0),
(27, 12, 'Casa compacta no Carlito Pamplona', 'Excelente opção para quem busca economia.', 110000, NULL, '60311-090', 'Rua Padre Cícero', '300', 'Carlito Pamplona', 'Fortaleza', 'CE', 'Casa', 'Venda', '2', '1', '0', NULL, '[\"/uploads/imoveis/1764272985729-905140564.jpg\",\"/uploads/imoveis/1764272985730-873411839.jpg\",\"/uploads/imoveis/1764272985732-640345408.jpg\"]', '/uploads/imoveis/1764272985729-905140564.jpg', '2025-11-27 19:45:19', 0, 0, 0, 0, 0, 0, 0, 0, 0),
(28, 12, 'Apartamento mobiliado na Varjota', 'Completo, perto de restaurantes e bares.', 2300, 'mensal', '60170-250', 'Rua Ana Bilhar', '1205', 'Varjota', 'Fortaleza', 'CE', 'Apartamento', 'Aluguel', '2', '2', '1', '[\"Mobiliado\",\"Garagem\",\"Aceita Pets\"]', '[\"/uploads/imoveis/1764273414672-282302046.jpg\",\"/uploads/imoveis/1764273414672-881214623.jpg\",\"/uploads/imoveis/1764273414673-650013216.jpg\"]', '/uploads/imoveis/1764273414672-282302046.jpg', '2025-11-27 19:46:55', 1, 0, 0, 0, 0, 1, 0, 0, 1),
(29, 10, 'Casa aconchegante ', 'Casa para criar seu fi', 500, 'mensal', '63610000', 'Francisco Xavier', '67', 'Beira Rio', 'Mombaça', 'CE', 'Casa', 'Aluguel', '1', '1', NULL, '\"Aceita Pets\"', '[\"/uploads/imoveis/1764280525787-86470261.jpg\",\"/uploads/imoveis/1764280525789-502244914.jpg\",\"/uploads/imoveis/1764280525793-843572528.jpg\"]', '/uploads/imoveis/1764280525787-86470261.jpg', '2025-11-27 21:55:25', 0, 0, 0, 0, 0, 1, 0, 0, 0);

-- --------------------------------------------------------

--
-- Estrutura da tabela `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `nome` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `senha_hash` varchar(255) NOT NULL,
  `telefone` varchar(20) DEFAULT NULL,
  `data_cadastro` datetime DEFAULT NULL,
  `foto_perfil` varchar(255) DEFAULT NULL,
  `cep` varchar(20) DEFAULT NULL,
  `rua` varchar(255) DEFAULT NULL,
  `numero` varchar(50) DEFAULT NULL,
  `bairro` varchar(255) DEFAULT NULL,
  `cidade` varchar(100) DEFAULT NULL,
  `estado` varchar(100) DEFAULT NULL,
  `whatsapp_link` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Extraindo dados da tabela `usuarios`
--

INSERT INTO `usuarios` (`id`, `nome`, `email`, `senha_hash`, `telefone`, `data_cadastro`, `foto_perfil`, `cep`, `rua`, `numero`, `bairro`, `cidade`, `estado`, `whatsapp_link`) VALUES
(8, 'Mariana Albuquerque Costa', 'mariana.costa@example.com', '$2b$10$.qnmpcmFUDMp3I2oUAXdTeGTs8r21AH70.vmZGDvc0LtZFYs2LrNi', '(85) 99734-5521', '2025-11-27 18:41:03', '/uploads/perfis/1764269199130-795569664.jpg', '60810-145', NULL, NULL, NULL, 'Fortaleza', 'CE', ''),
(9, 'Lucas Ferreira Diniz', 'lucas.diniz@example.com', '$2b$10$dBuuep6oq4qc10IdnVVB6uJcwPxH34S7u1992dfsh5ffVuKUMBeRG', '(85) 98822-1980', '2025-11-27 19:00:53', '/uploads/perfis/1764270133555-81060382.jpg', '61760-000', NULL, NULL, NULL, 'Eusébio', 'CE', ''),
(10, 'Ana Vitória Monteiro', 'ana.vitoria@example.com', '$2b$10$k7GZ6u3BZO.Cg36ftj1iMuxhMvfi0RcI39rLzJwJ388jhaW3gM4qy', '(85) 99640-0072', '2025-11-27 19:21:16', '/uploads/perfis/1764271341205-184179851.jpg', '61609-180', NULL, NULL, NULL, 'Caucaia', 'CE', ''),
(11, 'Pedro Henrique Bezerra', 'pedro.bezerra@example.com', '$2b$10$jM8WOYyp4.jmkGSjbYXfUuFnJpODWCoL6lRoVbv3PUYvpYjFzJRX2', '(85) 99112-7855', '2025-11-27 19:32:02', '/uploads/perfis/1764271991084-182954354.jpg', '61939-020', NULL, NULL, NULL, 'Maracanaú', 'CE', ''),
(12, 'Sofia Martins Braga', 'sofia.braga@example.com', '$2b$10$9VeVRJLRMFJHOC0gWmoXTOfJgyZM4kHw9tR2snZj/Nk2t95xFw14a', '(85) 98770-4112', '2025-11-27 19:42:13', '/uploads/perfis/1764272576304-848475302.jpg', '60510-330', NULL, NULL, NULL, 'Fortaleza', 'CE', '');

--
-- Índices para tabelas despejadas
--

--
-- Índices para tabela `favoritos`
--
ALTER TABLE `favoritos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `favoritos_imovel_id_usuario_id_unique` (`usuario_id`,`imovel_id`),
  ADD KEY `imovel_id` (`imovel_id`);

--
-- Índices para tabela `imoveis`
--
ALTER TABLE `imoveis`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`);

--
-- Índices para tabela `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `email_2` (`email`),
  ADD UNIQUE KEY `email_3` (`email`),
  ADD UNIQUE KEY `email_4` (`email`),
  ADD UNIQUE KEY `email_5` (`email`),
  ADD UNIQUE KEY `email_6` (`email`),
  ADD UNIQUE KEY `email_7` (`email`),
  ADD UNIQUE KEY `email_8` (`email`),
  ADD UNIQUE KEY `email_9` (`email`),
  ADD UNIQUE KEY `email_10` (`email`),
  ADD UNIQUE KEY `email_11` (`email`),
  ADD UNIQUE KEY `email_12` (`email`),
  ADD UNIQUE KEY `email_13` (`email`),
  ADD UNIQUE KEY `email_14` (`email`),
  ADD UNIQUE KEY `email_15` (`email`),
  ADD UNIQUE KEY `email_16` (`email`),
  ADD UNIQUE KEY `email_17` (`email`),
  ADD UNIQUE KEY `email_18` (`email`),
  ADD UNIQUE KEY `email_19` (`email`),
  ADD UNIQUE KEY `email_20` (`email`),
  ADD UNIQUE KEY `email_21` (`email`),
  ADD UNIQUE KEY `email_22` (`email`),
  ADD UNIQUE KEY `email_23` (`email`),
  ADD UNIQUE KEY `email_24` (`email`),
  ADD UNIQUE KEY `email_25` (`email`),
  ADD UNIQUE KEY `email_26` (`email`),
  ADD UNIQUE KEY `email_27` (`email`),
  ADD UNIQUE KEY `email_28` (`email`),
  ADD UNIQUE KEY `email_29` (`email`),
  ADD UNIQUE KEY `email_30` (`email`),
  ADD UNIQUE KEY `email_31` (`email`),
  ADD UNIQUE KEY `email_32` (`email`),
  ADD UNIQUE KEY `email_33` (`email`),
  ADD UNIQUE KEY `email_34` (`email`),
  ADD UNIQUE KEY `email_35` (`email`);

--
-- AUTO_INCREMENT de tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `favoritos`
--
ALTER TABLE `favoritos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de tabela `imoveis`
--
ALTER TABLE `imoveis`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT de tabela `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- Restrições para despejos de tabelas
--

--
-- Limitadores para a tabela `favoritos`
--
ALTER TABLE `favoritos`
  ADD CONSTRAINT `favoritos_ibfk_27` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `favoritos_ibfk_28` FOREIGN KEY (`imovel_id`) REFERENCES `imoveis` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Limitadores para a tabela `imoveis`
--
ALTER TABLE `imoveis`
  ADD CONSTRAINT `imoveis_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
