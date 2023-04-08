import { Knex } from 'knex'


export async function up(knex: Knex): Promise<void> {
   await knex.schema.createTable('meals', (table) => {
      table.uuid('id').primary()
      table.uuid('user_id').notNullable()
      table.string('name').notNullable()
      table.text('description')
      table.boolean('on_diet').notNullable()
      table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
      table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable()
      table.foreign('user_id').references('users.id').onDelete('CASCADE')
   })
}


export async function down(knex: Knex): Promise<void> {
   await knex.schema.dropTable('meals')
}

