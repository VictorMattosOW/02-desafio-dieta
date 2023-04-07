import { randomUUID } from 'crypto';
import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { knex } from '../database';
export async function DailyDiet(app: FastifyInstance) {

  app.post('/', async (request, reply) => {

    const createDailyDietBodySchema = z.object({
      title: z.string(),
      description: z.string(),
      isDiet: z.boolean(),
    })

    const { title, description, isDiet } = createDailyDietBodySchema.parse(request.body);
    console.log(title, description, isDiet);

    let { sessionId } = request.cookies;

    if (!sessionId) {
      sessionId = randomUUID();

      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7, // days
      })
    }

    await knex('dailyDiet').insert({
      id: randomUUID(),
      title,
      description,
      isDiet,
      session_id: sessionId,
    })



    return reply.status(201).send();
  })

  app.get('/', async () => {
    const daily = await knex('dailyDiet').select()

    return {
      daily,
    }
  })
}