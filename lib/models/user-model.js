import { q, adminClient, getClient } from '../faunadb'

export class UserModel {
  async createUser(email, issuer) {
    /* Step 4.3: Create a user in FaunaDB */
    return adminClient.query(q.Create(q.Collection("users"), {
      /**
       * FaunaDB has built-in password-based authentication. Because we rely on
       * the DID token to authenticate users, we just need a unique string to be
       * the user's "password". In our case, we use the DID token `issuer` field.
       */
      credentials: { password: issuer },
      data: { email },
    }))
  }

  async getUserByEmail(email) {
    /* Step 4.3: Get a user by their email in FaunaDB */
    return adminClient.query(
      q.Get(q.Match(q.Index("users_by_email"), email))
    ).catch(() => undefined)
  }

  async obtainFaunaDBToken(user, issuer) {
    /* Step 4.3: Obtain a FaunaDB access token for the user */
    return adminClient.query(
      q.Login(q.Select("ref", user), { password: issuer })
    ).then(res => res?.secret).catch(() => undefined)
  }

  async invalidateFaunaDBToken(token) {
    /* Step 4.3: Invalidate a FaunaDB access token for the user */
    await getClient(token).query(q.Logout(true))
  }
}
