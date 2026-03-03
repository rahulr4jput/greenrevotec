const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function importSettings() {
    const data = JSON.parse(fs.readFileSync('settings_export.json', 'utf8'));
    let count = 0;
    for (const s of data) {
        await prisma.setting.upsert({
            where: { key: s.key },
            update: { value: s.value },
            create: { key: s.key, value: s.value }
        });
        count++;
        console.log('Imported:', s.key);
    }
    console.log('\nDone! Imported', count, 'settings into production DB.');
    await prisma.$disconnect();
}

importSettings().catch(e => {
    console.error(e);
    prisma.$disconnect();
});
