exports.up = function (knex) {
  return knex.schema
    .raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
    .createTable('users', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table.string('email', 255).notNullable().unique();
      table.string('name', 255);
      table.string('password_hash', 255).notNullable();
      table.enu('role', ['USER', 'MODERATOR', 'ADMIN'], { useNative: true, enumName: 'user_role' }).notNullable().defaultTo('USER');
      table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
      table.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now());
    })
    .then(() => {
      return knex.schema
        .raw('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)')
        .raw('CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)');
    })
    .then(() => {
      return knex.schema.createTable('proposals', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
        table.string('title', 500).notNullable();
        table.text('description').notNullable();
        table.uuid('author_id').notNullable().references('id').inTable('users').onDelete('RESTRICT');
        table.enu('status', ['OPEN', 'UNDER_REVIEW', 'FEASIBILITY', 'PLANNED', 'IMPLEMENTED', 'REJECTED'], { useNative: true, enumName: 'proposal_status' }).notNullable().defaultTo('OPEN');
        table.integer('vote_count').notNullable().defaultTo(0);
        table.string('category', 50);
        table.decimal('latitude', 10, 7);
        table.decimal('longitude', 10, 7);
        table.text('rejection_reason');
        table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
        table.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now());
      });
    })
    .then(() => {
      return knex.schema
        .raw('CREATE INDEX IF NOT EXISTS idx_proposals_status ON proposals(status)')
        .raw('CREATE INDEX IF NOT EXISTS idx_proposals_created_at ON proposals(created_at DESC)')
        .raw('CREATE INDEX IF NOT EXISTS idx_proposals_vote_count ON proposals(vote_count DESC)')
        .raw('CREATE INDEX IF NOT EXISTS idx_proposals_author_id ON proposals(author_id)')
        .raw('CREATE INDEX IF NOT EXISTS idx_proposals_category ON proposals(category)');
    })
    .then(() => {
      return knex.schema.createTable('votes', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
        table.uuid('proposal_id').notNullable().references('id').inTable('proposals').onDelete('CASCADE');
        table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
        table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
        table.unique(['proposal_id', 'user_id']);
      });
    })
    .then(() => {
      return knex.schema
        .raw('CREATE INDEX IF NOT EXISTS idx_votes_proposal_id ON votes(proposal_id)')
        .raw('CREATE INDEX IF NOT EXISTS idx_votes_user_id ON votes(user_id)');
    })
    .then(() => {
      return knex.schema.createTable('audit_logs', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
        table.uuid('user_id').references('id').inTable('users').onDelete('SET NULL');
        table.string('action', 50).notNullable();
        table.string('entity_type', 50).notNullable();
        table.uuid('entity_id');
        table.jsonb('metadata');
        table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
      });
    })
    .then(() => {
      return knex.schema
        .raw('CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id)')
        .raw('CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id)')
        .raw('CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC)');
    })
    .then(() => {
      return knex.raw(`
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
        $$ language 'plpgsql'
      `);
    })
    .then(() => {
      return knex.raw(`
        CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
      `);
    })
    .then(() => {
      return knex.raw(`
        CREATE TRIGGER update_proposals_updated_at BEFORE UPDATE ON proposals
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
      `);
    });
};

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists('audit_logs')
    .dropTableIfExists('votes')
    .dropTableIfExists('proposals')
    .dropTableIfExists('users')
    .raw('DROP TRIGGER IF EXISTS update_users_updated_at ON users')
    .raw('DROP TRIGGER IF EXISTS update_proposals_updated_at ON proposals')
    .raw('DROP FUNCTION IF EXISTS update_updated_at_column()')
    .raw('DROP TYPE IF EXISTS user_role')
    .raw('DROP TYPE IF EXISTS proposal_status');
};
