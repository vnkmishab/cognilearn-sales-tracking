import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Controller('expenses')
export class ExpensesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getAllExpenses() {
    return this.prisma.expense.findMany({
      include: {
        employee: true,
        site: true,
        documents: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Post(':id/status')
  async updateStatus(@Param('id') id: string, @Body() data: { approvalStatus: string }) {
    return this.prisma.expense.update({
      where: { id },
      data: { approvalStatus: data.approvalStatus },
    });
  }
}
