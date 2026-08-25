import type { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.dropConstraint('tracks', 'tracks_uniq_release_id_track_number');
  pgm.addConstraint('tracks', 'tracks_uniq_release_id_track_number', {
    unique: ['release_id', 'track_number'],
    deferrable: true,
    deferred: true,
  });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropConstraint('tracks', 'tracks_uniq_release_id_track_number');
  pgm.addConstraint('tracks', 'tracks_uniq_release_id_track_number', {
    unique: ['release_id', 'track_number'],
  });
}
