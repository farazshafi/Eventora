import { describe, expect, it, vi } from 'vitest';
import { ResendEmailService } from '../src/services/email.service.js';

describe('ResendEmailService', () => {
  it('sends email through the Resend HTTPS API', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status: 200 }));
    const email = new ResendEmailService(fetcher, 're_test_key', 'Eventora <no-reply@example.com>');

    await email.send('person@example.com', 'Verify your email', 'Your code is 123456');

    expect(fetcher).toHaveBeenCalledWith('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer re_test_key',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Eventora <no-reply@example.com>',
        to: ['person@example.com'],
        subject: 'Verify your email',
        text: 'Your code is 123456',
      }),
    });
  });

  it('rejects sends when configuration is missing', async () => {
    const fetcher = vi.fn<typeof fetch>();
    const email = new ResendEmailService(fetcher, '', '');

    await expect(email.send('person@example.com', 'Subject', 'Body')).rejects.toThrow(
      'Resend email is not configured',
    );
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('surfaces Resend API failures', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json({ message: 'The sender domain is not verified' }, { status: 403 }),
    );
    const email = new ResendEmailService(fetcher, 're_test_key', 'Eventora <no-reply@example.com>');

    await expect(email.send('person@example.com', 'Subject', 'Body')).rejects.toThrow(
      'The sender domain is not verified',
    );
  });
});
