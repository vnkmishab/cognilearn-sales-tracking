import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { UsersModule } from './users/users.module';
import { SitesModule } from './sites/sites.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma.module';
import { AttendanceController } from './attendance.controller';
import { SitePunchesController } from './site-punches.controller';
import { EmployeesController } from './employees.controller';
import { ExpensesController } from './expenses.controller';
import { EmployeePortalController } from './employee-portal.controller';
import { NotificationsController } from './notifications.controller';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    UsersModule,
    SitesModule,
    AuthModule,
    PrismaModule,
  ],
  controllers: [
    AppController, 
    AttendanceController, 
    SitePunchesController,
    EmployeesController,
    ExpensesController,
    EmployeePortalController,
    NotificationsController
  ],
  providers: [AppService],
})
export class AppModule {}
