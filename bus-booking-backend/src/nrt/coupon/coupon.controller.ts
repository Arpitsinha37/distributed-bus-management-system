
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { SiteId as CurrentUser } from '../../common/decorators/site-id.decorator';

import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CouponService } from './coupon.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { ValidateCouponDto } from './dto/validate-coupon.dto';


@ApiTags('Coupons')
@Controller('nrt/coupons')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Post('validate')
  @ApiOperation({ summary: 'Validate a coupon code (Public)' })
  validate(@Body() validateDto: ValidateCouponDto) {
    return this.couponService.validate(validateDto);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  
  @ApiOperation({ summary: 'List all coupons (Admin)' })
  findAll() {
    return this.couponService.findAll();
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  
  @ApiOperation({ summary: 'Create a new coupon (Admin)' })
  create(@Body() createCouponDto: CreateCouponDto) {
    return this.couponService.create(createCouponDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  
  @ApiOperation({ summary: 'Delete a coupon (Admin)' })
  remove(@Param('id') id: string) {
    return this.couponService.remove(id);
  }
}

