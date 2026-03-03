const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function exportSettings() {
    const settings = await prisma.setting.findMany();
    fs.writeFileSync('settings_export.json', JSON.stringify(settings, null, 2));
    console.log('Exported', settings.length, 'settings to settings_export.json');
    await prisma.$disconnect();
}

exportSettings().catch(e => {
    console.error(e);
    prisma.$disconnect();
});
