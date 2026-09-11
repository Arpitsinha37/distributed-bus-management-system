import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { ValidateCouponDto } from './dto/validate-coupon.dto';

@Injectable()
export class CouponService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCouponDto: CreateCouponDto) {
    return this.prisma.coupon.create({
      data: {
        code: createCouponDto.code,
        validTo: new Date(createCouponDto.expiryDate),
        validFrom: new Date(),
        discountType: createCouponDto.type,
        discountValue: createCouponDto.value,
        maxUses: createCouponDto.usageLimit,
        minBookingAmount: createCouponDto.minAmount
      },
    });
  }

  async findAll() {
    return this.prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByCode(code: string) {
    const coupon = await this.prisma.coupon.findUnique({ where: { code } });
    if (!coupon) throw new NotFoundException('Coupon not found');
    return coupon;
  }

  async validate(validateDto: ValidateCouponDto) {
    const { code, bookingAmount } = validateDto;
    
    const coupon = await this.prisma.coupon.findUnique({
      where: { code },
    });

    if (!coupon) {
      throw new NotFoundException('Invalid coupon code');
    }

    if (!coupon.isActive) {
      throw new BadRequestException('This coupon is no longer active');
    }

    if (new Date() > coupon.validTo) {
      throw new BadRequestException('This coupon has expired');
    }

    if (coupon.usedCount >= (coupon.maxUses || 999999)) {
      throw new BadRequestException('This coupon has reached its usage limit');
    }

    if (bookingAmount < (coupon.minBookingAmount ? Number(coupon.minBookingAmount) : 0)) {
      throw new BadRequestException(`Minimum booking amount of NPR ${(coupon.minBookingAmount ? Number(coupon.minBookingAmount) : 0)} required for this coupon`);
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = bookingAmount * Number(coupon.discountValue);
      if (Number(coupon.discountValue) && discountAmount > Number(coupon.discountValue)) {
        discountAmount = Number(coupon.discountValue);
      }
    } else {
      discountAmount = Number(coupon.discountValue);
    }

    // Ensure discount doesn't exceed booking amount
    discountAmount = Math.min(discountAmount, bookingAmount);

    return {
      valid: true,
      code: coupon.code,
      type: coupon.discountType,
      value: Number(coupon.discountValue),
      discountAmount,
      finalAmount: bookingAmount - discountAmount,
    };
  }

  async incrementUsage(code: string) {
    return this.prisma.coupon.update({
      where: { code },
      data: { usedCount: { increment: 1 } },
    });
  }

  async remove(id: string) {
    return this.prisma.coupon.delete({ where: { id } });
  }
}



