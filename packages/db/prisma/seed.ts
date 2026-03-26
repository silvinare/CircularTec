import { PrismaClient, UnitType } from '@prisma/client';

const prisma = new PrismaClient();

const DEMO = {
  users: {
    admin: {
      id: '11111111-1111-1111-1111-111111111111',
      email: 'admin@circulartec.local',
      fullName: 'Admin Municipio'
    },
    generator: {
      id: '22222222-2222-2222-2222-222222222222',
      email: 'generador@circulartec.local',
      fullName: 'Operador Generador'
    },
    collector: {
      id: '33333333-3333-3333-3333-333333333333',
      email: 'recolector@circulartec.local',
      fullName: 'Operador Recolector'
    }
  },
  orgs: {
    municipio: {
      id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      legalName: 'Municipio Demo CircularTec',
      displayName: 'Municipio Demo'
    },
    generador: {
      id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
      legalName: 'Generador Demo SA',
      displayName: 'Generador Demo'
    },
    recolector: {
      id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
      legalName: 'Cooperativa Recolectora Demo',
      displayName: 'Recolector Demo'
    }
  }
} as const;

async function main() {
  await prisma.user.upsert({
    where: { email: DEMO.users.admin.email },
    update: {
      fullName: DEMO.users.admin.fullName
    },
    create: {
      id: DEMO.users.admin.id,
      email: DEMO.users.admin.email,
      passwordHash: 'demo-not-used',
      fullName: DEMO.users.admin.fullName
    }
  });

  await prisma.user.upsert({
    where: { email: DEMO.users.generator.email },
    update: {
      fullName: DEMO.users.generator.fullName
    },
    create: {
      id: DEMO.users.generator.id,
      email: DEMO.users.generator.email,
      passwordHash: 'demo-not-used',
      fullName: DEMO.users.generator.fullName
    }
  });

  await prisma.user.upsert({
    where: { email: DEMO.users.collector.email },
    update: {
      fullName: DEMO.users.collector.fullName
    },
    create: {
      id: DEMO.users.collector.id,
      email: DEMO.users.collector.email,
      passwordHash: 'demo-not-used',
      fullName: DEMO.users.collector.fullName
    }
  });

  await prisma.organization.upsert({
    where: { id: DEMO.orgs.municipio.id },
    update: {
      legalName: DEMO.orgs.municipio.legalName,
      displayName: DEMO.orgs.municipio.displayName,
      type: 'MUNICIPIO',
      address: 'Direccion demo municipio'
    },
    create: {
      id: DEMO.orgs.municipio.id,
      type: 'MUNICIPIO',
      legalName: DEMO.orgs.municipio.legalName,
      displayName: DEMO.orgs.municipio.displayName,
      address: 'Direccion demo municipio'
    }
  });

  await prisma.organization.upsert({
    where: { id: DEMO.orgs.generador.id },
    update: {
      legalName: DEMO.orgs.generador.legalName,
      displayName: DEMO.orgs.generador.displayName,
      type: 'GENERADOR',
      address: 'Direccion demo generador'
    },
    create: {
      id: DEMO.orgs.generador.id,
      type: 'GENERADOR',
      legalName: DEMO.orgs.generador.legalName,
      displayName: DEMO.orgs.generador.displayName,
      address: 'Direccion demo generador'
    }
  });

  await prisma.organization.upsert({
    where: { id: DEMO.orgs.recolector.id },
    update: {
      legalName: DEMO.orgs.recolector.legalName,
      displayName: DEMO.orgs.recolector.displayName,
      type: 'RECOLECTOR',
      address: 'Direccion demo recolector'
    },
    create: {
      id: DEMO.orgs.recolector.id,
      type: 'RECOLECTOR',
      legalName: DEMO.orgs.recolector.legalName,
      displayName: DEMO.orgs.recolector.displayName,
      address: 'Direccion demo recolector'
    }
  });

  await prisma.organizationMember.upsert({
    where: {
      organizationId_userId: {
        organizationId: DEMO.orgs.municipio.id,
        userId: DEMO.users.admin.id
      }
    },
    update: { role: 'ADMIN_MUNICIPIO' },
    create: {
      organizationId: DEMO.orgs.municipio.id,
      userId: DEMO.users.admin.id,
      role: 'ADMIN_MUNICIPIO'
    }
  });

  await prisma.organizationMember.upsert({
    where: {
      organizationId_userId: {
        organizationId: DEMO.orgs.generador.id,
        userId: DEMO.users.generator.id
      }
    },
    update: { role: 'OPERADOR_GENERADOR' },
    create: {
      organizationId: DEMO.orgs.generador.id,
      userId: DEMO.users.generator.id,
      role: 'OPERADOR_GENERADOR'
    }
  });

  await prisma.organizationMember.upsert({
    where: {
      organizationId_userId: {
        organizationId: DEMO.orgs.recolector.id,
        userId: DEMO.users.collector.id
      }
    },
    update: { role: 'OPERADOR_RECOLECTOR' },
    create: {
      organizationId: DEMO.orgs.recolector.id,
      userId: DEMO.users.collector.id,
      role: 'OPERADOR_RECOLECTOR'
    }
  });

  const wasteTypes = [
    { code: 'PET', name: 'PET post-consumo', unit: UnitType.KG },
    { code: 'PEBD_FILM', name: 'Film plastico PEBD', unit: UnitType.KG },
    { code: 'PLASTIC_SCRAP', name: 'Scrap plastico industrial', unit: UnitType.KG }
  ];

  for (const wasteType of wasteTypes) {
    await prisma.wasteType.upsert({
      where: { code: wasteType.code },
      update: { name: wasteType.name, unit: wasteType.unit, active: true },
      create: wasteType
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
