import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('dailyDiet', (table) => {
    table.uuid('id').primary();
    table.text('title').notNullable();
    table.text('description').notNullable();
    table.boolean('isDiet').notNullable();
    table.text('date').notNullable();
    table.uuid('session_id').after('id').index()
  })
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('dailyDiet');
}

