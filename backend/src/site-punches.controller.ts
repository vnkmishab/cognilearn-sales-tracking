import { Controller, Post, Body, Get } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Controller('site-punches')
export class SitePunchesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getAllSitePunches() {
    return this.prisma.sitePunch.findMany({
      include: {
        employee: true,
        site: true,
      },
      orderBy: { syncedAt: 'desc' },
    });
  }

  @Post('sync')
  async syncOfflinePunches(@Body() data: { punches: any[] }) {
    const punches = data.punches || [];
    const results = [];

    for (const punch of punches) {
      const { clientPunchId, employeeId, siteId, punchType, latitude, longitude, gpsAccuracy, deviceId, timestamp } = punch;
      const punchTime = timestamp ? new Date(timestamp) : new Date();
      
      const existing = await this.prisma.sitePunch.findUnique({ where: { clientPunchId } });
      
      if (!existing) {
        // Find employee ID mapping
        const employee = await this.prisma.employee.findUnique({
          where: { employeeCode: employeeId }
        });

        if (employee) {
          // 1. Create the SitePunch audit record
          await this.prisma.sitePunch.create({
            data: {
              clientPunchId,
              employeeId: employee.id, // Map code to internal ID
              siteId,
              punchType,
              latitude,
              longitude,
              gpsAccuracy,
              deviceId,
              syncedAt: punchTime
            }
          });

          // 2. Sync to AttendanceEvent to update dashboard status
          if (punchType === 'IN') {
            await this.prisma.attendanceEvent.create({
              data: {
                employeeId: employee.id,
                checkIn: punchTime,
              }
            });
          } else if (punchType === 'OUT') {
            const openEvent = await this.prisma.attendanceEvent.findFirst({
              where: { employeeId: employee.id, checkOut: null },
              orderBy: { checkIn: 'desc' }
            });
            if (openEvent) {
              await this.prisma.attendanceEvent.update({
                where: { id: openEvent.id },
                data: { checkOut: punchTime }
              });
            }
          }
        }
      }
      
      results.push({
        clientPunchId,
        status: 'SYNCED',
        serverTimestamp: new Date().toISOString()
      });
    }

    return {
      status: 'success',
      syncedCount: results.length,
      results
    };
  }
}
