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
  delete copy.contactMessages;
  if (Array.isArray(copy.productReviews)) {
    copy.productReviews = copy.productReviews.filter(r => r.approved !== false);
  }
  return copy;
}

module.exports = { sanitizeStoreForPublic, stripPassword };
