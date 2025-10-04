# CCD API Mock - Integration with ccpay-bubble

## Overview

This mock CCD (Case Data) API server provides the necessary endpoints for ccpay-bubble to validate case references and create test cases during local development.

## Implemented Endpoints

### 1. Case Validation (Main Use Case)
**Endpoint**: `GET /cases/{caseId}`

Used by ccpay-bubble's `PayhubService.validateCaseReference()` function to verify case references.

**ccpay-bubble usage**:
```javascript
// In express/services/PayhubService.js:237
const url = `${ccdUrl}/cases/${req.params.caseref.replace(/-/g, '')}`;
```

**Response format**: CCD API v2 JSON with proper content-type header
```json
{
  "id": "1234567890123456",
  "jurisdiction": "DIVORCE",
  "case_type": "DIVORCE",
  "state": "AwaitingPayment",
  "case_data": { ... }
}
```

### 2. Event Token Generation
**Endpoint**: `GET /caseworkers/{userId}/jurisdictions/{jurisdiction}/case-types/{caseType}/event-triggers/{eventId}/token`

Used in acceptance tests to generate tokens for creating draft cases.

### 3. Case Creation (Probate)
**Endpoint**: `POST /case-types/GrantOfRepresentation/cases`

Creates test Probate cases during E2E testing.

### 4. Case Creation (Divorce)
**Endpoint**: `POST /case-types/DIVORCE/cases`

Creates test Divorce cases during E2E testing.

## Configuration in ccpay-bubble

The ccpay-bubble `config/local.yaml` is already configured to use this mock:

```yaml
ccd:
  url: http://localhost:4452
```

## Running the Mock Server

### Standalone
```bash
cd /Users/chris/dev-cgi/ccd-api-node
npm start
```

Server runs on port 4452 (CCD's default port).

### With Docker
```bash
docker build -t ccd-api-node .
docker run -p 4452:4452 ccd-api-node
```

## Testing the Integration

### 1. Start the mock CCD API
```bash
cd /Users/chris/dev-cgi/ccd-api-node
npm start
```

### 2. Start ccpay-bubble
```bash
cd /Users/chris/dev-cgi/ccpay-bubble
NODE_ENV=local npm start
```

### 3. Test case validation
```bash
curl -H "Authorization: Bearer mock" \
     -H "Accept: application/vnd.uk.gov.hmcts.ccd-data-store-api.case.v2+json" \
     http://localhost:4452/cases/1234567890123456
```

## Local Services Architecture

```
ccpay-bubble (port 3000)
    │
    ├── IDAM → rse-idam-simulator (port 5556)
    │
    └── CCD → ccd-api-node (port 4452)
```

## Additional Mock Services Needed

For full ccpay-bubble functionality, you may also need to mock:
- Payment API (port 8081)
- Refunds API (port 8084)
- Bulk Scan API (port 8090)
- Fees Register API (port 8080)
- S2S (port 8489)
- Notifications API (port 8085)

These can be added as needed based on which features of ccpay-bubble you're testing.
