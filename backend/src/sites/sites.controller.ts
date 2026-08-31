import { Controller, Get, Req, Post, Body } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Controller('sites')
export class SitesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('my-sites')
  async getMySites(@Req() req: any) {
    const email = req.headers['x-user-email'] as string;
    const userEmail = email || 'john.doe@fieldops.com';
    
    const employee = await this.prisma.employee.findFirst({
      where: { user: { email: userEmail } }
    });

    if (!employee) return [];

    return this.prisma.site.findMany({
      where: { 
        isActive: true,
        assignments: {
          some: {
            employeeId: employee.id
          }
        }
      },
      select: {
        id: true,
        name: true,
        projectId: true,
        latitude: true,
        longitude: true,
        geofenceRadius: true,
        siteCode: true,
      }
    });
  }

  @Get()
  async getAllSites() {
    return this.prisma.site.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  @Post()
  async createSite(
    @Body() body: { 
      name: string; 
      projectId?: string; 
      address?: string; 
      latitude: number; 
      longitude: number; 
      geofenceRadius?: number; 
      siteCode: string;
    }
  ) {
    return this.prisma.site.create({
      data: {
        name: body.name,
        projectId: body.projectId || null,
        address: body.address || null,
        latitude: Number(body.latitude),
        longitude: Number(body.longitude),
        geofenceRadius: Number(body.geofenceRadius || 100),
        siteCode: body.siteCode,
        isActive: true
      }
    });
  }
}
