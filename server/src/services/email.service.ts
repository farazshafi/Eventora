import { env } from '../config/env.js';
import type { EmailService } from './interfaces/auth-services.interface.js';

type ResendResponse = { id?: string; message?: string };

export class ResendEmailService implements EmailService {
  constructor(
    private readonly fetcher: typeof fetch = fetch,
    private readonly apiKey = env.RESEND_API_KEY,
    private readonly from = env.RESEND_FROM,
  ) {}

  async send(to: string, subject: string, text: string): Promise<void> {
    if (!this.apiKey || !this.from) throw new Error('Resend email is not configured');

    const response = await this.fetcher('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: this.from, to: [to], subject, text }),
    });

    if (!response.ok) {
      const details = (await response.json().catch(() => ({}))) as ResendResponse;
      throw new Error(details.message ?? `Resend email request failed (${response.status})`);
    }
  }
}
