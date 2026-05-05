// Mock PocketBase client for development
// In production, this would connect to actual PocketBase instance

const mockUsers = [
  { id: '1', email: 'test@example.com', username: 'testuser', verified: true },
  { id: '2', email: 'admin@example.com', username: 'admin', verified: true },
];

const mockAuthStore = {
  model: null,
  token: null,
  isValid: false,
  
  save(token, model) {
    this.token = token;
    this.model = model;
    this.isValid = true;
    console.log('Auth saved:', { token, model });
  },
  
  clear() {
    this.token = null;
    this.model = null;
    this.isValid = false;
    console.log('Auth cleared');
  },
};

const pb = {
  authStore: mockAuthStore,
  
  collection(collectionName) {
    return {
      getList(page = 1, perPage = 30, options = {}) {
        console.log(`Getting list from ${collectionName}`);
        return {
          items: [],
          page,
          perPage,
          totalItems: 0,
          totalPages: 0,
        };
      },
      
      getOne(id) {
        console.log(`Getting one from ${collectionName}: ${id}`);
        return { id, name: 'Mock Item' };
      },
      
      create(data) {
        console.log(`Creating in ${collectionName}:`, data);
        return { id: 'mock_' + Date.now(), ...data };
      },
      
      update(id, data) {
        console.log(`Updating in ${collectionName}: ${id}`, data);
        return { id, ...data };
      },
    };
  },
  
  async authWithPassword(email, password) {
    console.log(`Auth with password: ${email}`);
    // Mock authentication
    const user = mockUsers.find(u => u.email === email);
    if (user && password === 'password') {
      this.authStore.save('mock_token_' + Date.now(), user);
      return user;
    }
    throw new Error('Invalid credentials');
  },
  
  async authRefresh() {
    console.log('Auth refresh');
    if (this.authStore.isValid) {
      return this.authStore.model;
    }
    throw new Error('Not authenticated');
  },
  
  async sendVerificationEmail(email) {
    console.log(`Sending verification email to: ${email}`);
    return { success: true };
  },
  
  async requestPasswordReset(email) {
    console.log(`Requesting password reset for: ${email}`);
    return { success: true };
  },
  
  async confirmPasswordReset(resetToken, newPassword, confirmPassword) {
    console.log(`Confirming password reset`);
    if (newPassword === confirmPassword) {
      return { success: true };
    }
    throw new Error('Passwords do not match');
  },
};

export default pb;