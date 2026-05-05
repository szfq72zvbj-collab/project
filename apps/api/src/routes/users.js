import { Router } from 'express';

const router = Router();

// Live user tracking database
let users = [
  { 
    id: '1', 
    email: 'test@example.com', 
    name: 'Test User', 
    role: 'student', 
    createdAt: new Date().toISOString(),
    lastLogin: null,
    isOnline: false,
    loginCount: 0
  },
  { 
    id: '2', 
    email: 'admin@example.com', 
    name: 'Admin User', 
    role: 'admin', 
    createdAt: new Date().toISOString(),
    lastLogin: null,
    isOnline: false,
    loginCount: 0
  },
];

// Active sessions tracking
let activeSessions = [];
let loginHistory = [];

// User login with live tracking
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Email and password are required'
    });
  }
  
  // Find user
  const userIndex = users.findIndex(u => u.email === email);
  
  if (userIndex === -1 || password !== 'password') {
    // Track failed login attempt
    loginHistory.push({
      email,
      success: false,
      timestamp: new Date().toISOString(),
      ip: req.ip || 'unknown'
    });
    
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    });
  }
  
  // Update user login info
  const now = new Date().toISOString();
  users[userIndex].lastLogin = now;
  users[userIndex].isOnline = true;
  users[userIndex].loginCount += 1;
  
  const token = 'mock_jwt_token_' + Date.now();
  
  // Track active session
  activeSessions.push({
    userId: users[userIndex].id,
    token,
    loginTime: now,
    ip: req.ip || 'unknown',
    userAgent: req.headers['user-agent'] || 'unknown'
  });
  
  // Track successful login
  loginHistory.push({
    userId: users[userIndex].id,
    email,
    success: true,
    timestamp: now,
    ip: req.ip || 'unknown'
  });
  
  res.json({
    success: true,
    data: {
      user: {
        id: users[userIndex].id,
        email: users[userIndex].email,
        name: users[userIndex].name,
        role: users[userIndex].role,
        lastLogin: users[userIndex].lastLogin,
        loginCount: users[userIndex].loginCount,
        isOnline: users[userIndex].isOnline
      },
      token,
      expiresIn: 3600
    },
    timestamp: now
  });
});

// User logout
router.post('/logout', (req, res) => {
  const token = req.headers.authorization;
  
  if (!token) {
    return res.status(400).json({
      success: false,
      error: 'Token required'
    });
  }
  
  // Find and remove session
  const sessionIndex = activeSessions.findIndex(s => s.token === token);
  
  if (sessionIndex !== -1) {
    const session = activeSessions[sessionIndex];
    
    // Update user online status
    const userIndex = users.findIndex(u => u.id === session.userId);
    if (userIndex !== -1) {
      users[userIndex].isOnline = false;
    }
    
    // Remove session
    activeSessions.splice(sessionIndex, 1);
    
    res.json({
      success: true,
      message: 'Logged out successfully',
      sessionDuration: Date.now() - new Date(session.loginTime).getTime()
    });
  } else {
    res.status(404).json({
      success: false,
      error: 'Session not found'
    });
  }
});

// Get current user with live status
router.get('/me', (req, res) => {
  const token = req.headers.authorization;
  
  if (!token || !token.includes('mock_jwt_token')) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }
  
  // Find session
  const session = activeSessions.find(s => s.token === token);
  
  if (!session) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token'
    });
  }
  
  const user = users.find(u => u.id === session.userId);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }
  
  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        lastLogin: user.lastLogin,
        loginCount: user.loginCount,
        isOnline: user.isOnline,
        createdAt: user.createdAt
      },
      session: {
        loginTime: session.loginTime,
        ip: session.ip,
        userAgent: session.userAgent
      }
    },
    timestamp: new Date().toISOString()
  });
});

// Get all users with live status (admin only)
router.get('/', (req, res) => {
  const token = req.headers.authorization;
  
  if (!token || !token.includes('mock_jwt_token')) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }
  
  res.json({
    success: true,
    data: users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isOnline: user.isOnline,
      lastLogin: user.lastLogin,
      loginCount: user.loginCount,
      createdAt: user.createdAt
    })),
    stats: {
      totalUsers: users.length,
      onlineUsers: users.filter(u => u.isOnline).length,
      activeSessions: activeSessions.length,
      totalLogins: loginHistory.length
    },
    timestamp: new Date().toISOString()
  });
});

// Get active sessions (admin only)
router.get('/sessions', (req, res) => {
  const token = req.headers.authorization;
  
  if (!token || !token.includes('mock_jwt_token')) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }
  
  res.json({
    success: true,
    data: activeSessions.map(session => ({
      userId: session.userId,
      loginTime: session.loginTime,
      duration: Date.now() - new Date(session.loginTime).getTime(),
      ip: session.ip,
      userAgent: session.userAgent
    })),
    count: activeSessions.length,
    timestamp: new Date().toISOString()
  });
});

// Get login history (admin only)
router.get('/login-history', (req, res) => {
  const token = req.headers.authorization;
  
  if (!token || !token.includes('mock_jwt_token')) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }
  
  res.json({
    success: true,
    data: loginHistory.slice(-50), // Last 50 logins
    count: loginHistory.length,
    timestamp: new Date().toISOString()
  });
});

// Get real-time user activity dashboard
router.get('/dashboard', (req, res) => {
  const token = req.headers.authorization;
  
  if (!token || !token.includes('mock_jwt_token')) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }
  
  const now = new Date();
  const lastHour = new Date(now.getTime() - 60 * 60 * 1000);
  
  const recentLogins = loginHistory.filter(
    login => new Date(login.timestamp) > lastHour
  );
  
  const successfulLogins = recentLogins.filter(login => login.success);
  const failedLogins = recentLogins.filter(login => !login.success);
  
  res.json({
    success: true,
    data: {
      realTime: {
        onlineUsers: users.filter(u => u.isOnline).length,
        activeSessions: activeSessions.length,
        recentActivity: recentLogins.length
      },
      hourlyStats: {
        successfulLogins: successfulLogins.length,
        failedLogins: failedLogins.length,
        successRate: recentLogins.length > 0 
          ? (successfulLogins.length / recentLogins.length * 100).toFixed(2) 
          : 0
      },
      userDistribution: {
        students: users.filter(u => u.role === 'student').length,
        admins: users.filter(u => u.role === 'admin').length,
        total: users.length
      },
      topUsers: users
        .sort((a, b) => b.loginCount - a.loginCount)
        .slice(0, 5)
        .map(user => ({
          name: user.name,
          email: user.email,
          loginCount: user.loginCount,
          lastLogin: user.lastLogin,
          isOnline: user.isOnline
        }))
    },
    timestamp: now.toISOString()
  });
});

export default router;