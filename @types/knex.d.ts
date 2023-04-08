// eslint-disable-next-line
import { Knex } from 'knex'

declare module 'knex/types/tables' {
   export interface Tables {
      users: {
         id: string
         sessionId?: string
         created_at: string
      },

      meals: {
         id: string
         user_id: string
         name: string
         description?: string
         on_diet: boolean
         created_at: string
         updated_at: string
      }
   }
}
