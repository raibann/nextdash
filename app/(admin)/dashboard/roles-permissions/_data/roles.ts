import { faker } from '@faker-js/faker'

export const roles: RolePermRes.Role[] = [
  {
    id: 1,
    name: 'superadmin',
    desc: 'Full system/root access; can configure, modify, and override all permissions and resources.',
    icon: 'activity',
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  },
  {
    id: 2,
    name: 'admin',
    desc: 'Administrative privileges; can manage user accounts, system configs, and operational workflows.',
    icon: 'activity',
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  },
  {
    id: 2,
    name: 'manager',
    desc: 'Team and process management; grants access to analytics, reporting, and team resource assignments.',
    icon: 'activity',
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  },
  {
    id: 4,
    name: 'cashier',
    desc: 'Transactional access; permission to execute and log POS transactions and basic customer data operations.',
    icon: 'activity',
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  },
]
