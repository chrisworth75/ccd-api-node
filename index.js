const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4452;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'UP' });
});

// Validate case reference endpoint
// GET /cases/{caseId}
app.get('/cases/:caseId', (req, res) => {
  const { caseId } = req.params;

  // Mock case data response matching CCD API v2 format
  const caseData = {
    id: caseId,
    jurisdiction: 'DIVORCE',
    case_type: 'DIVORCE',
    created_date: new Date().toISOString(),
    last_modified: new Date().toISOString(),
    state: 'AwaitingPayment',
    case_data: {
      caseReference: caseId,
      applicantFirstName: 'Test',
      applicantLastName: 'User',
      paymentStatus: 'pending'
    },
    supplementary_data: {},
    data_classification: {},
    security_classification: 'PUBLIC'
  };

  res.set('Content-Type', 'application/vnd.uk.gov.hmcts.ccd-data-store-api.case.v2+json;charset=UTF-8');
  res.json(caseData);
});

// Get case event token for Probate
// GET /caseworkers/{userId}/jurisdictions/PROBATE/case-types/GrantOfRepresentation/event-triggers/createDraft/token
app.get('/caseworkers/:userId/jurisdictions/:jurisdiction/case-types/:caseType/event-triggers/:eventId/token', (req, res) => {
  const { userId, jurisdiction, caseType, eventId } = req.params;

  res.json({
    token: `mock-token-${Date.now()}`,
    case_details: {
      id: null,
      jurisdiction,
      case_type: caseType
    }
  });
});

// Create case endpoint for Probate
// POST /case-types/GrantOfRepresentation/cases
app.post('/case-types/:caseType/cases', (req, res) => {
  const { caseType } = req.params;
  const newCaseId = `${Date.now()}${Math.floor(Math.random() * 10000)}`;

  res.status(201).json({
    id: newCaseId,
    jurisdiction: 'PROBATE',
    case_type: caseType,
    created_date: new Date().toISOString(),
    last_modified: new Date().toISOString(),
    state: 'Draft',
    case_data: req.body.data || {},
    event: req.body.event || {}
  });
});

// Create case endpoint for Divorce
// POST /case-types/DIVORCE/cases
app.post('/case-types/DIVORCE/cases', (req, res) => {
  const newCaseId = `${Date.now()}${Math.floor(Math.random() * 10000)}`;

  res.status(201).json({
    id: newCaseId,
    jurisdiction: 'DIVORCE',
    case_type: 'DIVORCE',
    created_date: new Date().toISOString(),
    last_modified: new Date().toISOString(),
    state: 'Draft',
    case_data: req.body.data || {},
    event: req.body.event || {}
  });
});

// Search cases endpoint
app.post('/searchCases', (req, res) => {
  res.json({
    total: 0,
    cases: []
  });
});

// Get case by reference with different formats
app.get('/case/:caseRef', (req, res) => {
  const { caseRef } = req.params;

  res.json({
    id: caseRef.replace(/-/g, ''),
    jurisdiction: 'DIVORCE',
    case_type: 'DIVORCE',
    state: 'AwaitingPayment',
    case_data: {
      caseReference: caseRef
    }
  });
});

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path
  });
});

app.listen(PORT, () => {
  console.log(`CCD API Mock Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
