import { env } from '../config/env.js';
import type { BookingRecord } from '../types/booking.types.js';
import type { EmailService } from './interfaces/auth-services.interface.js';
import type { UserRepository } from '../repositories/interfaces/user.repository.interface.js';
import type { ServiceRepository } from '../repositories/interfaces/service.repository.interface.js';

export class BookingNotificationService {
  constructor(
    private readonly users: UserRepository,
    private readonly services: ServiceRepository,
    private readonly email: EmailService,
  ) {}
  async created(booking: BookingRecord): Promise<void> {
    const [user, service] = await Promise.all([
      this.users.findById(booking.userId),
      this.services.findById(booking.serviceId),
    ]);
    if (!env.ADMIN_EMAIL || !user || !service) return;
    await this.email.send(
      env.ADMIN_EMAIL,
      `New Eventora booking: ${service.title}`,
      `${user.name} (${user.email}) requested ${service.title} from ${booking.startDate.toDateString()} to ${booking.endDate.toDateString()}. Total: ${booking.totalPrice}.`,
    );
  }
  async statusChanged(booking: BookingRecord & { previousStatus?: string }): Promise<void> {
    if (booking.status !== 'CONFIRMED' && booking.status !== 'CANCELLED') return;
    const [user, service] = await Promise.all([
      this.users.findById(booking.userId),
      this.services.findById(booking.serviceId),
    ]);
    if (!user || !service) return;
    const decision =
      booking.status === 'CONFIRMED'
        ? 'approved'
        : booking.previousStatus === 'PENDING'
          ? 'rejected'
          : 'cancelled';
    await this.email.send(
      user.email,
      `Your Eventora booking was ${decision}`,
      `Your booking for ${service.title} from ${booking.startDate.toDateString()} to ${booking.endDate.toDateString()} was ${decision}.`,
    );
  }
}
