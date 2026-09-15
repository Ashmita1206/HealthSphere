/**
 * HealthSphere Enterprise Query Optimization & API Utilities
 * Standardized pagination, flexible filtering, multi-field sorting,
 * lean query execution, aggregation facets, and high-throughput bulk operations.
 */

/**
 * Parses and sanitizes incoming HTTP query parameters for database queries
 */
function parseQueryParams(query = {}) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
  const skip = (page - 1) * limit;

  // Sorting parser: support "-createdAt", "createdAt:desc", "name:asc"
  let sort = { createdAt: -1 };
  if (query.sort) {
    if (typeof query.sort === 'string') {
      if (query.sort.startsWith('-')) {
        sort = { [query.sort.substring(1)]: -1 };
      } else if (query.sort.includes(':')) {
        const [field, order] = query.sort.split(':');
        sort = { [field]: order.toLowerCase() === 'desc' ? -1 : 1 };
      } else {
        sort = { [query.sort]: 1 };
      }
    } else if (typeof query.sort === 'object') {
      sort = query.sort;
    }
  }

  // Filtering: exclude reserved control parameters
  const filter = {};
  const excludedParams = ['page', 'limit', 'sort', 'fields', 'populate', '_'];

  for (const [key, value] of Object.entries(query)) {
    if (excludedParams.includes(key)) continue;

    // Handle range queries like field[gte], field[lte]
    if (typeof value === 'object' && value !== null) {
      filter[key] = {};
      for (const [op, opVal] of Object.entries(value)) {
        if (['gte', 'gt', 'lte', 'lt', 'ne', 'in', 'nin'].includes(op)) {
          filter[key][`$${op}`] = isNaN(Number(opVal)) ? opVal : Number(opVal);
        }
      }
    } else if (typeof value === 'string') {
      filter[key] = value.trim();
    } else {
      filter[key] = value;
    }
  }

  return { page, limit, skip, sort, filter, fields: query.fields };
}

/**
 * Standardizes API pagination envelopes
 */
function buildPaginatedResponse(data, totalCount, page, limit) {
  const totalPages = Math.ceil(totalCount / limit) || 1;
  return {
    success: true,
    data,
    pagination: {
      totalItems: totalCount,
      totalPages,
      currentPage: page,
      limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}

/**
 * Executes a paginated, lean Mongoose query
 */
async function executePaginatedQuery(model, queryOptions = {}, customFilter = {}) {
  const { page, limit, skip, sort, filter, fields } = parseQueryParams(queryOptions);
  const combinedFilter = { ...filter, ...customFilter };

  const [data, totalCount] = await Promise.all([
    model
      .find(combinedFilter)
      .select(fields ? fields.split(',').join(' ') : '')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean({ virtuals: true })
      .exec(),
    model.countDocuments(combinedFilter).exec(),
  ]);

  return buildPaginatedResponse(data, totalCount, page, limit);
}

/**
 * Standardized high-performance pagination with .lean() execution
 */
async function paginateQuery(model, filter = {}, options = {}) {
  const page = Math.max(1, parseInt(options.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(options.limit, 10) || 20));
  const skip = (page - 1) * limit;
  const sort = options.sort || { createdAt: -1 };
  const select = options.select || '';

  const startTime = Date.now();

  const [docs, total] = await Promise.all([
    model
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select(select)
      .lean({ virtuals: true }),
    model.countDocuments(filter),
  ]);

  const executionTimeMs = Date.now() - startTime;
  const totalPages = Math.ceil(total / limit);

  return {
    docs,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      executionTimeMs,
    },
  };
}

/**
 * Optimized Aggregation Pipeline with Facet
 */
function buildFacetAggregationPipeline(matchCriteria = {}, sort = { createdAt: -1 }, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  return [
    { $match: matchCriteria },
    { $sort: sort },
    {
      $facet: {
        metadata: [{ $count: 'total' }],
        data: [{ $skip: skip }, { $limit: limit }],
      },
    },
    {
      $project: {
        data: 1,
        total: { $arrayElemAt: ['$metadata.total', 0] },
      },
    },
  ];
}

/**
 * High-performance bulk write helper for batch database mutations
 */
async function executeBulkWrite(model, operations, options = { ordered: false }) {
  if (!Array.isArray(operations) || operations.length === 0) {
    return { insertedCount: 0, matchedCount: 0, modifiedCount: 0, deletedCount: 0 };
  }
  return model.bulkWrite(operations, options);
}

module.exports = {
  parseQueryParams,
  buildPaginatedResponse,
  executePaginatedQuery,
  paginateQuery,
  buildFacetAggregationPipeline,
  executeBulkWrite,
};
