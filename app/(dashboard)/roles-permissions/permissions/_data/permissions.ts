import { faker } from '@faker-js/faker'

export const permissions: RolePermRes.Permission[] = [
  {
    id: 1,
    name: 'superadmin dkfajhjdfh dfhakfhlsh',
    desc: 'Full system/root access; can configure, modify, and override all permissions and resources.',
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    slug: faker.airline.seat(),
  },
  {
    id: 2,
    name: 'admin',
    desc: 'Administrative privileges; can manage user accounts, system configs, and operational workflows.',
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    slug: faker.airline.seat(),
  },
  {
    id: 3,
    name: 'manager',
    desc: 'Team and process management; grants access to analytics, reporting, and team resource assignments.',
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    slug: faker.airline.seat(),
  },
  {
    id: 4,
    name: 'cashier',
    desc: 'Transactional access; permission to execute and log POS transactions and basic customer data operations.',
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    slug: faker.airline.seat(),
  },
  {
    id: 5,
    name: 'abc',
    desc: 'Transactional access; permission to execute and log POS transactions and basic customer data operations.',
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    slug: faker.airline.seat(),
  },
]
