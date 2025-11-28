import { z } from 'zod'

// We're keeping a simple non-relational schema here.
// IRL, you will have a schema for your data models.
export const permissionSchema = z.object({
  id: z.number(),
  name: z.string(),
  desc: z.string().optional(),
})

export type Permission = z.infer<typeof permissionSchema>
