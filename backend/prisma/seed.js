"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Iniciando seed da Cookie Factory...\n');
    const tenant1 = await prisma.tenant.upsert({
        where: { cnpj: '11.111.111/0001-11' },
        update: {},
        create: {
            name: 'Padaria do João',
            cnpj: '11.111.111/0001-11',
            address: 'Rua das Flores, 100 - São Paulo/SP',
        },
    });
    console.log(`✅ Tenant criado: ${tenant1.name} (id: ${tenant1.id})`);
    const tenant2 = await prisma.tenant.upsert({
        where: { cnpj: '22.222.222/0001-22' },
        update: {},
        create: {
            name: 'Confeitaria da Maria',
            cnpj: '22.222.222/0001-22',
            address: 'Av. Brasil, 500 - Rio de Janeiro/RJ',
        },
    });
    console.log(`✅ Tenant criado: ${tenant2.name} (id: ${tenant2.id})`);
    const passwordHash = await bcrypt.hash('senha123', 10);
    const user1 = await prisma.user.upsert({
        where: { tenantId_email: { tenantId: tenant1.id, email: 'admin@padaria.com' } },
        update: {},
        create: {
            tenantId: tenant1.id,
            name: 'João Admin',
            email: 'admin@padaria.com',
            passwordHash,
        },
    });
    console.log(`✅ Usuário criado: ${user1.name} (tenant: ${tenant1.name})`);
    const user2 = await prisma.user.upsert({
        where: { tenantId_email: { tenantId: tenant2.id, email: 'admin@confeitaria.com' } },
        update: {},
        create: {
            tenantId: tenant2.id,
            name: 'Maria Admin',
            email: 'admin@confeitaria.com',
            passwordHash,
        },
    });
    console.log(`✅ Usuário criado: ${user2.name} (tenant: ${tenant2.name})`);
    const products1 = [
        { name: 'Pão Francês', sku: 'PAD-001', description: 'Pão francês tradicional' },
        { name: 'Croissant', sku: 'PAD-002', description: 'Croissant de manteiga' },
        { name: 'Bolo de Chocolate', sku: 'PAD-003', description: 'Bolo de chocolate 1kg' },
    ];
    for (const p of products1) {
        await prisma.product.upsert({
            where: { tenantId_sku: { tenantId: tenant1.id, sku: p.sku } },
            update: {},
            create: { tenantId: tenant1.id, ...p },
        });
    }
    console.log(`✅ ${products1.length} produtos criados para ${tenant1.name}`);
    const products2 = [
        { name: 'Brigadeiro Gourmet', sku: 'CONF-001', description: 'Brigadeiro belga' },
        { name: 'Bolo Red Velvet', sku: 'CONF-002', description: 'Bolo red velvet 2kg' },
    ];
    for (const p of products2) {
        await prisma.product.upsert({
            where: { tenantId_sku: { tenantId: tenant2.id, sku: p.sku } },
            update: {},
            create: { tenantId: tenant2.id, ...p },
        });
    }
    console.log(`✅ ${products2.length} produtos criados para ${tenant2.name}`);
    console.log('\n🎉 Seed concluído!');
    console.log('\n📋 Credenciais de acesso:');
    console.log('   Tenant 1: admin@padaria.com    / senha123');
    console.log('   Tenant 2: admin@confeitaria.com / senha123');
}
main()
    .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map