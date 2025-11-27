declare namespace UserReq {
  interface SingUpWithEmail {
    email: string
    password: string
    name: string
    image?: string
    callbackURL?: string
  }
  interface SingInWithEmail {
    email: string
    password: string
    callbackURL?: string
  }
}
