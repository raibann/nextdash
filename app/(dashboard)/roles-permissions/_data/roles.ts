import { faker } from '@faker-js/faker'

// Set a fixed seed for consistent data generation
faker.seed(12345)

export const roles = Array.from({ length: 50 }, () => {
  const roleNames = [
    'Administrator',
    'Editor',
    'Viewer',
    'Moderator',
    'Contributor',
    'Manager',
    'Support',
    'Developer',
    'Designer',
    'Tester',
  ]

  return {
    id: `ROLE-${faker.number.int({ min: 1000, max: 9999 })}`,
    name: faker.helpers.arrayElement(roleNames),
    desc: faker.lorem.sentence({ min: 5, max: 12 }),
    icon: faker.helpers.arrayElement([
      'shield',
      'edit',
      'eye',
      'gavel',
      'plus-circle',
      'user-cog',
      'life-ring',
      'code',
      'paintbrush',
      'check-circle',
    ]),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  }
})
