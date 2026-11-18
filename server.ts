import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dbStore } from './src/lib/mockDatabase.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '25mb' }));

  // --- API ROUTES ---

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'GradeSnap Multi-Tenant API', timestamp: new Date().toISOString() });
  });

  // Tenants
  app.get('/api/tenants', (req, res) => {
    res.json(dbStore.getTenants());
  });

  app.get('/api/tenants/:slug', (req, res) => {
    const tenant = dbStore.getTenantBySlug(req.params.slug);
    if (!tenant) return res.status(404).json({ error: 'Tenant workspace not found' });
    res.json(tenant);
  });

  // Exams
  app.get('/api/exams', (req, res) => {
    const tenantId = req.query.tenantId as string | undefined;
    const exams = dbStore.getExams(tenantId);
    res.json(exams);
  });

  app.get('/api/exams/:id', (req, res) => {
    const tenantId = req.query.tenantId as string | undefined;
    const exam = dbStore.getExamById(req.params.id, tenantId);
    if (!exam) return res.status(404).json({ error: 'Exam not found or unauthorized' });
    res.json(exam);
  });

  app.post('/api/exams', (req, res) => {
    try {
      const exam = dbStore.createExam(req.body);
      res.status(201).json(exam);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/exams/:id', (req, res) => {
    const tenantId = req.query.tenantId as string | undefined;
    const updated = dbStore.updateExam(req.params.id, req.body, tenantId);
    if (!updated) return res.status(404).json({ error: 'Exam not found or unauthorized' });
    res.json(updated);
  });

  app.delete('/api/exams/:id', (req, res) => {
    const tenantId = req.query.tenantId as string | undefined;
    const deleted = dbStore.deleteExam(req.params.id, tenantId);
    if (!deleted) return res.status(404).json({ error: 'Exam not found or unauthorized' });
    res.json({ success: true });
  });

  // Answer Key
  app.get('/api/exams/:id/answer-key', (req, res) => {
    const tenantId = req.query.tenantId as string | undefined;
    const isStudent = req.query.role === 'student';
    const key = dbStore.getAnswerKey(req.params.id, tenantId, isStudent);
    if (!key) return res.status(404).json({ error: 'Answer key not found' });
    res.json(key);
  });

  app.put('/api/exams/:id/answer-key', (req, res) => {
    const tenantId = req.query.tenantId as string | undefined;
    try {
      const key = dbStore.setAnswerKey(req.body, tenantId);
      res.json(key);
    } catch (err: any) {
      res.status(403).json({ error: err.message });
    }
  });

  // OMR Submissions & Results
  app.get('/api/omr/submissions', (req, res) => {
    const examId = req.query.examId as string | undefined;
    const tenantId = req.query.tenantId as string | undefined;
    res.json(dbStore.getSubmissions(examId, tenantId));
  });

  app.post('/api/omr/submissions', (req, res) => {
    try {
      const submission = dbStore.addSubmission(req.body);
      res.status(201).json(submission);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post('/api/omr/submissions/:id/override', (req, res) => {
    const { questionNumber, newAnswer, teacherName, tenantId } = req.body;
    const updated = dbStore.overrideSubmissionAnswer(
      req.params.id,
      questionNumber,
      newAnswer,
      teacherName || 'Teacher Admin',
      tenantId
    );
    if (!updated) return res.status(404).json({ error: 'Submission not found or unauthorized' });
    res.json(updated);
  });

  // Students
  app.get('/api/students', (req, res) => {
    const tenantId = req.query.tenantId as string | undefined;
    res.json(dbStore.getStudents(tenantId));
  });

  app.post('/api/students', (req, res) => {
    try {
      const student = dbStore.addStudent(req.body);
      res.status(201).json(student);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Subscriptions & Platform Admin
  app.get('/api/admin/metrics', (req, res) => {
    res.json(dbStore.getPlatformStats());
  });

  app.get('/api/subscriptions', (req, res) => {
    res.json(dbStore.getSubscriptions());
  });

  app.put('/api/admin/tenants/:id', (req, res) => {
    const updated = dbStore.updateTenant(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Tenant not found' });
    res.json(updated);
  });

  app.post('/api/seed/reset', (req, res) => {
    dbStore.resetToSeed();
    res.json({ message: 'Database reset to default seed successfully.' });
  });

  // Development: Vite middlewares
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: 3000,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`GradeSnap multi-tenant server active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
