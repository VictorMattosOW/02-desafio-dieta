import { randomUUID } from 'crypto';
import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { knex } from '../database';
import { checkSessionIdExists } from '../middlewares/check-session-id-exists';

const dailyDietBodySchema = z.object({
  title: z.string(),
  description: z.string(),
  isDiet: z.boolean(),
  date: z.string()
});

const getIdDailyDietParamsSchema = z.object({
  id: z.string().uuid(),
});

export async function DailyDiet(app: FastifyInstance) {

  app.addHook('preHandler', async (request, reply) => {
    if (request.method === 'POST') {
      return;
    }
    checkSessionIdExists(request, reply);
  })

  app.post('/', async (request, reply) => {

    const { title, description, isDiet, date } = dailyDietBodySchema.parse(request.body);

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
      date,
      session_id: sessionId,
    })

    return reply.status(201).send();
  })

  app.get('/totalWithinDiet', async (request) => {
    const { sessionId } = request.cookies;

    const totalWithinDiet = await knex('dailyDiet')
      .where('session_id', sessionId)
      .count('isDiet as diet')
      .where('isDiet', true);

    return {
      totalWithinDiet,
    }
  })

  app.get('/totalWithoutDiet', async (request) => {
    const { sessionId } = request.cookies;

    const totalWithinDiet = await knex('dailyDiet')
      .where('session_id', sessionId)
      .count('isDiet as diet')
      .where('isDiet', false);

    return {
      totalWithinDiet,
    }
  })

  app.get('/totalDiet', async (request) => {
    const { sessionId } = request.cookies;

    const totalWithinDiet = await knex('dailyDiet')
      .where('session_id', sessionId)
      .count('id');

    return {
      totalWithinDiet,
    }
  })

  app.get('/bestSequency', async (request) => {
    const { sessionId } = request.cookies;

    const totalDays = await knex('dailyDiet')
      .where('session_id', sessionId);

    let current = 0, longest = 0;
    totalDays.forEach(day => {
      if (day.isDiet) {
        current++;
        longest = Math.max(current, longest);
      } else {
        current = 0;
      }
    });

    return {
      longest,
    }
  })

  app.get('/', async (request) => {
    const { sessionId } = request.cookies;

    const daily = await knex('dailyDiet')
      .where('session_id', sessionId)
      .select()

    return {
      daily,
    }
  })

  app.get('/:id', async (request) => {
    const { sessionId } = request.cookies;

    const { id } = getIdDailyDietParamsSchema.parse(request.params);

    const daily = await knex('dailyDiet')
      .where({
        session_id: sessionId,
        id
      })
      .select();

    return {
      daily,
    }
  })

  app.delete('/:id', async (request, reply) => {
    const { sessionId } = request.cookies;

    const { id } = getIdDailyDietParamsSchema.parse(request.params);

    await knex('dailyDiet')
      .where({
        session_id: sessionId,
        id
      })
      .del();

    return reply.status(200).send();
  })

  app.put('/:id', async (request, reply) => {

    const { sessionId } = request.cookies;


    const { id } = getIdDailyDietParamsSchema.parse(request.params);

    const { title, description, isDiet, date } = dailyDietBodySchema.parse(request.body);
    console.log(title, description);

    try {
      await knex('dailyDiet')
        .where('session_id', sessionId)
        .where({ id })
        .update({
          title,
          description,
          isDiet,
          date
        })

      return reply.status(200).send();

    } catch (error) {
      return reply.status(401).send({
        messge: error
      });
    }
  })
}