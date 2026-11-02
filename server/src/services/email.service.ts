import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import type { EmailService } from './interfaces/auth-services.interface.js';

export class SmtpEmailService2 implements EmailService {
  async send(to: string, subject: string, text: string): Promise<void> {
    if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS || !env.SMTP_FROM)
      throw new Error('SMTP email is not configured');
    const transport = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    });
    await transport.sendMail({ from: env.SMTP_FROM, to, subject, text });
  }
}
