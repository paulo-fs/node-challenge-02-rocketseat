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

   app.post('/sumary', async (req, reply) => {
      const sessionId = req.cookies.sessionId
      let user = {
         id: '',
         name: ''
      }

      const sumary = {
         name: '',
         totalMeals: 0,
         totalMealsOnDiet: 0,
         totalMealsOutOfDiet: 0,
         bestSequenceMealsOnDiet: 0
      }

      try {
         user = await knex('users').select(['id', 'name']).where('session_id', sessionId).first()
         sumary.name = user.name
      } catch {
         return reply.status(404).send({ error: 'User not found' })
      }

      try {
         const meals = await knex('meals').select('*').where('user_id', user.id)
         sumary.totalMeals = meals.length
      } catch {
         return reply.status(404).send({ error: 'Meals not found' })
      }

      try {
         const totalMealsOnDiet = await knex('meals').count({ count: ['on_diet']}).where('user_id', user.id).andWhere('on_diet', 1).first()
         sumary.totalMealsOnDiet = Number(totalMealsOnDiet?.count)
      } catch {
         return reply.status(400).send({ error: 'Error in counting meals on diet' })
      }

      try {
         const totalMealsOutDiet = await knex('meals').count({ count: ['on_diet']}).where('user_id', user.id).andWhere('on_diet', 0).first()
         sumary.totalMealsOutOfDiet = Number(totalMealsOutDiet?.count)
      } catch {
         return reply.status(400).send({ error: 'Error in counting meals out of diet' })
      }

      try {
         const bestSequence = await knex('meals').groupBy('date').where('user_id', user.id).having('on_diet', '=', 1).count({ on_diet: ['on_diet'] }).orderBy('on_diet', 'desc')
         console.log(bestSequence[0]?.on_diet)
         sumary.bestSequenceMealsOnDiet = Number(bestSequence[0]?.on_diet)
      } catch {
         return reply.status(400).send({ error: 'Error in counting best on diet sequence' })
      }

      return reply.status(200).send(sumary)
   })
}
