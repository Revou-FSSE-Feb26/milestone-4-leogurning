import { Module } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { AccountsController } from './accounts.controller';
import { AccountsRepository } from './accounts.repository';
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule, UsersModule],
  controllers: [AccountsController],
  providers: [AccountsService, AccountsRepository],
  exports: [AccountsRepository],
})
export class AccountsModule {}
