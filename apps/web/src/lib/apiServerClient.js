// Mock API server client for development
// In production, this would make actual API calls

const apiServerClient = {
  async createPaymentIntent(courseId) {
    // Mock API call
    console.log(`Creating payment intent for course: ${courseId}`);
    return {
      success: true,
      clientSecret: 'mock_client_secret_' + Date.now(),
      paymentIntentId: 'mock_pi_' + Date.now(),
    };
  },
  
  async confirmPayment(paymentIntentId) {
    // Mock API call
    console.log(`Confirming payment: ${paymentIntentId}`);
    return {
      success: true,
      message: 'Payment confirmed successfully',
    };
  },
};

export default apiServerClient;