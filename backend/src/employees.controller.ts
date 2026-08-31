import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Controller('employees')
export class EmployeesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getAllEmployees() {
    return this.prisma.employee.findMany({
      where: { isActive: true },
      include: {
        user: {
          select: {
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Post()
  async createEmployee(@Body() data: { firstName: string; lastName: string; email: string }) {
    // Basic auto-generation logic for demo purposes
    const employeeCode = `EMP-${Math.floor(1000 + Math.random() * 9000)}`;
    
    // Create the User first, then the Employee
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          passwordHash: 'default-hash-123', // In reality, hash a generated password
          role: 'EMPLOYEE',
        },
      });

      return tx.employee.create({
        data: {
          userId: user.id,
          employeeCode,
          firstName: data.firstName,
          lastName: data.lastName,
        },
      });
    });
  }

  @Delete(':id')
  async removeEmployee(@Param('id') id: string, @Body() data: { reason: string }) {
    return this.prisma.employee.update({
      where: { id },
      data: {
        isActive: false,
        deletionReason: data.reason,
      },
    });
  }

  @Get(':id/sites')
  async getEmployeeSites(@Param('id') id: string) {
    const assignments = await this.prisma.siteAssignment.findMany({
      where: { employeeId: id },
      select: { siteId: true }
    });
    return assignments.map(a => a.siteId);
  }

  @Post(':id/sites')
  async updateEmployeeSites(
    @Param('id') id: string,
    @Body() data: { siteIds: string[] }
  ) {
    const siteIds = data.siteIds || [];
    
    return this.prisma.$transaction(async (tx) => {
      // Delete all existing assignments
      await tx.siteAssignment.deleteMany({
        where: { employeeId: id }
      });

      // Create new assignments
      if (siteIds.length > 0) {
        await tx.siteAssignment.createMany({
          data: siteIds.map(siteId => ({
            employeeId: id,
            siteId
          }))
        });
      }

      // Fetch site details for notification message
      const assignedSites = await tx.site.findMany({
        where: { id: { in: siteIds } },
        select: { name: true }
      });
      const siteNamesStr = assignedSites.length > 0 
        ? assignedSites.map(s => s.name).join(', ')
        : 'No sites';

      // Create notification for employee
      await tx.notification.create({
        data: {
          title: 'Site Assignments Updated',
          message: `Admin has assigned you to sites: ${siteNamesStr}. Please punch in from these sites.`,
          employeeId: id,
          type: 'SITE_ASSIGNMENT'
        }
      });

      return { status: 'success', count: siteIds.length };
    });
  }
}
