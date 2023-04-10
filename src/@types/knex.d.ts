import { Knex } from 'knex';

declare module 'knex/types/tables' {
  export interface Tables {
    dailyDiet: {
      id: string;
      title: string;
      description: string;
      isDiet: boolean,
      date: string
      session_id?: string
    }
  }
}