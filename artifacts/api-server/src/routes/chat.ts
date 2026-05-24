import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, chatMessagesTable } from "@workspace/db";
import {
  ListChatMessagesResponse,
  ListChatMessagesQueryParams,
  SendChatMessageBody,
  SendChatMessageResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

const AI_RESPONSES: Record<string, string> = {
  default: `I've analyzed your request and can help refine the test suite. Here are my suggestions:\n\n**Additional tests I'd recommend:**\n\n1. **Token expiry during long sessions** — Test that the system handles token refresh gracefully without interrupting the user flow.\n\n2. **Concurrent modification detection** — Verify that optimistic locking prevents silent data overwrites when two users edit the same resource simultaneously.\n\n3. **Partial payload acceptance** — Ensure the API accepts valid partial updates and rejects them when required fields are missing.\n\nWould you like me to generate the code for any of these?`,
  payment: `For the payment endpoint, I'll add comprehensive negative tests:\n\n\`\`\`typescript\ndescribe('Payment Endpoint - Negative Tests', () => {\n  test('rejects expired card', async () => {\n    const response = await request(app).post('/api/payment').send({\n      cardNumber: '4000000000000002',\n      expiry: '01/20',\n      amount: 100\n    });\n    expect(response.status).toBe(402);\n    expect(response.body.error).toContain('card_declined');\n  });\n\n  test('rejects zero amount', async () => {\n    const response = await request(app).post('/api/payment').send({\n      amount: 0\n    });\n    expect(response.status).toBe(400);\n  });\n\n  test('rejects negative amount', async () => {\n    const response = await request(app).post('/api/payment').send({\n      amount: -50\n    });\n    expect(response.status).toBe(400);\n  });\n});\n\`\`\`\n\nThese cover the most critical negative paths for payment flows. Want me to add more scenarios like duplicate charge detection or currency validation?`,
  auth: `Here are the 2FA flow tests:\n\n\`\`\`typescript\ndescribe('Two-Factor Authentication Flow', () => {\n  test('sends OTP to registered phone', async () => {\n    const response = await request(app)\n      .post('/api/auth/2fa/send')\n      .set('Authorization', \`Bearer \${userToken}\`);\n    expect(response.status).toBe(200);\n    expect(response.body.method).toBe('sms');\n  });\n\n  test('rejects invalid OTP code', async () => {\n    const response = await request(app)\n      .post('/api/auth/2fa/verify')\n      .send({ code: '000000' });\n    expect(response.status).toBe(401);\n  });\n\n  test('rejects expired OTP (>5 minutes)', async () => {\n    // Mock time to 6 minutes after OTP generation\n    jest.setSystemTime(Date.now() + 6 * 60 * 1000);\n    const response = await request(app)\n      .post('/api/auth/2fa/verify')\n      .send({ code: validOtp });\n    expect(response.status).toBe(401);\n    expect(response.body.error).toBe('otp_expired');\n  });\n\n  test('locks account after 5 failed attempts', async () => {\n    for (let i = 0; i < 5; i++) {\n      await request(app).post('/api/auth/2fa/verify').send({ code: 'wrong' });\n    }\n    const response = await request(app)\n      .post('/api/auth/2fa/verify')\n      .send({ code: 'wrong' });\n    expect(response.status).toBe(423);\n  });\n});\n\`\`\`\n\nThese cover the critical 2FA edge cases. Want me to add backup code tests or SMS delivery failure scenarios?`,
};

function getAIResponse(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("payment")) return AI_RESPONSES.payment;
  if (lower.includes("2fa") || lower.includes("two-factor") || lower.includes("auth")) return AI_RESPONSES.auth;
  return AI_RESPONSES.default;
}

router.get("/chat/messages", async (req, res): Promise<void> => {
  const query = ListChatMessagesQueryParams.safeParse(req.query);
  if (!query.success || !query.data.sessionId) {
    res.status(400).json({ error: "sessionId required" });
    return;
  }
  const messages = await db
    .select()
    .from(chatMessagesTable)
    .where(eq(chatMessagesTable.sessionId, query.data.sessionId))
    .orderBy(chatMessagesTable.createdAt);
  res.json(ListChatMessagesResponse.parse(messages.map(m => ({ ...m, createdAt: m.createdAt.toISOString() }))));
});

router.post("/chat/messages", async (req, res): Promise<void> => {
  const parsed = SendChatMessageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { sessionId, content, projectId, testSuiteId } = parsed.data;

  // Save user message
  await db.insert(chatMessagesTable).values({
    sessionId,
    role: "user",
    content,
    projectId: projectId ?? null,
    testSuiteId: testSuiteId ?? null,
  });

  // Generate AI response
  const aiContent = getAIResponse(content);

  await new Promise(resolve => setTimeout(resolve, 600));

  const [aiMessage] = await db.insert(chatMessagesTable).values({
    sessionId,
    role: "assistant",
    content: aiContent,
    projectId: projectId ?? null,
    testSuiteId: testSuiteId ?? null,
  }).returning();

  res.json(SendChatMessageResponse.parse({ ...aiMessage, createdAt: aiMessage.createdAt.toISOString() }));
});

export default router;
