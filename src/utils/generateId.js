/**
 * Returns the next numeric id for a collection (like an auto-increment).
 */
const generateId = (collection) => {
  const maxId = collection.reduce((max, doc) => (doc.id > max ? doc.id : max), 0);
  return maxId + 1;
};

export default generateId;
