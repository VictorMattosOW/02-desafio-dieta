import fastify from "fastify";
import cookie from '@fastify/cookie';
import { DailyDiet } from "./routes/dailyDiet";


export const app = fastify();

app.register(cookie);

app.register(DailyDiet, {
  prefix: 'dailyDiet'
})