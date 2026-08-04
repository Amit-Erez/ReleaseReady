import type { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.addConstraint('contributors', 'contributors_default_role_check', {
    check: "default_role IN ('composer', 'producer', 'arranger', 'lyricist')",
  });
  pgm.addConstraint('track_contributors', 'track_contributors_role_check', {
    check: "role IN ('composer', 'producer', 'arranger', 'lyricist')",
  });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropConstraint('track_contributors', 'track_contributors_role_check');
  pgm.dropConstraint('contributors', 'contributors_default_role_check');
}
