import bcrypt from "bcryptjs";

const testarBcrypt = async () => {
  console.log("🔐 Testando Bcrypt...\n");

  const senhaOriginal = "minhaSenha123";
  
  // 1. Gerar hash
  console.log("📝 Senha original:", senhaOriginal);
  const hash1 = await bcrypt.hash(senhaOriginal, 10);
  console.log("🔒 Hash 1:", hash1);
  
  // 2. Gerar outro hash da MESMA senha
  const hash2 = await bcrypt.hash(senhaOriginal, 10);
  console.log("🔒 Hash 2:", hash2);
  
  // 3. Verificar se são diferentes
  console.log("\n✅ Hashes são diferentes?", hash1 !== hash2);
  
  // 4. Testar comparação (correto)
  const comparacao1 = await bcrypt.compare(senhaOriginal, hash1);
  console.log("✅ Senha correta válida?", comparacao1);
  
  // 5. Testar comparação (incorreto)
  const comparacao2 = await bcrypt.compare("senhaErrada", hash1);
  console.log("❌ Senha errada rejeitada?", !comparacao2);
  
  console.log("\n🎉 Bcrypt funcionando perfeitamente!");
};

testarBcrypt();

// para testar "node testarBcrypt.js"