import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import FormData from 'form-data';

@Injectable()
export class BusPortalService {
    private readonly logger = new Logger(BusPortalService.name);
    private readonly baseUrl = 'https://nepaltouristbus.com/newroadlive';
    private readonly authHeader: string;

    constructor(private readonly http: HttpService) {
        // Basic Auth: newroadlive:new@road
        this.authHeader = 'Basic ' + Buffer.from('newroadlive:new@road').toString('base64');
    }

    /**
     * Helper: GET request (for endpoints that need no body, like fetchroute)
     */
    private async getData(endpoint: string): Promise<any> {
        const url = `${this.baseUrl}/${endpoint}`;
        try {
            const response = await firstValueFrom(
                this.http.get(url, {
                    headers: {
                        'Authorization': this.authHeader,
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                        'Accept': '*/*',
                    },
                }),
            );
            if (!response.data) {
                return { code: '0', message: 'No data available from bus portal' };
            }
            return response.data;
        } catch (error: any) {
            if (error instanceof HttpException) throw error;
            this.logger.error(`Bus Portal GET failed: ${endpoint}`, error?.message);
            throw new HttpException('Failed to connect to bus portal', HttpStatus.BAD_GATEWAY);
        }
    }

    /**
     * Helper: POST application/x-www-form-urlencoded to the external bus portal API
     */
    private async postUrlEncoded(endpoint: string, data: Record<string, string> = {}): Promise<any> {
        const url = `${this.baseUrl}/${endpoint}`;

        const params = new URLSearchParams();
        for (const [key, value] of Object.entries(data)) {
            if (value !== undefined && value !== null) {
                params.append(key, String(value));
            }
        }

        try {
            const response = await firstValueFrom(
                this.http.post(url, params.toString(), {
                    headers: {
                        'Authorization': this.authHeader,
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                        'Accept': '*/*',
                    },
                }),
            );

            const body = response.data;

            // If the response is a string (HTML), the API is blocking us
            if (typeof body === 'string' && body.includes('Imunify360')) {
                throw new HttpException(
                    'Bus portal API is temporarily blocking requests. Please try again later.',
                    HttpStatus.BAD_GATEWAY,
                );
            }

            // Handle external API error codes
            if (body.code && Number(body.code) !== 1) {
                const codeNum = Number(body.code);
                const msg = body.message || body.data || 'External API error';

                if (codeNum === 2) {
                    throw new HttpException({ code: 2, message: msg }, HttpStatus.BAD_REQUEST);
                }
                if (codeNum === 3) {
                    throw new HttpException({ code: 3, message: 'Server error from bus portal' }, HttpStatus.BAD_GATEWAY);
                }
                if (codeNum === 4) {
                    // Data Inconsistency (e.g. "Seat is already booked")
                    throw new HttpException({ code: 4, message: msg }, HttpStatus.BAD_REQUEST);
                }
                if (codeNum === 5) {
                    throw new HttpException({ code: 5, message: msg }, HttpStatus.BAD_REQUEST);
                }
                throw new HttpException({ code: codeNum, message: msg }, HttpStatus.BAD_REQUEST);
            }

            if (!body) {
                return { code: '0', message: 'No routes or buses available right now.' };
            }

            return body;
        } catch (error: any) {
            if (error instanceof HttpException) throw error;
            this.logger.error(`Bus Portal API call failed: ${endpoint}`, error?.message);
            throw new HttpException(
                'Failed to connect to bus portal',
                HttpStatus.BAD_GATEWAY,
            );
        }
    }

    /**
     * 1) Fetch available route locations
     */
    async fetchRoutes() {
        return this.getData('fetchroute/');
    }

    /**
     * 2) Search trips between two locations on a date
     */
    async fetchTrips(from_location: string, to_location: string, date: string) {
        return this.postUrlEncoded('fetchbus/', {
            from_location,
            to_location,
            date,
        });
    }

    /**
     * 3) Hold selected seats
     */
    async holdSeat(seat: string, totalseat: string, busno: string) {
        return this.postUrlEncoded('seathold/', {
            seat,
            totalseat,
            busno,
        });
    }

    /**
     * 4) Cancel a held seat
     */
    async cancelHolding(holdingnumber: string) {
        return this.postUrlEncoded('cancelholdingseat/', {
            holdingnumber,
        });
    }

    /**
     * 5) Fill passenger details for a ticket
     */
    async fillPassengerDetail(
        name: string,
        contact: string,
        pickup: string,
        drop: string,
        TicketNo: string,
    ) {
        return this.postUrlEncoded('passengerdetailfillup/', {
            name,
            contact,
            pickup,
            drop,
            TicketNo,
        });
    }

    /**
     * 6) Get passenger detail by ticket number
     */
    async getPassengerDetail(TicketNo: string) {
        return this.postUrlEncoded('passengerdetail/', {
            TicketNo,
        });
    }

    /**
     * 7) Confirm payment
     */
    async confirmPayment(TicketNo: string, pidx: string, cashbackamount: string) {
        return this.postUrlEncoded('paymentconfirm/', {
            TicketNo,
            pidx,
            cashbackamount,
        });
    }

    /**
     * 8) Query ticket confirmation status
     */
    async queryTicket(TicketNo: string) {
        return this.postUrlEncoded('confirm/', {
            TicketNo,
        });
    }
}
