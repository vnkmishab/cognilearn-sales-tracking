import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly prisma: PrismaService) {}

  @Post('check-in')
  async checkIn(@Body() data: { employeeId: string }) {
    const event = await this.prisma.attendanceEvent.create({
      data: {
        employeeId: data.employeeId,
        checkIn: new Date(),
        status: 'Present',
      }
    });

    return {
      status: 'success',
      message: 'Checked in successfully',
      attendanceId: event.id,
    };
  }

  @Post('check-out')
  async checkOut(@Body() data: { attendanceId: string }) {
    const event = await this.prisma.attendanceEvent.update({
      where: { id: data.attendanceId },
      data: { checkOut: new Date() }
    });

    return {
      status: 'success',
      message: 'Checked out successfully',
    };
  }

  @Get('history/:employeeId')
  async getHistory(@Param('employeeId') employeeId: string) {
    return this.prisma.attendanceEvent.findMany({
      where: { employeeId },
      orderBy: { checkIn: 'desc' }
    });
  }

  @Get()
  async getAllAttendance() {
    return this.prisma.attendanceEvent.findMany({
      include: {
        employee: true,
      },
      orderBy: { checkIn: 'desc' },
    });
  }
}
