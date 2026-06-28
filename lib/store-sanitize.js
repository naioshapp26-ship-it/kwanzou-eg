function stripPassword(user) {
  if (!user || typeof user !== 'object') return user;
  const { password, ...safe } = user;
  return safe;
}

function sanitizeStoreForPublic(data) {
  if (!data || typeof data !== 'object') return data;
  const copy = JSON.parse(JSON.stringify(data));
  delete copy.users;
  delete copy.orders;
  delete copy.newsletter;
  delete copy.staffAdmins;
  delete copy.adminNotifications;
  return copy;
}

module.exports = { sanitizeStoreForPublic, stripPassword };
