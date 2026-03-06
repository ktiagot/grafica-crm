// Script para gerar hash de senha
const bcrypt = require('bcrypt');

const senha = process.argv[2] || 'admin123';

bcrypt.hash(senha, 10, (err, hash) => {
    if (err) {
        console.error('Erro ao gerar hash:', err);
        return;
    }
    console.log('Senha:', senha);
    console.log('Hash:', hash);
    console.log('\nUse este hash no SQL:');
    console.log(`UPDATE usuarios SET senha = '${hash}' WHERE email = 'admin@grafica.com';`);
});
