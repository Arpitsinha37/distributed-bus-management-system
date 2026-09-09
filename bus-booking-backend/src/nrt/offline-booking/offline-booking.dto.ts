import { IsString, IsNotEmpty, IsNumber, IsOptional, IsArray, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * DTO for creating an offline booking.
 * 
 * This is the payload the API holder company sends when they
 * process an offline booking through their software.
 */
export class CreateOfflineBookingDto {
    @ApiProperty({ description: 'Passenger full name', example: 'Ram Bahadur Thapa' })
    @IsString()
    @IsNotEmpty({ message: 'Passenger name is required.' })
    name!: string;

    @ApiProperty({ description: 'Passenger contact number', example: '9841234567' })
    @IsString()
    @IsNotEmpty({ message: 'Contact number is required.' })
    contact!: string;

    @ApiProperty({ description: 'Ticket/Holding number from bus portal', example: '78451' })
    @IsString()
    @IsNotEmpty({ message: 'TicketNo is required.' })
    TicketNo!: string;

    @ApiProperty({ description: 'Total ticket amount in NPR', example: 1500 })
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    amount!: number;

    @ApiProperty({ description: 'Route (source → destination)', example: 'Kathmandu → Pokhara' })
    @IsString()
    @IsNotEmpty({ message: 'Route is required.' })
    route!: string;

    @ApiProperty({ description: 'Travel date (YYYY-MM-DD or any parseable format)', example: '2026-06-15' })
    @IsString()
    @IsNotEmpty({ message: 'Travel date is required.' })
    travelDate!: string;

    @ApiProperty({ description: 'Array of seat numbers', example: ['A1', 'A2'], type: [String] })
    @IsArray()
    @IsNotEmpty({ message: 'Seat numbers are required.' })
    seatNumbers!: string[];

    @ApiPropertyOptional({ description: 'Passenger email for ticket confirmation', example: 'ram@example.com' })
    @IsString()
    @IsOptional()
    email?: string;

    @ApiPropertyOptional({ description: 'Boarding/Pickup point', example: 'Kalanki' })
    @IsString()
    @IsOptional()
    pickup?: string;

    @ApiPropertyOptional({ description: 'Alighting/Drop point', example: 'Tourist Buspark' })
    @IsString()
    @IsOptional()
    drop?: string;

    @ApiPropertyOptional({ description: 'Bus name/company', example: 'Green Line' })
    @IsString()
    @IsOptional()
    busName?: string;

    @ApiPropertyOptional({ description: 'Bus registration number', example: 'Ba 2 Kha 1234' })
    @IsString()
    @IsOptional()
    busNumber?: string;

    @ApiPropertyOptional({ description: 'Any remarks or notes', example: 'Customer paid cash at counter' })
    @IsString()
    @IsOptional()
    remarks?: string;
}
