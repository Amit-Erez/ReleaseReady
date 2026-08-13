import { pool } from "../db.js";
import type {
  CreateContributorInput,
  Contributor,
} from "@release-ready/shared";

export async function createContributor(
  {name, default_role}: CreateContributorInput
) {
  const result = await pool.query<Contributor>(
    'INSERT INTO contributors (name, default_role) VALUES ($1, $2) RETURNING *',
    [name, default_role]
  );
  return result.rows[0];
}
