# CCD API Mock Server

A Node.js/Express mock implementation of the CCD (Case Data) API for local development of ccpay-bubble.

## Features

This mock server implements the following CCD API endpoints needed by ccpay-bubble:

- **Case Validation**: `GET /cases/{caseId}` - Validates case references
- **Event Tokens**: `GET /caseworkers/{userId}/jurisdictions/{jurisdiction}/case-types/{caseType}/event-triggers/{eventId}/token` - Generates event tokens
- **Case Creation**: `POST /case-types/{caseType}/cases` - Creates new cases for Probate and Divorce
- **Health Check**: `GET /health` - Service health status

## Installation

```bash
npm install
```

## Running

### Development mode
```bash
npm start
```

### With Docker
```bash
docker build -t ccd-api-node .
docker run -p 4452:4452 ccd-api-node
```

## Endpoints

### Health Check
```bash
curl http://localhost:4452/health
```

### Validate Case Reference
```bash
curl http://localhost:4452/cases/1234567890123456 \
  -H "Authorization: Bearer mock-token" \
  -H "Accept: application/vnd.uk.gov.hmcts.ccd-data-store-api.case.v2+json;charset=UTF-8"
```

### Get Event Token (Probate)
```bash
curl http://localhost:4452/caseworkers/123/jurisdictions/PROBATE/case-types/GrantOfRepresentation/event-triggers/createDraft/token \
  -H "Authorization: Bearer mock-token"
```

### Create Case (Divorce)
```bash
curl -X POST http://localhost:4452/case-types/DIVORCE/cases \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer mock-token" \
  -d '{"data": {"applicantFirstName": "John"}}'
```

## Configuration

Default port: 4452 (matches CCD default)

Override with environment variable:
```bash
PORT=8080 npm start
```

## Integration with ccpay-bubble

Update `ccpay-bubble/config/local.yaml`:

```yaml
ccd:
  url: http://localhost:4452
```

## Response Formats

All responses follow the CCD API v2 specification with appropriate headers and JSON structure.
