import type { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable('contributors', {
    id: {
      type: 'integer',
      primaryKey: true,
      sequenceGenerated: { precedence: 'ALWAYS' },
    },
    name: {
      type: 'text',
      notNull: true,
    },
    default_role: {
      type: 'text',
      notNull: true,
    },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
  });

  pgm.createTable('releases', {
    id: {
      type: 'integer',
      primaryKey: true,
      sequenceGenerated: { precedence: 'ALWAYS' },
    },
    title: {
      type: 'text',
    },
    artist_name: {
      type: 'text',
      notNull: true,
    },
    upc: {
      type: 'text',
      unique: true,
    },
    release_date: {
      type: 'date',
      notNull: true,
    },
    status: {
      type: 'text',
      notNull: true,
      default: 'draft',
      check: "status IN ('draft', 'submitted')",
    },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
    updated_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
  });

  pgm.createTable('tracks', {
    id: {
      type: 'integer',
      primaryKey: true,
      sequenceGenerated: { precedence: 'ALWAYS' },
    },
    release_id: {
      type: 'integer',
      notNull: true,
      references: 'releases',
      onDelete: 'CASCADE',
    },
    title: {
      type: 'text',
      notNull: true,
    },
    track_number: {
      type: 'integer',
      notNull: true,
    },
    isrc: {
      type: 'text',
      unique: true,
    },
  }, {
    constraints: {
      unique: [['release_id', 'track_number']],
    },
  });

  pgm.createTable('track_contributors', {
    track_id: {
      type: 'integer',
      notNull: true,
      references: 'tracks',
      onDelete: 'CASCADE',
    },
    contributor_id: {
      type: 'integer',
      notNull: true,
      references: 'contributors',
      onDelete: 'RESTRICT',
    },
    role: {
      type: 'text',
      notNull: true,
    },
    split_percent: {
      type: 'numeric(5,2)',
      notNull: true,
      check: 'split_percent > 0 AND split_percent <= 100',
    },
  }, {
    constraints: {
      primaryKey: ['track_id', 'contributor_id', 'role'],
    },
  });

  pgm.createTable('submissions', {
    id: {
      type: 'integer',
      primaryKey: true,
      sequenceGenerated: { precedence: 'ALWAYS' },
    },
    release_id: {
      type: 'integer',
      notNull: true,
      unique: true,
      references: 'releases',
      onDelete: 'RESTRICT',
    },
    submitted_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
  });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable('submissions');
  pgm.dropTable('track_contributors');
  pgm.dropTable('tracks');
  pgm.dropTable('releases');
  pgm.dropTable('contributors');
}
