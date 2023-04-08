import { FastifyInstance } from 'fastify'
import { randomUUID } from 'crypto'
import { z } from 'zod'
import { knex } from '../database'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

export async function userRoutes(app: FastifyInstance) {
   app.addHook('preHandler', checkSessionIdExists)

   app.post('/', async (req, reply) => {
      const createUserBodySchema = z.object({
         name: z.string()
      })

      const { name } = createUserBodySchema.parse(req.body)

      let sessionId = req.cookies.sessionId
      if(!sessionId) {
         sessionId = randomUUID()
         reply.cookie('sessionId', sessionId, {
            path: '/',
            maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
         })
      }

      await knex('users')
         .insert({
            id: randomUUID(),
            name,
            session_id: sessionId
         })

      return reply.status(201).send()
   })
}
