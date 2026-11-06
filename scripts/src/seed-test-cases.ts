import { db, testCasesTable } from "@workspace/db";
import { sql } from "drizzle-orm";

async function seed() {
  await db.execute(sql`DELETE FROM test_cases`);

  const cases: Array<{
    testSuiteId: number;
    title: string;
    description: string;
    testType: string;
    category: string;
    code: string;
  }> = [
    // Suite 1 - Jest Suite — Products & Auth (18 tests)
    {
      testSuiteId: 1, title: "POST /auth/login returns 200 with valid credentials",
      description: "Verify login endpoint returns JWT token for valid email/password pair",
      testType: "happy_path", category: "authentication",
      code: `test('login with valid credentials', async () => {\n  const res = await request(app).post('/auth/login').send({ email: 'user@test.com', password: 'correct-password' });\n  expect(res.status).toBe(200);\n  expect(res.body).toHaveProperty('token');\n  expect(typeof res.body.token).toBe('string');\n});`,
    },
    {
      testSuiteId: 1, title: "POST /auth/login returns 401 for invalid password",
      description: "Ensure authentication fails with wrong password without revealing user existence",
      testType: "negative", category: "authentication",
      code: `test('rejects invalid password', async () => {\n  const res = await request(app).post('/auth/login').send({ email: 'user@test.com', password: 'wrong-password' });\n  expect(res.status).toBe(401);\n  expect(res.body.error).toMatch(/invalid credentials/i);\n});`,
    },
    {
      testSuiteId: 1, title: "Account locked after 5 failed login attempts",
      description: "Brute force protection — account should lock after 5 consecutive failures",
      testType: "security", category: "authentication",
      code: `test('locks account after 5 failures', async () => {\n  for (let i = 0; i < 5; i++) {\n    await request(app).post('/auth/login').send({ email: 'user@test.com', password: 'wrong' });\n  }\n  const res = await request(app).post('/auth/login').send({ email: 'user@test.com', password: 'correct-password' });\n  expect(res.status).toBe(423);\n  expect(res.body.error).toMatch(/locked/i);\n});`,
    },
    {
      testSuiteId: 1, title: "GET /products returns paginated list",
      description: "Products endpoint returns paginated response with metadata",
      testType: "happy_path", category: "products",
      code: `test('returns paginated products', async () => {\n  const res = await request(app).get('/products?page=1&limit=10');\n  expect(res.status).toBe(200);\n  expect(res.body).toHaveProperty('data');\n  expect(res.body).toHaveProperty('total');\n  expect(res.body).toHaveProperty('page');\n  expect(Array.isArray(res.body.data)).toBe(true);\n  expect(res.body.data.length).toBeLessThanOrEqual(10);\n});`,
    },
    {
      testSuiteId: 1, title: "GET /products filters by category",
      description: "Verify category filter returns only products from that category",
      testType: "happy_path", category: "products",
      code: `test('filters by category', async () => {\n  const res = await request(app).get('/products?category=electronics');\n  expect(res.status).toBe(200);\n  res.body.data.forEach((p: any) => {\n    expect(p.category).toBe('electronics');\n  });\n});`,
    },
    {
      testSuiteId: 1, title: "GET /products rejects invalid page parameter",
      description: "Input validation — page must be a positive integer",
      testType: "boundary", category: "products",
      code: `test('rejects page=0', async () => {\n  const res = await request(app).get('/products?page=0');\n  expect(res.status).toBe(400);\n});\n\ntest('rejects page=-1', async () => {\n  const res = await request(app).get('/products?page=-1');\n  expect(res.status).toBe(400);\n});`,
    },
    {
      testSuiteId: 1, title: "POST /products requires authentication",
      description: "Creating products without a valid JWT should return 401",
      testType: "auth", category: "products",
      code: `test('rejects unauthenticated product creation', async () => {\n  const res = await request(app).post('/products').send({ name: 'Test', price: 9.99 });\n  expect(res.status).toBe(401);\n});`,
    },
    {
      testSuiteId: 1, title: "POST /products validates required fields",
      description: "Missing name or price should return 400 with field errors",
      testType: "negative", category: "products",
      code: `test('rejects missing name', async () => {\n  const res = await request(app)\n    .post('/products')\n    .set('Authorization', 'Bearer ' + adminToken)\n    .send({ price: 9.99 });\n  expect(res.status).toBe(400);\n  expect(res.body.errors).toContainEqual(expect.objectContaining({ field: 'name' }));\n});`,
    },
    {
      testSuiteId: 1, title: "PUT /products/:id returns 404 for nonexistent product",
      description: "Updating a product that doesn't exist should return 404",
      testType: "negative", category: "products",
      code: `test('returns 404 for nonexistent product', async () => {\n  const res = await request(app)\n    .put('/products/99999')\n    .set('Authorization', 'Bearer ' + adminToken)\n    .send({ name: 'Updated' });\n  expect(res.status).toBe(404);\n});`,
    },
    {
      testSuiteId: 1, title: "DELETE /products/:id enforces admin role",
      description: "Regular users cannot delete products — requires admin role",
      testType: "auth", category: "products",
      code: `test('rejects deletion by non-admin', async () => {\n  const res = await request(app)\n    .delete('/products/1')\n    .set('Authorization', 'Bearer ' + userToken);\n  expect(res.status).toBe(403);\n  expect(res.body.error).toMatch(/forbidden/i);\n});`,
    },
    {
      testSuiteId: 1, title: "GET /products search by keyword",
      description: "Keyword search returns matching products across name and description",
      testType: "happy_path", category: "products",
      code: `test('searches by keyword', async () => {\n  const res = await request(app).get('/products?q=wireless');\n  expect(res.status).toBe(200);\n  res.body.data.forEach((p: any) => {\n    const matches = p.name.toLowerCase().includes('wireless') || p.description?.toLowerCase().includes('wireless');\n    expect(matches).toBe(true);\n  });\n});`,
    },
    {
      testSuiteId: 1, title: "Product price must be positive number",
      description: "Price boundary — zero and negative prices are rejected",
      testType: "boundary", category: "products",
      code: `test.each([0, -1, -100])('rejects price=%d', async (price) => {\n  const res = await request(app)\n    .post('/products')\n    .set('Authorization', 'Bearer ' + adminToken)\n    .send({ name: 'Test Product', price });\n  expect(res.status).toBe(400);\n});`,
    },
    {
      testSuiteId: 1, title: "JWT token expires correctly",
      description: "Expired JWT tokens should be rejected with 401",
      testType: "security", category: "authentication",
      code: `test('rejects expired token', async () => {\n  const expiredToken = generateToken({ userId: 1 }, '-1s');\n  const res = await request(app)\n    .get('/products')\n    .set('Authorization', 'Bearer ' + expiredToken);\n  expect(res.status).toBe(401);\n  expect(res.body.error).toMatch(/expired/i);\n});`,
    },
    {
      testSuiteId: 1, title: "Password reset sends email",
      description: "POST /auth/reset-password sends reset link to registered email",
      testType: "happy_path", category: "authentication",
      code: `test('sends reset email', async () => {\n  const spy = jest.spyOn(emailService, 'send');\n  const res = await request(app).post('/auth/reset-password').send({ email: 'user@test.com' });\n  expect(res.status).toBe(200);\n  expect(spy).toHaveBeenCalledWith(expect.objectContaining({ to: 'user@test.com', subject: expect.stringMatching(/reset/i) }));\n});`,
    },
    {
      testSuiteId: 1, title: "Concurrent login attempts are rate limited",
      description: "Rate limiting prevents more than 10 login attempts per minute",
      testType: "concurrent", category: "authentication",
      code: `test('rate limits login', async () => {\n  const attempts = Array.from({ length: 11 }, () =>\n    request(app).post('/auth/login').send({ email: 'x@y.com', password: 'p' })\n  );\n  const results = await Promise.all(attempts);\n  const tooMany = results.filter(r => r.status === 429);\n  expect(tooMany.length).toBeGreaterThan(0);\n});`,
    },
    {
      testSuiteId: 1, title: "SQL injection is prevented on product search",
      description: "Search input is sanitized — SQL injection attempts return normal results",
      testType: "security", category: "products",
      code: `test('sanitizes SQL injection in search', async () => {\n  const res = await request(app).get(\`/products?q='; DROP TABLE products; --\`);\n  expect(res.status).toBe(200);\n  expect(Array.isArray(res.body.data)).toBe(true);\n});`,
    },
    {
      testSuiteId: 1, title: "GET /products returns empty array when none match filter",
      description: "Filter with no results returns 200 with empty array, not 404",
      testType: "boundary", category: "products",
      code: `test('returns empty array for unmatched filter', async () => {\n  const res = await request(app).get('/products?category=nonexistent-category-xyz');\n  expect(res.status).toBe(200);\n  expect(res.body.data).toEqual([]);\n  expect(res.body.total).toBe(0);\n});`,
    },
    {
      testSuiteId: 1, title: "Product inventory is decremented on order",
      description: "When an order is placed, product inventory count is updated atomically",
      testType: "concurrent", category: "products",
      code: `test('decrements inventory atomically', async () => {\n  const product = await createProduct({ inventory: 1 });\n  const [r1, r2] = await Promise.all([\n    request(app).post('/orders').set('Authorization', 'Bearer ' + token).send({ productId: product.id, qty: 1 }),\n    request(app).post('/orders').set('Authorization', 'Bearer ' + token2).send({ productId: product.id, qty: 1 }),\n  ]);\n  const statuses = [r1.status, r2.status].sort();\n  expect(statuses).toEqual([200, 409]);\n});`,
    },

    // Suite 2 - Playwright E2E — Checkout Flow (12 tests)
    {
      testSuiteId: 2, title: "User can add product to cart",
      description: "Clicking Add to Cart button adds item and increments cart badge count",
      testType: "happy_path", category: "cart",
      code: `test('add to cart', async ({ page }) => {\n  await page.goto('/products/1');\n  await page.click('[data-testid="add-to-cart"]');\n  await expect(page.locator('[data-testid="cart-badge"]')).toHaveText('1');\n});`,
    },
    {
      testSuiteId: 2, title: "Cart persists across page reload",
      description: "Cart state is stored in localStorage and survives browser refresh",
      testType: "happy_path", category: "cart",
      code: `test('cart persists on reload', async ({ page }) => {\n  await page.goto('/products/1');\n  await page.click('[data-testid="add-to-cart"]');\n  await page.reload();\n  await expect(page.locator('[data-testid="cart-badge"]')).toHaveText('1');\n});`,
    },
    {
      testSuiteId: 2, title: "Checkout requires user to be signed in",
      description: "Unauthenticated users are redirected to login when clicking Checkout",
      testType: "auth", category: "checkout",
      code: `test('redirects to login on checkout', async ({ page }) => {\n  await page.goto('/cart');\n  await page.click('[data-testid="checkout-btn"]');\n  await expect(page).toHaveURL(/\\/login/);\n});`,
    },
    {
      testSuiteId: 2, title: "Full checkout flow completes successfully",
      description: "End-to-end checkout: cart → shipping → payment → confirmation",
      testType: "happy_path", category: "checkout",
      code: `test('completes checkout', async ({ page }) => {\n  await login(page);\n  await addToCart(page, 'product-1');\n  await page.click('[data-testid="checkout-btn"]');\n  await page.fill('[name="address"]', '123 Main St');\n  await page.fill('[name="city"]', 'Springfield');\n  await page.click('[data-testid="next-step"]');\n  await page.fill('[name="cardNumber"]', '4242424242424242');\n  await page.fill('[name="expiry"]', '12/28');\n  await page.fill('[name="cvv"]', '123');\n  await page.click('[data-testid="place-order"]');\n  await expect(page.locator('[data-testid="order-confirmation"]')).toBeVisible();\n});`,
    },
    {
      testSuiteId: 2, title: "Payment form validates card number format",
      description: "Invalid card numbers are flagged before form submission",
      testType: "negative", category: "checkout",
      code: `test('rejects invalid card number', async ({ page }) => {\n  await goToPaymentStep(page);\n  await page.fill('[name="cardNumber"]', '1234');\n  await page.click('[data-testid="place-order"]');\n  await expect(page.locator('[data-testid="card-error"]')).toBeVisible();\n  await expect(page.locator('[data-testid="card-error"]')).toContainText('Invalid card');\n});`,
    },
    {
      testSuiteId: 2, title: "Out-of-stock products cannot be ordered",
      description: "Add to Cart is disabled for products with zero inventory",
      testType: "boundary", category: "cart",
      code: `test('disables add to cart for out of stock', async ({ page }) => {\n  await page.goto('/products/out-of-stock-id');\n  await expect(page.locator('[data-testid="add-to-cart"]')).toBeDisabled();\n  await expect(page.locator('[data-testid="out-of-stock-badge"]')).toBeVisible();\n});`,
    },
    {
      testSuiteId: 2, title: "Quantity update recalculates cart total",
      description: "Changing item quantity updates the displayed subtotal in real time",
      testType: "happy_path", category: "cart",
      code: `test('quantity change updates total', async ({ page }) => {\n  await login(page);\n  await page.goto('/cart');\n  const initial = await page.locator('[data-testid="cart-total"]').innerText();\n  await page.fill('[data-testid="qty-input"]', '3');\n  await page.keyboard.press('Tab');\n  const updated = await page.locator('[data-testid="cart-total"]').innerText();\n  expect(initial).not.toBe(updated);\n});`,
    },
    {
      testSuiteId: 2, title: "Applying a discount code reduces order total",
      description: "Valid promo codes are applied and the discount is reflected in total",
      testType: "happy_path", category: "checkout",
      code: `test('promo code reduces total', async ({ page }) => {\n  await goToCheckout(page);\n  const totalBefore = await getTotal(page);\n  await page.fill('[data-testid="promo-input"]', 'SAVE20');\n  await page.click('[data-testid="apply-promo"]');\n  const totalAfter = await getTotal(page);\n  expect(parseFloat(totalAfter)).toBeLessThan(parseFloat(totalBefore));\n});`,
    },
    {
      testSuiteId: 2, title: "Expired promo code shows error message",
      description: "Expired or invalid promo codes display an appropriate error",
      testType: "negative", category: "checkout",
      code: `test('expired promo code shows error', async ({ page }) => {\n  await goToCheckout(page);\n  await page.fill('[data-testid="promo-input"]', 'EXPIRED2020');\n  await page.click('[data-testid="apply-promo"]');\n  await expect(page.locator('[data-testid="promo-error"]')).toContainText('invalid or expired');\n});`,
    },
    {
      testSuiteId: 2, title: "Order confirmation shows correct order number",
      description: "Post-checkout confirmation page displays the order ID from the API response",
      testType: "happy_path", category: "checkout",
      code: `test('confirmation shows order number', async ({ page }) => {\n  const orderId = await completeCheckout(page);\n  await expect(page.locator('[data-testid="order-number"]')).toContainText(orderId);\n});`,
    },
    {
      testSuiteId: 2, title: "Back navigation from checkout returns to cart",
      description: "Browser back button during checkout returns user to cart with items intact",
      testType: "happy_path", category: "checkout",
      code: `test('back navigation preserves cart', async ({ page }) => {\n  await goToShippingStep(page);\n  await page.goBack();\n  await expect(page).toHaveURL(/\\/cart/);\n  await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(1);\n});`,
    },
    {
      testSuiteId: 2, title: "Network error during payment shows retry option",
      description: "Payment failures due to network errors display a retry button not a blank screen",
      testType: "negative", category: "checkout",
      code: `test('shows retry on network error', async ({ page }) => {\n  await page.route('**/api/payment', route => route.abort('failed'));\n  await goToPaymentStep(page);\n  await page.click('[data-testid="place-order"]');\n  await expect(page.locator('[data-testid="payment-error"]')).toBeVisible();\n  await expect(page.locator('[data-testid="retry-btn"]')).toBeVisible();\n});`,
    },

    // Suite 3 - Postman Collection — E-Commerce API (24 tests — sample 12)
    {
      testSuiteId: 3, title: "GET /products - 200 OK with items array",
      description: "Products list endpoint returns 200 with data array", testType: "happy_path", category: "products",
      code: `pm.test('Status 200', () => pm.response.to.have.status(200));\npm.test('Response has data array', () => {\n  const json = pm.response.json();\n  pm.expect(json).to.have.property('data').that.is.an('array');\n});`,
    },
    {
      testSuiteId: 3, title: "POST /auth/login - JWT token in response",
      description: "Login returns token string", testType: "happy_path", category: "authentication",
      code: `pm.test('Status 200', () => pm.response.to.have.status(200));\npm.test('Token present', () => {\n  const json = pm.response.json();\n  pm.expect(json.token).to.be.a('string').and.not.be.empty;\n  pm.environment.set('token', json.token);\n});`,
    },
    {
      testSuiteId: 3, title: "POST /orders - Order created with correct status",
      description: "Order creation returns 201 with pending status", testType: "happy_path", category: "orders",
      code: `pm.test('Status 201', () => pm.response.to.have.status(201));\npm.test('Status is pending', () => {\n  pm.expect(pm.response.json().status).to.equal('pending');\n});\npm.environment.set('orderId', pm.response.json().id);`,
    },
    {
      testSuiteId: 3, title: "GET /orders/:id - Returns correct order",
      description: "Fetching order by ID returns matching order data", testType: "happy_path", category: "orders",
      code: `pm.test('Status 200', () => pm.response.to.have.status(200));\npm.test('Order ID matches', () => {\n  pm.expect(pm.response.json().id).to.equal(pm.environment.get('orderId'));\n});`,
    },
    {
      testSuiteId: 3, title: "DELETE /products/:id - 403 for regular user",
      description: "Deleting a product as a non-admin returns 403", testType: "auth", category: "products",
      code: `pm.test('Status 403', () => pm.response.to.have.status(403));\npm.test('Error message present', () => {\n  pm.expect(pm.response.json().error).to.match(/forbidden/i);\n});`,
    },
    {
      testSuiteId: 3, title: "GET /products?q=xyz - Search returns relevant items",
      description: "Keyword search returns items matching the query", testType: "happy_path", category: "search",
      code: `pm.test('Status 200', () => pm.response.to.have.status(200));\npm.test('All results match query', () => {\n  const items = pm.response.json().data;\n  items.forEach(item => {\n    pm.expect(item.name.toLowerCase() + (item.description || '').toLowerCase()).to.include('xyz');\n  });\n});`,
    },
    {
      testSuiteId: 3, title: "POST /products - 400 for missing required fields",
      description: "Missing name or price returns validation error", testType: "negative", category: "products",
      code: `pm.test('Status 400', () => pm.response.to.have.status(400));\npm.test('Errors array present', () => {\n  pm.expect(pm.response.json().errors).to.be.an('array').and.not.be.empty;\n});`,
    },
    {
      testSuiteId: 3, title: "Response time under 500ms for GET /products",
      description: "Products list loads within acceptable time bounds", testType: "boundary", category: "performance",
      code: `pm.test('Response time < 500ms', () => {\n  pm.expect(pm.response.responseTime).to.be.below(500);\n});`,
    },
    {
      testSuiteId: 3, title: "Content-Type header is application/json",
      description: "All API responses have correct content type header", testType: "happy_path", category: "headers",
      code: `pm.test('Content-Type is JSON', () => {\n  pm.response.to.have.header('Content-Type', /application\\/json/);\n});`,
    },
    {
      testSuiteId: 3, title: "GET /products - Rate limit headers present",
      description: "API returns rate limiting headers on each response", testType: "security", category: "rate-limiting",
      code: `pm.test('Rate limit headers present', () => {\n  pm.response.to.have.header('X-RateLimit-Limit');\n  pm.response.to.have.header('X-RateLimit-Remaining');\n});`,
    },
    {
      testSuiteId: 3, title: "CORS headers present for cross-origin requests",
      description: "API allows configured CORS origins", testType: "security", category: "headers",
      code: `pm.test('CORS header present', () => {\n  pm.response.to.have.header('Access-Control-Allow-Origin');\n});`,
    },
    {
      testSuiteId: 3, title: "GET /products?limit=100 - Limit capped at 50",
      description: "Page size cannot exceed maximum of 50 items", testType: "boundary", category: "pagination",
      code: `pm.test('Status 200', () => pm.response.to.have.status(200));\npm.test('Results capped at 50', () => {\n  pm.expect(pm.response.json().data.length).to.be.at.most(50);\n});`,
    },

    // Suite 4 - PyTest Suite — Mobile Backend (15 tests)
    {
      testSuiteId: 4, title: "Push notification registration succeeds",
      description: "POST /devices registers device token and returns 201", testType: "happy_path", category: "notifications",
      code: `def test_register_device(client, auth_headers):\n    resp = client.post('/devices', json={'token': 'abc123', 'platform': 'ios'}, headers=auth_headers)\n    assert resp.status_code == 201\n    assert resp.json()['token'] == 'abc123'`,
    },
    {
      testSuiteId: 4, title: "Push notification fails for invalid token format",
      description: "Device tokens must be non-empty strings", testType: "negative", category: "notifications",
      code: `def test_register_invalid_token(client, auth_headers):\n    resp = client.post('/devices', json={'token': '', 'platform': 'ios'}, headers=auth_headers)\n    assert resp.status_code == 400\n    assert 'token' in resp.json()['errors'][0]['field']`,
    },
    {
      testSuiteId: 4, title: "Mobile user profile fetch returns correct fields",
      description: "GET /me returns id, email, name, avatar_url fields", testType: "happy_path", category: "profile",
      code: `def test_get_profile(client, auth_headers):\n    resp = client.get('/me', headers=auth_headers)\n    assert resp.status_code == 200\n    data = resp.json()\n    assert all(k in data for k in ('id', 'email', 'name', 'avatar_url'))`,
    },
    {
      testSuiteId: 4, title: "Upload profile photo accepts JPEG under 5MB",
      description: "Valid JPEG uploads succeed and return image URL", testType: "happy_path", category: "media",
      code: `def test_upload_photo_valid(client, auth_headers, jpeg_fixture):\n    resp = client.post('/me/photo', files={'photo': jpeg_fixture}, headers=auth_headers)\n    assert resp.status_code == 200\n    assert resp.json()['avatar_url'].startswith('https://')`,
    },
    {
      testSuiteId: 4, title: "Upload photo rejects files over 5MB",
      description: "Large file uploads are rejected with 413 Payload Too Large", testType: "boundary", category: "media",
      code: `def test_upload_photo_too_large(client, auth_headers, large_file_fixture):\n    resp = client.post('/me/photo', files={'photo': large_file_fixture}, headers=auth_headers)\n    assert resp.status_code == 413`,
    },
    {
      testSuiteId: 4, title: "Offline sync returns delta since last sync timestamp",
      description: "GET /sync?since=<ts> returns only records modified after that timestamp", testType: "happy_path", category: "sync",
      code: `def test_sync_delta(client, auth_headers):\n    resp = client.get('/sync?since=2025-01-01T00:00:00Z', headers=auth_headers)\n    assert resp.status_code == 200\n    data = resp.json()\n    assert 'updated' in data\n    assert 'deleted' in data\n    for item in data['updated']:\n        assert item['updatedAt'] >= '2025-01-01T00:00:00Z'`,
    },
    {
      testSuiteId: 4, title: "Refresh token rotates on use",
      description: "Using a refresh token returns a new pair and invalidates the old one", testType: "security", category: "authentication",
      code: `def test_refresh_token_rotation(client):\n    r1 = client.post('/auth/refresh', json={'refreshToken': valid_refresh_token}).json()\n    r2 = client.post('/auth/refresh', json={'refreshToken': valid_refresh_token})\n    assert r2.status_code == 401  # Old token is now invalid`,
    },
    {
      testSuiteId: 4, title: "Expired access token is rejected",
      description: "Expired JWT returns 401 with 'token_expired' error code", testType: "security", category: "authentication",
      code: `def test_expired_token(client, expired_token):\n    resp = client.get('/me', headers={'Authorization': f'Bearer {expired_token}'})\n    assert resp.status_code == 401\n    assert resp.json()['code'] == 'token_expired'`,
    },
    {
      testSuiteId: 4, title: "Mobile app version gate rejects old clients",
      description: "Requests from client versions below minimum are rejected with 426", testType: "boundary", category: "versioning",
      code: `def test_old_client_rejected(client):\n    resp = client.get('/products', headers={'X-App-Version': '1.0.0'})\n    assert resp.status_code == 426\n    assert 'minimum_version' in resp.json()`,
    },
    {
      testSuiteId: 4, title: "Search results are sorted by relevance",
      description: "Search endpoint returns results in relevance score order (descending)", testType: "happy_path", category: "search",
      code: `def test_search_sorted_by_relevance(client):\n    resp = client.get('/search?q=wireless+headphones')\n    assert resp.status_code == 200\n    scores = [item['score'] for item in resp.json()['results']]\n    assert scores == sorted(scores, reverse=True)`,
    },
    {
      testSuiteId: 4, title: "Concurrent sync requests handled safely",
      description: "Two simultaneous sync requests don't produce duplicate or missing records", testType: "concurrent", category: "sync",
      code: `def test_concurrent_sync(client, auth_headers):\n    import threading\n    results = []\n    def do_sync():\n        r = client.get('/sync?since=2024-01-01T00:00:00Z', headers=auth_headers)\n        results.append(r.json())\n    threads = [threading.Thread(target=do_sync) for _ in range(3)]\n    [t.start() for t in threads]\n    [t.join() for t in threads]\n    ids_per_call = [set(i['id'] for i in r['updated']) for r in results]\n    assert ids_per_call[0] == ids_per_call[1] == ids_per_call[2]`,
    },
    {
      testSuiteId: 4, title: "DELETE account permanently removes user data",
      description: "Account deletion removes user from DB and revokes all tokens", testType: "happy_path", category: "account",
      code: `def test_delete_account(client, auth_headers, user_token):\n    resp = client.delete('/me', headers=auth_headers)\n    assert resp.status_code == 200\n    follow_up = client.get('/me', headers={'Authorization': f'Bearer {user_token}'})\n    assert follow_up.status_code == 401`,
    },
    {
      testSuiteId: 4, title: "Language preference persists across sessions",
      description: "Setting locale preference is returned in subsequent profile fetches", testType: "happy_path", category: "preferences",
      code: `def test_locale_persistence(client, auth_headers):\n    client.patch('/me', json={'locale': 'es'}, headers=auth_headers)\n    resp = client.get('/me', headers=auth_headers)\n    assert resp.json()['locale'] == 'es'`,
    },
    {
      testSuiteId: 4, title: "XSS injection in profile name is sanitized",
      description: "Display name is sanitized — script tags are escaped not executed", testType: "security", category: "security",
      code: `def test_xss_sanitization(client, auth_headers):\n    payload = '<script>alert(1)</script>'\n    client.patch('/me', json={'name': payload}, headers=auth_headers)\n    resp = client.get('/me', headers=auth_headers)\n    assert '<script>' not in resp.json()['name']`,
    },
    {
      testSuiteId: 4, title: "Rate limit returns 429 after 100 req/min",
      description: "API enforces per-user rate limiting and returns proper 429 response", testType: "security", category: "rate-limiting",
      code: `def test_rate_limiting(client, auth_headers):\n    for _ in range(100):\n        client.get('/products', headers=auth_headers)\n    resp = client.get('/products', headers=auth_headers)\n    assert resp.status_code == 429\n    assert 'Retry-After' in resp.headers`,
    },

    // Suite 5 - JUnit 5 Suite — Auth Service (20 tests — sample 12)
    {
      testSuiteId: 5, title: "Valid credentials return signed JWT",
      description: "AuthService.login returns a JWT signed with RS256", testType: "happy_path", category: "authentication",
      code: `@Test\nvoid loginWithValidCredentials_returnsJwt() {\n    LoginResponse res = authService.login("user@test.com", "Password123!");\n    assertNotNull(res.getToken());\n    assertTrue(jwtUtil.isValid(res.getToken()));\n}`,
    },
    {
      testSuiteId: 5, title: "Invalid password throws AuthenticationException",
      description: "Wrong password results in AuthenticationException, not NPE", testType: "negative", category: "authentication",
      code: `@Test\nvoid loginWithWrongPassword_throwsAuthenticationException() {\n    assertThrows(AuthenticationException.class, () ->\n        authService.login("user@test.com", "wrong-password")\n    );\n}`,
    },
    {
      testSuiteId: 5, title: "Token validation rejects tampered signature",
      description: "Modified JWT signature is detected and rejected", testType: "security", category: "jwt",
      code: `@Test\nvoid tamperedToken_isRejected() {\n    String valid = tokenService.generate(user);\n    String tampered = valid.substring(0, valid.length() - 5) + "XXXXX";\n    assertFalse(tokenService.validate(tampered));\n}`,
    },
    {
      testSuiteId: 5, title: "Role-based access control enforces permissions",
      description: "ADMIN role grants access to admin endpoint; USER role is denied", testType: "auth", category: "rbac",
      code: `@Test\nvoid adminEndpoint_allowsAdminDeniesUser() {\n    assertDoesNotThrow(() -> rbacService.assertAccess(adminUser, "MANAGE_USERS"));\n    assertThrows(AccessDeniedException.class, () ->\n        rbacService.assertAccess(regularUser, "MANAGE_USERS")\n    );\n}`,
    },
    {
      testSuiteId: 5, title: "Password hashing uses BCrypt with cost factor >= 12",
      description: "Stored passwords are BCrypt hashed with strength >= 12", testType: "security", category: "passwords",
      code: `@Test\nvoid passwordIsHashedWithBcrypt() {\n    User saved = userService.create("test@test.com", "Password123!");\n    assertTrue(saved.getPasswordHash().startsWith("$2b$12$"));\n    assertFalse(saved.getPasswordHash().contains("Password123!"));\n}`,
    },
    {
      testSuiteId: 5, title: "Refresh token is invalidated after use (rotation)",
      description: "Refresh tokens are single-use; replay returns 401", testType: "security", category: "jwt",
      code: `@Test\nvoid refreshTokenRotation_preventsReplay() {\n    TokenPair pair1 = tokenService.refresh(validRefreshToken);\n    assertThrows(InvalidTokenException.class, () ->\n        tokenService.refresh(validRefreshToken) // old token\n    );\n}`,
    },
    {
      testSuiteId: 5, title: "OAuth2 Google flow issues internal JWT",
      description: "Google OAuth callback results in an internal signed JWT", testType: "happy_path", category: "oauth",
      code: `@Test\nvoid googleOauthCallback_issuesInternalToken() {\n    when(googleService.verifyIdToken(anyString())).thenReturn(googleProfile);\n    LoginResponse res = oauthService.handleCallback("google", "id-token-from-google");\n    assertNotNull(res.getToken());\n    assertEquals("user@gmail.com", tokenService.extractEmail(res.getToken()));\n}`,
    },
    {
      testSuiteId: 5, title: "Account lockout resets after 15 minutes",
      description: "Locked account becomes accessible again after lock window expires", testType: "boundary", category: "authentication",
      code: `@Test\nvoid accountUnlocksAfterLockWindow() {\n    lockoutService.lock(user, Instant.now().minusSeconds(901));\n    assertDoesNotThrow(() -> authService.login("user@test.com", "Password123!"));\n}`,
    },
    {
      testSuiteId: 5, title: "Concurrent login attempts are serialized per user",
      description: "Distributed lock prevents race condition on account lockout counter", testType: "concurrent", category: "authentication",
      code: `@Test\nvoid concurrentLoginAttempts_areSafe() throws Exception {\n    int threads = 10;\n    ExecutorService exec = Executors.newFixedThreadPool(threads);\n    List<Future<?>> futures = IntStream.range(0, threads)\n        .mapToObj(i -> exec.submit(() -> authService.login("u@test.com", "wrong")))\n        .collect(toList());\n    // All should throw, none should crash or corrupt state\n    futures.forEach(f -> assertThrows(ExecutionException.class, f::get));\n}`,
    },
    {
      testSuiteId: 5, title: "Audit log records successful login events",
      description: "Every successful login creates an audit entry with user ID and timestamp", testType: "happy_path", category: "audit",
      code: `@Test\nvoid successfulLogin_createsAuditEntry() {\n    authService.login("user@test.com", "Password123!");\n    List<AuditEntry> logs = auditService.findByUser(userId);\n    assertTrue(logs.stream().anyMatch(e -> e.getAction().equals("LOGIN_SUCCESS")));\n}`,
    },
    {
      testSuiteId: 5, title: "Token claims include user ID and roles",
      description: "Generated JWT contains sub (userId) and roles claims", testType: "happy_path", category: "jwt",
      code: `@Test\nvoid generatedToken_containsExpectedClaims() {\n    String token = tokenService.generate(user);\n    Claims claims = tokenService.parse(token);\n    assertEquals(user.getId().toString(), claims.getSubject());\n    assertNotNull(claims.get("roles"));\n}`,
    },
    {
      testSuiteId: 5, title: "PKCE code verifier prevents authorization code interception",
      description: "Auth code flow with PKCE rejects requests without matching code_verifier", testType: "security", category: "oauth",
      code: `@Test\nvoid pkce_rejectsWrongCodeVerifier() {\n    String codeChallenge = pkceService.generateChallenge("correct-verifier");\n    String authCode = oauthService.issueCode(user, codeChallenge);\n    assertThrows(PKCEVerificationException.class, () ->\n        oauthService.exchangeCode(authCode, "wrong-verifier")\n    );\n}`,
    },

    // Suite 6 - Cypress E2E — Login Flows (9 tests)
    {
      testSuiteId: 6, title: "Login form renders all required fields",
      description: "Email, password fields and submit button are present on load", testType: "happy_path", category: "ui",
      code: `it('renders login form', () => {\n  cy.visit('/login');\n  cy.get('[data-cy="email-input"]').should('be.visible');\n  cy.get('[data-cy="password-input"]').should('be.visible');\n  cy.get('[data-cy="login-btn"]').should('be.visible');\n});`,
    },
    {
      testSuiteId: 6, title: "Successful login redirects to dashboard",
      description: "Valid credentials → redirect to /dashboard", testType: "happy_path", category: "authentication",
      code: `it('redirects to dashboard on login', () => {\n  cy.visit('/login');\n  cy.get('[data-cy="email-input"]').type('admin@test.com');\n  cy.get('[data-cy="password-input"]').type('Admin123!');\n  cy.get('[data-cy="login-btn"]').click();\n  cy.url().should('include', '/dashboard');\n});`,
    },
    {
      testSuiteId: 6, title: "Invalid credentials show error toast",
      description: "Wrong password displays error notification without crashing", testType: "negative", category: "authentication",
      code: `it('shows error toast on bad credentials', () => {\n  cy.visit('/login');\n  cy.get('[data-cy="email-input"]').type('user@test.com');\n  cy.get('[data-cy="password-input"]').type('wrongpassword');\n  cy.get('[data-cy="login-btn"]').click();\n  cy.get('[data-cy="toast-error"]').should('contain', 'Invalid credentials');\n});`,
    },
    {
      testSuiteId: 6, title: "Remember me persists session across browser close",
      description: "Checking 'Remember me' stores long-lived cookie", testType: "happy_path", category: "authentication",
      code: `it('persists session with remember me', () => {\n  cy.visit('/login');\n  cy.get('[data-cy="email-input"]').type('user@test.com');\n  cy.get('[data-cy="password-input"]').type('Password123!');\n  cy.get('[data-cy="remember-me"]').check();\n  cy.get('[data-cy="login-btn"]').click();\n  cy.getCookie('auth_token').should('have.property', 'expiry').and('be.greaterThan', 0);\n});`,
    },
    {
      testSuiteId: 6, title: "Password field is masked (type=password)",
      description: "Password input type is 'password' so characters are hidden", testType: "security", category: "ui",
      code: `it('masks password field', () => {\n  cy.visit('/login');\n  cy.get('[data-cy="password-input"]').should('have.attr', 'type', 'password');\n});`,
    },
    {
      testSuiteId: 6, title: "Login form submits on Enter keypress",
      description: "Pressing Enter in password field submits the form", testType: "happy_path", category: "ui",
      code: `it('submits on Enter key', () => {\n  cy.visit('/login');\n  cy.get('[data-cy="email-input"]').type('user@test.com');\n  cy.get('[data-cy="password-input"]').type('Password123!{enter}');\n  cy.url().should('include', '/dashboard');\n});`,
    },
    {
      testSuiteId: 6, title: "Forgot password link navigates to reset page",
      description: "Clicking 'Forgot password?' link routes to /reset-password", testType: "happy_path", category: "authentication",
      code: `it('forgot password link works', () => {\n  cy.visit('/login');\n  cy.get('[data-cy="forgot-password-link"]').click();\n  cy.url().should('include', '/reset-password');\n});`,
    },
    {
      testSuiteId: 6, title: "Logout clears session and redirects to login",
      description: "Clicking logout invalidates session and redirects to /login", testType: "happy_path", category: "authentication",
      code: `it('logout clears session', () => {\n  cy.login('user@test.com', 'Password123!');\n  cy.visit('/dashboard');\n  cy.get('[data-cy="logout-btn"]').click();\n  cy.url().should('include', '/login');\n  cy.getCookie('auth_token').should('not.exist');\n});`,
    },
    {
      testSuiteId: 6, title: "Login blocked after 5 failed attempts (UI lockout)",
      description: "Submit button is disabled after 5 failures with countdown displayed", testType: "security", category: "authentication",
      code: `it('disables login after 5 failures', () => {\n  for (let i = 0; i < 5; i++) {\n    cy.visit('/login');\n    cy.get('[data-cy="email-input"]').type('user@test.com');\n    cy.get('[data-cy="password-input"]').type('wrong');\n    cy.get('[data-cy="login-btn"]').click();\n  }\n  cy.get('[data-cy="login-btn"]').should('be.disabled');\n  cy.get('[data-cy="lockout-message"]').should('be.visible');\n});`,
    },

    // Suite 7 - Jest Suite generated from wizard (16 tests)
    {
      testSuiteId: 7, title: "AC-001: User can authenticate with email and password",
      description: "Core auth requirement — login endpoint accepts valid credentials", testType: "happy_path", category: "authentication",
      code: `test('AC-001 login with email/password', async () => {\n  const res = await request(app).post('/auth/login').send({ email: 'user@test.com', password: 'pass123' });\n  expect(res.status).toBe(200);\n  expect(res.body.token).toBeDefined();\n});`,
    },
    {
      testSuiteId: 7, title: "AC-002: Account locks after 5 failed login attempts",
      description: "Brute force protection from PRD requirement AC-002", testType: "security", category: "authentication",
      code: `test('AC-002 lockout after 5 failures', async () => {\n  for (let i = 0; i < 5; i++) {\n    await request(app).post('/auth/login').send({ email: 'user@test.com', password: 'bad' });\n  }\n  const res = await request(app).post('/auth/login').send({ email: 'user@test.com', password: 'pass123' });\n  expect(res.status).toBe(423);\n});`,
    },
    {
      testSuiteId: 7, title: "AC-003: Password reset via email link",
      description: "PRD requirement AC-003 — email-based password reset", testType: "happy_path", category: "authentication",
      code: `test('AC-003 password reset email', async () => {\n  const mockSend = jest.fn();\n  jest.mock('./emailService', () => ({ send: mockSend }));\n  await request(app).post('/auth/reset-password').send({ email: 'user@test.com' });\n  expect(mockSend).toHaveBeenCalled();\n});`,
    },
    {
      testSuiteId: 7, title: "AC-004: Product listing returns paginated results",
      description: "PRD requirement AC-004 — paginated product catalog", testType: "happy_path", category: "products",
      code: `test('AC-004 paginated products', async () => {\n  const res = await request(app).get('/products?page=1&limit=10');\n  expect(res.status).toBe(200);\n  expect(res.body).toHaveProperty('data');\n  expect(res.body).toHaveProperty('page');\n  expect(res.body).toHaveProperty('total');\n});`,
    },
    {
      testSuiteId: 7, title: "AC-005: Filter products by category and price range",
      description: "PRD requirement AC-005 — category and price filters", testType: "happy_path", category: "products",
      code: `test('AC-005 filter by category and price', async () => {\n  const res = await request(app).get('/products?category=shoes&minPrice=20&maxPrice=200');\n  expect(res.status).toBe(200);\n  res.body.data.forEach((p: any) => {\n    expect(p.category).toBe('shoes');\n    expect(p.price).toBeGreaterThanOrEqual(20);\n    expect(p.price).toBeLessThanOrEqual(200);\n  });\n});`,
    },
    {
      testSuiteId: 7, title: "AC-006: Product keyword search",
      description: "PRD requirement AC-006 — full-text search across product catalog", testType: "happy_path", category: "products",
      code: `test('AC-006 keyword search', async () => {\n  const res = await request(app).get('/products?q=wireless');\n  expect(res.status).toBe(200);\n  expect(res.body.data.length).toBeGreaterThan(0);\n});`,
    },
    {
      testSuiteId: 7, title: "OpenAPI: GET /products matches spec schema",
      description: "Response shape conforms to OpenAPI 3.1 spec definition", testType: "happy_path", category: "spec-compliance",
      code: `test('GET /products matches OpenAPI schema', async () => {\n  const res = await request(app).get('/products');\n  expect(res.status).toBe(200);\n  const valid = ajv.validate(productListSchema, res.body);\n  expect(valid).toBe(true);\n  if (!valid) console.error(ajv.errors);\n});`,
    },
    {
      testSuiteId: 7, title: "OpenAPI: POST /orders schema validation",
      description: "Order creation body is validated against spec schema before processing", testType: "negative", category: "spec-compliance",
      code: `test('POST /orders validates against spec', async () => {\n  const res = await request(app).post('/orders').set('Authorization', 'Bearer ' + token).send({ invalid: true });\n  expect(res.status).toBe(400);\n  expect(res.body.errors).toBeDefined();\n});`,
    },
    {
      testSuiteId: 7, title: "Checkout flow: user navigates cart → shipping → payment",
      description: "Multi-step checkout state machine follows correct step sequence", testType: "happy_path", category: "checkout",
      code: `test('checkout multi-step flow', async () => {\n  let state = { step: 'cart', items: [{ id: 1, qty: 2 }] };\n  state = await checkoutService.nextStep(state);\n  expect(state.step).toBe('shipping');\n  state.shipping = { address: '123 Main', city: 'NYC' };\n  state = await checkoutService.nextStep(state);\n  expect(state.step).toBe('payment');\n});`,
    },
    {
      testSuiteId: 7, title: "Edge: Empty cart cannot proceed to checkout",
      description: "Checkout initiation with empty cart returns validation error", testType: "boundary", category: "checkout",
      code: `test('empty cart blocked at checkout', async () => {\n  const res = await request(app)\n    .post('/checkout/init')\n    .set('Authorization', 'Bearer ' + token)\n    .send({ items: [] });\n  expect(res.status).toBe(422);\n  expect(res.body.error).toMatch(/cart is empty/i);\n});`,
    },
    {
      testSuiteId: 7, title: "Edge: Maximum cart quantity enforced",
      description: "Cannot add more than 99 units of a single product to cart", testType: "boundary", category: "cart",
      code: `test('max quantity per product enforced', async () => {\n  const res = await request(app)\n    .post('/cart/items')\n    .set('Authorization', 'Bearer ' + token)\n    .send({ productId: 1, quantity: 100 });\n  expect(res.status).toBe(422);\n});`,
    },
    {
      testSuiteId: 7, title: "Edge: Negative price product cannot be purchased",
      description: "Products with negative prices are blocked at checkout", testType: "security", category: "checkout",
      code: `test('negative price product blocked', async () => {\n  const badProduct = await createProduct({ price: -1 });\n  const res = await request(app)\n    .post('/cart/items')\n    .set('Authorization', 'Bearer ' + token)\n    .send({ productId: badProduct.id, quantity: 1 });\n  expect(res.status).toBe(422);\n});`,
    },
    {
      testSuiteId: 7, title: "Edge: Concurrent checkout with last inventory item",
      description: "Two simultaneous checkouts for the last item — exactly one succeeds", testType: "concurrent", category: "inventory",
      code: `test('concurrent purchase of last item', async () => {\n  const product = await createProduct({ inventory: 1 });\n  const [r1, r2] = await Promise.all([\n    checkoutWithProduct(token1, product.id),\n    checkoutWithProduct(token2, product.id),\n  ]);\n  const statuses = [r1.status, r2.status].sort();\n  expect(statuses).toEqual([200, 409]);\n});`,
    },
    {
      testSuiteId: 7, title: "Edge: SQL injection in search is sanitized",
      description: "Search input with SQL injection characters returns safe empty result", testType: "security", category: "security",
      code: `test('search SQL injection sanitized', async () => {\n  const res = await request(app).get(\`/products?q=' OR '1'='1\`);\n  expect(res.status).toBe(200);\n  expect(Array.isArray(res.body.data)).toBe(true);\n});`,
    },
    {
      testSuiteId: 7, title: "Edge: XSS in product name is escaped",
      description: "Product names with script tags are HTML-escaped in responses", testType: "security", category: "security",
      code: `test('product name XSS is escaped', async () => {\n  const res = await request(app).get('/products/xss-product-id');\n  expect(res.status).toBe(200);\n  expect(res.body.name).not.toContain('<script>');\n});`,
    },
    {
      testSuiteId: 7, title: "Edge: Duplicate order submission returns idempotent result",
      description: "Submitting same order twice (same idempotency key) returns same order", testType: "concurrent", category: "orders",
      code: `test('idempotent order submission', async () => {\n  const key = 'order-key-abc';\n  const [r1, r2] = await Promise.all([\n    request(app).post('/orders').set('Idempotency-Key', key).set('Authorization', 'Bearer ' + token).send(orderPayload),\n    request(app).post('/orders').set('Idempotency-Key', key).set('Authorization', 'Bearer ' + token).send(orderPayload),\n  ]);\n  expect(r1.status).toBe(201);\n  expect(r2.status).toBe(201);\n  expect(r1.body.id).toBe(r2.body.id);\n});`,
    },
  ];

  console.log(`Inserting ${cases.length} test cases...`);
  await db.insert(testCasesTable).values(cases);
  console.log("Done.");
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
