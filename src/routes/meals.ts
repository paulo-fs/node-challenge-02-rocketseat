import { FastifyInstance } from 'fastify'
import { randomUUID } from 'crypto'
import { z } from 'zod'
import { knex } from '../database'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'
import { formateDateToIso } from '../helpers/formatDateToIso'
import { splitDateToDateTime } from '../helpers/splitDateToDateTime'

export async function mealsRoutes(app: FastifyInstance) {
   app.addHook('preHandler', checkSessionIdExists)

   app.get('/', async (req, reply) => {
      const { sessionId } = req.cookies

      const user = await knex('users')
         .select('id').where('session_id', sessionId).first()

      const mealsFound = await knex('meals').select('*').where('user_id', user.id)

      const formatedMealsData = mealsFound.map((meal) => {
         return {
            id: meal.id,
            name: meal.name,
            description: meal.description,
            on_diet: meal.on_diet,
            date: splitDateToDateTime(meal.date).date,
            time: splitDateToDateTime(meal.date).time
         }
      })

      reply.status(200).send(formatedMealsData)
   })

   app.get('/:id', async (req, reply) => {
      const createParamsSchema = z.object({
         id: z.string()
      })

      const { id } = createParamsSchema.parse(req.params)

      try {
         const meal = await knex('meals').select('*').where('id', id).first()
         return reply.status(200).send(meal)
      } catch {
         return reply.status(404).send({ error: 'Meal not found' })
      }
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

      await knex('meals')
         .insert({
            id: randomUUID(),
            user_id: user.id,
            name,
            description,
            on_diet,
            date: formatedDate
         })

      return reply.status(201).send()
   })

   app.put('/:id', async (req, reply) => {
      const createMealsBodySchema = z.object({
         name: z.string().optional(),
         description: z.string().optional(),
         on_diet: z.boolean().optional(),
         date: z.string().optional(),
         time: z.string().optional()
      })

      const createParamsSchema = z.object({
         id: z.string()
      })

      const { id } = createParamsSchema.parse(req.params)

      const body  = createMealsBodySchema.parse(req.body)

      const dateTime = (body.date && body.time) ? formateDateToIso(body.date, body.time) : null

      const updatedMeal: {
         name?: string
         on_diet?: boolean
         date?: string
         time?: string
         updated_at?: any
      } = {}

      Object.keys(body).map(key => {
         if (body[key] !== undefined && body[key] !== null ) {
            return updatedMeal[key] = body[key]
         }
      })

      dateTime ? updatedMeal.date = dateTime : delete updatedMeal.date
      delete updatedMeal.time

      updatedMeal.updated_at = knex.fn.now()

      try {
         await knex('meals').where({ id }).update(updatedMeal)
         return reply.status(201).send('Meal updated successfully')
      } catch (err) {
         return reply.status(400).send(err)
      }
   })

   app.delete('/:id', async (req, reply) => {
      const createParamsSchema = z.object({
         id: z.string()
      })

      const { id } = createParamsSchema.parse(req.params)

      try {
         await knex('meals').where('id', id).delete()
         return reply.status(201).send('Meal deleted successfully')
      } catch {
         return reply.status(404).send({ error: 'Meal  not found'})
      }
   })
}
