/**
 * Enterprise MongoDB Pagination Utility
 */
function parsePaginationParams(req, defaultLimit = 20, maxLimit = 100) {
  let page = parseInt(req.query.page, 10);
  let limit = parseInt(req.query.limit, 10);

  if (isNaN(page) || page < 1) page = 1;
  if (isNaN(limit) || limit < 1) limit = defaultLimit;
  if (limit > maxLimit) limit = maxLimit;

  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

async function paginateQuery(model, filter = {}, options = {}) {
  const page = Math.max(1, parseInt(options.page, 10) || 1);
  const limit = Math.min(Math.max(1, parseInt(options.limit, 10) || 20), options.maxLimit || 100);
  const skip = (page - 1) * limit;
  const sort = options.sort || { createdAt: -1 };
  const select = options.select || null;
  const populate = options.populate || null;

  let query = model.find(filter).sort(sort).skip(skip).limit(limit);

  if (select) query = query.select(select);
  if (populate) query = query.populate(populate);
  if (options.lean !== false) query = query.lean();

  const [data, total] = await Promise.all([
    query.exec(),
    model.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit) || 1;
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNext,
      hasPrev,
    },
  };
}

module.exports = {
  parsePaginationParams,
  paginateQuery,
};
