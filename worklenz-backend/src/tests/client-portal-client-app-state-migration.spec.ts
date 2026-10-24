import { Client } from 'pg';

interface Migration {
  up(builder: { sql(statement: string): void }): Promise<void>;
  down(builder: { sql(statement: string): void }): Promise<void>;
}

const migration: Migration = require('../../database/pg-migrations/1791454074122_client-portal-client-app-state');
const legacyMigration: Migration = require('../../database/pg-migrations/1766188800000_create_client_portal_notification_reads');
const integration = process.env.TEST_CLIENT_PORTAL_DATABASE_URL ? describe : describe.skip;

// Use a disposable database: both migrations check objects in public.
integration('Client portal notification read-state migration', () => {
  let client: Client;
  let upSql: string;
  let downSql: string;
  let legacySql: string;

  const collectSql = async (run: Migration['up']): Promise<string> => {
    const statements: string[] = [];
    await run({ sql: statement => { statements.push(statement); } });
    return statements.join('\n');
  };

  beforeAll(async () => {
    upSql = await collectSql(migration.up);
    downSql = await collectSql(migration.down);
    legacySql = await collectSql(legacyMigration.up);
    client = new Client({ connectionString: process.env.TEST_CLIENT_PORTAL_DATABASE_URL });
    await client.connect();
  });

  beforeEach(async () => {
    await client.query('BEGIN');
    await client.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
      CREATE TABLE clients (id UUID PRIMARY KEY DEFAULT uuid_generate_v4());
      CREATE TABLE teams (id UUID PRIMARY KEY DEFAULT uuid_generate_v4());
      CREATE TABLE client_contacts (id UUID PRIMARY KEY DEFAULT uuid_generate_v4());
      CREATE TABLE client_portal_threads (id UUID PRIMARY KEY DEFAULT uuid_generate_v4());
      CREATE TABLE client_portal_notifications (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), metadata JSONB
      );
      INSERT INTO clients DEFAULT VALUES;
      INSERT INTO teams DEFAULT VALUES;
      INSERT INTO client_contacts DEFAULT VALUES;
      INSERT INTO client_portal_notifications DEFAULT VALUES;
    `);
  });

  afterEach(async () => { await client.query('ROLLBACK'); });
  afterAll(async () => { await client.end(); });

  it('preserves legacy rows through upgrade, retries, rollback, and re-upgrade', async () => {
    await client.query(legacySql);
    await client.query(`
      INSERT INTO client_portal_notification_reads
        (client_id, organization_team_id, notification_type, reference_id)
      SELECT clients.id, teams.id, 'message', uuid_generate_v4() FROM clients CROSS JOIN teams
    `);
    const original = (await client.query('SELECT * FROM client_portal_notification_reads')).rows;

    await client.query(upSql);
    await client.query(upSql);
    expect((await client.query('SELECT * FROM client_portal_notification_reads_legacy')).rows)
      .toEqual(original);

    await client.query(`
      INSERT INTO client_portal_notification_reads (notification_id, contact_id)
      SELECT n.id, c.id FROM client_portal_notifications n CROSS JOIN client_contacts c
    `);
    expect((await client.query('SELECT * FROM client_portal_notification_reads')).rows).toHaveLength(1);
    await expect(client.query(`
      INSERT INTO client_portal_notification_reads (notification_id, contact_id)
      SELECT n.id, c.id FROM client_portal_notifications n CROSS JOIN client_contacts c
      ON CONFLICT DO NOTHING
    `)).resolves.toBeDefined();
    expect((await client.query('SELECT * FROM client_portal_notification_reads')).rows).toHaveLength(1);

    await client.query(downSql);
    expect((await client.query('SELECT * FROM client_portal_notification_reads')).rows).toEqual(original);
    await client.query(upSql);
    expect((await client.query('SELECT * FROM client_portal_notification_reads_legacy')).rows)
      .toEqual(original);
  });

  it('creates the per-contact schema without a legacy table', async () => {
    await client.query(upSql);
    await client.query(upSql);
    await client.query(`
      INSERT INTO client_portal_notification_reads (notification_id, contact_id)
      SELECT n.id, c.id FROM client_portal_notifications n CROSS JOIN client_contacts c
    `);
    expect((await client.query('SELECT * FROM client_portal_notification_reads')).rows).toHaveLength(1);
    expect((await client.query("SELECT to_regclass('client_portal_notification_reads_legacy') AS legacy")).rows[0].legacy)
      .toBeNull();

    await client.query(downSql);
    expect((await client.query("SELECT to_regclass('client_portal_notification_reads') AS current")).rows[0].current)
      .toBeNull();
  });
});
