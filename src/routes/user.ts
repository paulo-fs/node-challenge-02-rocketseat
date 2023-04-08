import { FastifyInstance } from 'fastify'
import { randomUUID } from 'crypto'
import { z } from 'zod'

export async function userRoutes(app: FastifyInstance) {
   app.get('/', async (req, res) => {
      res.send('hello world')
   })
}
