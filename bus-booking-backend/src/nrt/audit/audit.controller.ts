import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { JwtAuthGuard, Roles, RolesGuard } from '../../common/guards';
import { CurrentUser } from '../../common/decorators';

@ApiTags('Audit Logs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin', 'operator_admin')
@Controller('audit-logs')
export class AuditController {
    constructor(private auditService: AuditService) { }

    @Get()
    @ApiOperation({ summary: 'List audit logs' })
    findAll(@CurrentUser('tenantId') tenantId: string, @Query('page') page?: string) {
        return this.auditService.findAll(tenantId, Number(page) || 1);
    }
}
