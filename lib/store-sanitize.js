function stripPassword(user) {
  if (!user || typeof user !== 'object') return user;
  const { password, ...safe } = user;
  return safe;
}

function sanitizeStoreForPublic(data) {
  if (!data || typeof data !== 'object') return data;
  const copy = JSON.parse(JSON.stringify(data));
  copy.users = (copy.users || [])
    .filter(u => u.role !== 'superadmin')
    .map(stripPassword);
  delete copy.orders;
  delete copy.newsletter;
  return copy;
}

module.exports = { sanitizeStoreForPublic, stripPassword };
