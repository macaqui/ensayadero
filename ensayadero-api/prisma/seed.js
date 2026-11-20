// Los tres instrumentos del ensayadero

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const instrumentos = [
  { nombre: 'Batería' },
  { nombre: 'Guitarra eléctrica' },
  { nombre: 'Teclado' }
];

async function sembrar() {
  for (let indice = 0; indice < instrumentos.length; indice++) {
    const instrumento = instrumentos[indice];

    await prisma.instrumento.upsert({
      where: { nombre: instrumento.nombre },
      update: {},
      create: instrumento
    });
  }

  await prisma.$disconnect();
  console.log('Listo: 3 instrumentos en la base de datos');
}

sembrar().catch(function (error) {
  console.error('No se pudo sembrar:', error);
  process.exitCode = 1;
});
