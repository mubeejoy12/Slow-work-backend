# Slow Work Commons - Backend

## Scalability assumptions (Chapter 1 – DDIA)

**Current main load:**

- Auth:
  - `POST /auth/register` – expected 10–100 requests/day in early stage.
  - `POST /auth/login` – expected 50–500 requests/day as users start coming back.
- Core domain:
  - (Future) `POST /bookings` – expected < 50 requests/day initially.

**Performance targets (local dev & small cloud instance):**

- p95 response time for `POST /auth/register` and `POST /auth/login`:
  - Target: < 300 ms under normal load with a single API instance and single MongoDB node.
- Error rate:
  - Target: < 1% 5xx responses in normal operation.

**First scaling options:**

- Vertical:
  - Increase instance size (more CPU/RAM) for the API or MongoDB node.
- Horizontal:
  - Run 2 API instances behind a load balancer; keep a single MongoDB node for early stages.

These numbers will evolve, but they make the system’s scalability story explicit.
