// PocketBase client for API server
// This would connect to your PocketBase instance

const pocketbaseClient = {
  async connect() {
    console.log('PocketBase client connected');
    return this;
  },
  
  async getCollection(collectionName) {
    console.log(`Getting collection: ${collectionName}`);
    return {
      async getList(page = 1, perPage = 30) {
        return {
          items: [],
          page,
          perPage,
          totalItems: 0,
          totalPages: 0,
        };
      },
      
      async getOne(id) {
        return { id, name: 'Item from PocketBase' };
      },
    };
  },
};

export default pocketbaseClient;