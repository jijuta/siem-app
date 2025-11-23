import { Pool, PoolClient, QueryResult } from 'pg'

// Singleton pool instance
let pool: Pool | null = null

/**
 * Get or create PostgreSQL connection pool
 * Uses singleton pattern to ensure only one pool instance exists
 */
export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'siem_db',
      user: process.env.DB_USER || 'opensearch',
      password: process.env.DB_PASSWORD || 'opensearch123',
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
      connectionTimeoutMillis: 2000, // Return error after 2 seconds if connection could not be established
    })

    // Handle pool errors
    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err)
      process.exit(-1)
    })

    console.log('PostgreSQL connection pool created')
  }

  return pool
}

/**
 * Execute a query using the connection pool
 */
export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const poolInstance = getPool()
  return poolInstance.query<T>(text, params)
}

/**
 * Get a client from the pool for transactions
 */
export async function getClient(): Promise<PoolClient> {
  const poolInstance = getPool()
  return poolInstance.connect()
}

/**
 * Execute a transaction
 */
export async function transaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await getClient()

  try {
    await client.query('BEGIN')
    const result = await callback(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

/**
 * Close the pool (for graceful shutdown)
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end()
    pool = null
    console.log('PostgreSQL connection pool closed')
  }
}

// Export the pool getter as default
export default { getPool, query, getClient, transaction, closePool }
