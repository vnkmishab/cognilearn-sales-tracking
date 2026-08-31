import { Controller, Get, Post, Body, UseInterceptors, UploadedFile, Req, Param } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import type { Request } from 'express';
import { PrismaService } from './prisma.service';

@Controller('employee-portal')
export class EmployeePortalController {
  constructor(private readonly prisma: PrismaService) {}

  private async getEmployeeByEmail(email: string) {
    const userEmail = email || 'john.doe@fieldops.com';
    return this.prisma.employee.findFirst({
      where: { 
        user: { email: userEmail },
        isActive: true
      },
      include: { user: { select: { email: true } } }
    });
  }

  @Get('me')
  async getMyProfile(@Req() req: Request) {
    const email = req.headers['x-user-email'] as string;
    const employee = await this.getEmployeeByEmail(email);
    return employee || { firstName: 'John', lastName: 'Doe', employeeCode: 'EMP-0000' };
  }

  @Get('attendance')
  async getMyAttendance(@Req() req: Request) {
    const email = req.headers['x-user-email'] as string;
    const employee = await this.getEmployeeByEmail(email);
    
    if (!employee) return [];

    return this.prisma.attendanceEvent.findMany({
      where: { employeeId: employee.id },
      orderBy: { checkIn: 'desc' }
    });
  }

  @Get('expenses')
  async getMyExpenses(@Req() req: Request) {
    const email = req.headers['x-user-email'] as string;
    const employee = await this.getEmployeeByEmail(email);
    
    if (!employee) return [];

    return this.prisma.expense.findMany({
      where: { employeeId: employee.id },
      include: { documents: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  @Post('expenses')
  @UseInterceptors(FileInterceptor('proof', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        return cb(null, `${randomName}${extname(file.originalname)}`);
      }
    })
  }))
  async submitExpense(
    @Req() req: Request,
    @Body() data: { category: string; amount: string; description: string },
    @UploadedFile() file: Express.Multer.File
  ) {
    const email = req.headers['x-user-email'] as string;
    const employee = await this.getEmployeeByEmail(email);
    
    if (!employee) throw new Error('Employee not found');

    const expenseCode = `EXP-${Date.now()}`;
    
    const expense = await this.prisma.expense.create({
      data: {
        expenseCode,
        employeeId: employee.id,
        category: data.category,
        billAmount: parseFloat(data.amount),
        description: data.description,
        approvalStatus: 'PENDING',
      }
    });

    if (file) {
      await this.prisma.expenseDocument.create({
        data: {
          expenseId: expense.id,
          type: 'RECEIPT',
          url: `/uploads/${file.filename}`
        }
      });
    }

    return expense;
  }

  @Get('status')
  async getMyStatus(@Req() req: Request) {
    const email = req.headers['x-user-email'] as string;
    const employee = await this.getEmployeeByEmail(email);
    
    if (!employee) return { isCheckedIn: false, hoursThisWeek: 0, checkInTime: null, checkOutTime: null };

    // Find the latest attendance event (could be open or closed)
    const latestEvent = await this.prisma.attendanceEvent.findFirst({
      where: { employeeId: employee.id },
      orderBy: { checkIn: 'desc' }
    });

    // Calculate Hours This Week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const recentEvents = await this.prisma.attendanceEvent.findMany({
      where: {
        employeeId: employee.id,
        checkIn: { gte: oneWeekAgo }
      }
    });

    let totalHours = 0;
    for (const event of recentEvents) {
      if (event.checkOut) {
        const ms = event.checkOut.getTime() - event.checkIn.getTime();
        totalHours += ms / (1000 * 60 * 60);
      } else {
        // currently active
        const ms = new Date().getTime() - event.checkIn.getTime();
        totalHours += ms / (1000 * 60 * 60);
      }
    }

    // Pending Expenses Count
    const pendingExpensesCount = await this.prisma.expense.count({
      where: {
        employeeId: employee.id,
        approvalStatus: 'PENDING'
      }
    });

    // Find the latest site punch to determine if checked in and at which site
    const latestSitePunch = await this.prisma.sitePunch.findFirst({
      where: { employeeId: employee.id },
      orderBy: { syncedAt: 'desc' }
    });
    const isSiteCheckedIn = latestSitePunch ? latestSitePunch.punchType === 'IN' : false;
    const activeSiteId = isSiteCheckedIn ? latestSitePunch?.siteId : null;

    return {
      isCheckedIn: latestEvent ? !latestEvent.checkOut : false,
      isSiteCheckedIn,
      activeSiteId,
      hoursThisWeek: parseFloat(totalHours.toFixed(1)),
      pendingExpenses: pendingExpensesCount,
      checkInTime: latestEvent?.checkIn || null,
      checkOutTime: latestEvent?.checkOut || null,
    };
  }

  @Post('punch')
  async togglePunch(@Req() req: Request) {
    const email = req.headers['x-user-email'] as string;
    const employee = await this.getEmployeeByEmail(email);
    
    if (!employee) throw new Error('Employee not found');

    const openEvent = await this.prisma.attendanceEvent.findFirst({
      where: { 
        employeeId: employee.id,
        checkOut: null 
      },
      orderBy: { checkIn: 'desc' }
    });

    if (openEvent) {
      // Punch Out
      return this.prisma.attendanceEvent.update({
        where: { id: openEvent.id },
        data: { checkOut: new Date() }
      });
    } else {
      // Punch In
      return this.prisma.attendanceEvent.create({
        data: {
          employeeId: employee.id,
          checkIn: new Date(),
        }
      });
    }
  }

  @Post('resign')
  async resignEmployee(@Req() req: Request, @Body() data: { reason: string }) {
    const email = req.headers['x-user-email'] as string;
    const employee = await this.getEmployeeByEmail(email);
    
    if (!employee) throw new Error('Employee not found');

    // Update employee status to inactive and save deletion reason
    await this.prisma.employee.update({
      where: { id: employee.id },
      data: {
        isActive: false,
        deletionReason: `Resigned: ${data.reason}`,
      },
    });

    // Create admin notification
    await this.prisma.notification.create({
      data: {
        title: 'Employee Resignation Received',
        message: `${employee.firstName} ${employee.lastName} (${employee.employeeCode}) has resigned. Reason: "${data.reason}"`,
        type: 'RESIGNATION',
      },
    });

    return { success: true };
  }

  @Get('notifications')
  async getNotifications(@Req() req: Request) {
    const email = req.headers['x-user-email'] as string;
    const employee = await this.getEmployeeByEmail(email);
    if (!employee) return [];

    return this.prisma.notification.findMany({
      where: { employeeId: employee.id },
      orderBy: { createdAt: 'desc' }
    });
  }

  @Post('notifications/:id/read')
  async markNotificationRead(@Param('id') id: string) {
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });
  }
}
