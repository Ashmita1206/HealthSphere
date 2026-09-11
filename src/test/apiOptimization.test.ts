import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('F42 — Production API Optimization Suite', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { parseQueryParams, buildPaginatedResponse, buildFacetAggregationPipeline, executeBulkWrite } = require('../../server/utils/queryOptimizer');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { COMPRESSION_THRESHOLD } = require('../../server/middlewares/compression');

  it('1. Pagination & Query Parser: calculates page offset, limit caps, and sort orders', () => {
    const rawQuery = {
      page: '3',
      limit: '25',
      sort: '-createdAt',
      category: 'cardiology',
      age: { gte: '18', lte: '65' },
    };

    const parsed = parseQueryParams(rawQuery);

    expect(parsed.page).toBe(3);
    expect(parsed.limit).toBe(25);
    expect(parsed.skip).toBe(50); // (3 - 1) * 25
    expect(parsed.sort).toEqual({ createdAt: -1 });
    expect(parsed.filter.category).toBe('cardiology');
    expect(parsed.filter.age).toEqual({ $gte: 18, $lte: 65 });
  });

  it('2. Limit Caps & Sanitation: prevents unbounded limits and enforces min page', () => {
    const unbounded = parseQueryParams({ page: '-5', limit: '999' });

    expect(unbounded.page).toBe(1);
    expect(unbounded.limit).toBe(100); // capped at 100
    expect(unbounded.skip).toBe(0);
  });

  it('3. Standardized Pagination Envelope: generates complete navigational metadata', () => {
    const data = [{ id: '1' }, { id: '2' }, { id: '3' }];
    const envelope = buildPaginatedResponse(data, 105, 2, 20);

    expect(envelope.success).toBe(true);
    expect(envelope.data).toEqual(data);
    expect(envelope.pagination.totalItems).toBe(105);
    expect(envelope.pagination.totalPages).toBe(6); // ceil(105 / 20) = 6
    expect(envelope.pagination.currentPage).toBe(2);
    expect(envelope.pagination.limit).toBe(20);
    expect(envelope.pagination.hasNextPage).toBe(true);
    expect(envelope.pagination.hasPrevPage).toBe(true);
  });

  it('4. Facet Aggregation Pipeline: builds optimized $facet pipeline for big clinical data', () => {
    const pipeline = buildFacetAggregationPipeline(
      { status: 'active', department: 'ICU' },
      { triageLevel: -1 },
      2,
      15
    );

    expect(Array.isArray(pipeline)).toBe(true);
    expect(pipeline[0].$match).toEqual({ status: 'active', department: 'ICU' });
    expect(pipeline[1].$sort).toEqual({ triageLevel: -1 });
    expect(pipeline[2].$facet).toBeDefined();
    expect(pipeline[2].$facet.metadata).toEqual([{ $count: 'total' }]);
    expect(pipeline[2].$facet.data).toEqual([{ $skip: 15 }, { $limit: 15 }]);
  });

  it('5. Bulk Operations: executes batch writes safely without throwing on empty', async () => {
    const mockModel = {
      bulkWrite: async (ops: unknown[], opts: unknown) => ({
        insertedCount: 2,
        matchedCount: 0,
        modifiedCount: 0,
        deletedCount: 0,
        ops,
        opts,
      }),
    };

    const emptyRes = await executeBulkWrite(mockModel, []);
    expect(emptyRes.insertedCount).toBe(0);

    const ops = [
      { insertOne: { document: { vital: 'heartRate', value: 75 } } },
      { insertOne: { document: { vital: 'heartRate', value: 80 } } },
    ];
    const writeRes = await executeBulkWrite(mockModel, ops);
    expect(writeRes.insertedCount).toBe(2);
  });

  it('6. Response Compression: enforces minimum payload threshold', () => {
    expect(COMPRESSION_THRESHOLD).toBe(1024);
  });

  it('7. OpenAPI / Swagger Documentation: provides valid JSON specification', () => {
    const swaggerPath = path.resolve(__dirname, '../../server/docs/swagger.json');
    expect(fs.existsSync(swaggerPath)).toBe(true);

    const raw = fs.readFileSync(swaggerPath, 'utf-8');
    const doc = JSON.parse(raw);

    expect(doc.openapi).toMatch(/^3\./);
    expect(doc.info.title).toContain('HealthSphere');
    expect(doc.servers.some((s: { url: string }) => s.url === '/api/v1')).toBe(true);
    expect(doc.components.securitySchemes.BearerAuth).toBeDefined();
    expect(doc.components.securitySchemes.CsrfToken).toBeDefined();
    expect(doc.paths['/system/health']).toBeDefined();
  });
});
