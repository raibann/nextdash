declare namespace RolePermRes {
  interface Role {
    id: number
    name: string
    desc?: string
    icon?: string
    createdAt?: string | Date
    updatedAt?: string | Date
  }

  interface Permission {
    id: number
    name: string
    desc?: string
    slug: string
    createdAt?: string | Date
    updatedAt?: string | Date
  }
}
