import { Router } from 'express';

const router = Router();

// Live chapters data
const chapters = [
  { id: '1', chapterNumber: 1, title: 'Complex Numbers', description: 'Introduction to complex numbers, operations, polar form, and De Moivre\'s theorem.', isPremium: false, createdAt: new Date().toISOString() },
  { id: '2', chapterNumber: 2, title: 'Mathematical Induction', description: 'Principles of mathematical induction and its applications in proving statements.', isPremium: false, createdAt: new Date().toISOString() },
  { id: '3', chapterNumber: 3, title: 'Analytical Solid Geometry', description: 'Coordinates in 3D space, direction cosines, planes, and straight lines.', isPremium: false, createdAt: new Date().toISOString() },
  { id: '4', chapterNumber: 4, title: 'Vector Algebra', description: 'Vectors, scalar and vector products, and applications in geometry.', isPremium: true, createdAt: new Date().toISOString() },
  { id: '5', chapterNumber: 5, title: 'Permutations and Combinations', description: 'Fundamental principles of counting, permutations, and combinations.', isPremium: true, createdAt: new Date().toISOString() },
  { id: '6', chapterNumber: 6, title: 'Conic Sections', description: 'Parabola, ellipse, and hyperbola with their standard equations and properties.', isPremium: true, createdAt: new Date().toISOString() },
  { id: '7', chapterNumber: 7, title: 'Trigonometric Functions', description: 'Advanced trigonometric identities, equations, and inverse trigonometric functions.', isPremium: true, createdAt: new Date().toISOString() },
  { id: '8', chapterNumber: 8, title: 'Logarithmic and Exponential Functions', description: 'Properties of logarithms, exponential functions, and their equations.', isPremium: true, createdAt: new Date().toISOString() },
  { id: '9', chapterNumber: 9, title: 'Application of Differentiation', description: 'Tangents, normals, maxima, minima, and rate of change.', isPremium: true, createdAt: new Date().toISOString() },
  { id: '10', chapterNumber: 10, title: 'Method of Integration', description: 'Indefinite integrals, integration by substitution, parts, and partial fractions.', isPremium: true, createdAt: new Date().toISOString() },
  { id: '11', chapterNumber: 11, title: 'Application of Integration', description: 'Definite integrals, area under curves, and volume of solids of revolution.', isPremium: true, createdAt: new Date().toISOString() },
];

// Get all chapters
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: chapters,
    count: chapters.length,
    timestamp: new Date().toISOString()
  });
});

// Get premium chapters only
router.get('/premium', (req, res) => {
  const premiumChapters = chapters.filter(c => c.isPremium);
  
  res.json({
    success: true,
    data: premiumChapters,
    count: premiumChapters.length,
    timestamp: new Date().toISOString()
  });
});

// Get free chapters only
router.get('/free', (req, res) => {
  const freeChapters = chapters.filter(c => !c.isPremium);
  
  res.json({
    success: true,
    data: freeChapters,
    count: freeChapters.length,
    timestamp: new Date().toISOString()
  });
});

// Get single chapter by ID
router.get('/:id', (req, res) => {
  const chapter = chapters.find(c => c.id === req.params.id);
  
  if (!chapter) {
    return res.status(404).json({
      success: false,
      error: 'Chapter not found'
    });
  }
  
  res.json({
    success: true,
    data: chapter,
    timestamp: new Date().toISOString()
  });
});

export default router;