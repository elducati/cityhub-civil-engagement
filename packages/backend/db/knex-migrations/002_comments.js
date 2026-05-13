exports.up = function (knex) {
  return knex.schema
    .createTable('comments', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table.uuid('proposal_id').notNullable().references('id').inTable('proposals').onDelete('CASCADE');
      table.uuid('parent_id').references('id').inTable('comments').onDelete('CASCADE');
      table.uuid('author_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
      table.text('body').notNullable();
      table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
    })
    .then(() => {
      return knex.schema
        .raw('CREATE INDEX IF NOT EXISTS idx_comments_proposal ON comments(proposal_id, created_at)')
        .raw('CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_id)');
    });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('comments');
};
