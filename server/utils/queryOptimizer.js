/**
 * HealthSphere MongoDB Query Optimizer (F38)
 * - Standardized high-performance pagination with .lean() execution
 * - Projection optimization and query execution timing
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

module.exports = {
  paginateQuery,
};
