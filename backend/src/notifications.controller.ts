import { Controller, Get, Post, Param } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getNotifications() {
    return this.prisma.notification.findMany({
      where: { employeeId: null },
      orderBy: { createdAt: 'desc' }
    });
  }

  @Post(':id/read')
  async markAsRead(@Param('id') id: string) {
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });
  }
}
