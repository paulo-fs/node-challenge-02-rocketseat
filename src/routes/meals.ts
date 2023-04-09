import { FastifyInstance } from 'fastify'
import { randomUUID } from 'crypto'
import { z } from 'zod'
import { knex } from '../database'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'
import { formateDateToIso } from '../helpers/formatDateToIso'

export async function mealsRoutes(app: FastifyInstance) {
   app.addHook('preHandler', checkSessionIdExists)

   app.get('/', async (req, reply) => {
      const { sessionId } = req.cookies

      const user = await knex('users')
         .select('id').where('session_id', sessionId).first()

      const mealsFound = await knex('meals').select('*').where('user_id', user.id)

      reply.status(200).send(mealsFound)
   })

   app.post('/', async (req, reply) => {
      const createMealsBodySchema = z.object({
         name: z.string(),
         description: z.string().nullable(),
         on_diet: z.boolean(),
         date: z.string(),
         time: z.string()
      })

      const { name, description, on_diet, date, time }  = createMealsBodySchema.parse(req.body)

      const sessionId = req.cookies.sessionId
      if (!sessionId) {
         return reply.status(401).send({ error: 'Unauthorized.' })
      }

      const user = await knex('users')
         .select('id').where('session_id', sessionId).first()

      if (!user) {
         return reply.status(404).send({ error: 'User not found.' })
      }

      const formatedDate = formateDateToIso(date, time)
      console.log(formatedDate)

      await knex('meals')
         .insert({
            id: randomUUID(),
            user_id: user.id,
            name,
            description,
            on_diet,
            created_at: formatedDate
         })

      return reply.status(201).send()
   })

   app.put('/:id', async (req, reply) => {
      const createMealsBodySchema = z.object({
         name: z.string().nullable(),
         description: z.string().nullable(),
         on_diet: z.boolean().nullable(),
         date: z.string().nullable(),
         time: z.string().nullable()
      })

      const { name, description, on_diet, date, time }  = createMealsBodySchema.parse(req.body)

   })
}
