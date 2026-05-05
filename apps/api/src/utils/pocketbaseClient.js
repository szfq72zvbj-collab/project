// PocketBase client for API server
// This would connect to your PocketBase instance

// Minimal in-memory PocketBase-like client used by the API for testing and local development.
// Provides a `collection(name)` interface with `create`, `getFullList`, `update`, and `getOne` methods.

const store = Object.create(null);

function generateId() {
  return Math.random().toString(36).slice(2, 9);
}

const pocketbaseClient = {
  async connect() {
    console.log('PocketBase client connected (in-memory)');
    return this;
  },

  collection(name) {
    if (!store[name]) store[name] = [];

    return {
      async create(data = {}) {
        const now = new Date().toISOString();
        const id = generateId();
        const record = {
          id,
          ...data,
          createdAt: data.createdAt || now,
          updatedAt: now,
        };
        store[name].push(record);
        return record;
      },

      // Accepts an options object. Only supports a simple filter of the form:
      // `transactionId = "<value>"`
      async getFullList(options = {}) {
        let items = store[name] || [];
        if (options.filter && typeof options.filter === 'string') {
          const m = options.filter.match(/transactionId\s*=\s*"([^"]+)"/);
          if (m) {
            const tx = m[1];
            items = items.filter(i => i.transactionId === tx);
          }
        }
        return items;
      },

      async update(id, data = {}) {
        const items = store[name];
        const idx = items.findIndex(i => i.id === id);
        if (idx === -1) {
          throw new Error('Record not found');
        }
        items[idx] = {
          ...items[idx],
          ...data,
          updatedAt: new Date().toISOString(),
        };
        return items[idx];
      },

      async getOne(id) {
        const items = store[name];
        return items.find(i => i.id === id) || null;
      },
    };
  },
};

export default pocketbaseClient;