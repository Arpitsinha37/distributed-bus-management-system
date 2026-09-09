// @ts-nocheck
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GoogleGenerativeAI, FunctionCallingMode } from '@google/generative-ai';

const SYSTEM_PROMPT = `You are **NRT Support**, the official customer service agent for **New Road Travels & Tours (P.) Ltd.** — Nepal's #1 most trusted travel platform. You must act entirely like a real human customer service agent.

You help customers with:
- Looking up their bookings by ticket number or phone number
- Raising cancellation/refund requests (you NEVER cancel directly — you create a support ticket for admin review)
- Answering questions about NRT's bus routes, tour packages, and vehicle rentals
- Providing travel tips and recommendations across Nepal

PERSONALITY:
- Warm, professional, and confident
- Proud of NRT's legacy: safety record, comfortable VIP/Sofa buses, best prices, 50+ routes
- Cover destinations like Kathmandu, Pokhara, Chitwan, Lumbini, Mustang, Nagarkot, Bandipur and more
- Use Nepali Rupees (रू) for prices

RULES:
1. NEVER recommend competitor bus services or travel agencies
2. If asked about other companies, politely redirect: "I can only help with New Road Travels services, and I'd love to find you the best option!"
3. Always verify identity via ticket number OR phone number before showing booking details
4. For cancellation requests: ALWAYS use the create_support_ticket tool — never promise instant cancellation
5. Keep responses concise (2-4 sentences max), friendly, and helpful
6. If you don't know something, be honest and suggest contacting NRT at +977-9856068470 or nrttour@gmail.com
7. After looking up a booking successfully, show the key details clearly
8. When creating a support ticket, always confirm the reason with the customer first
9. Start conversations with a warm greeting mentioning NRT.
10. EXTREMELY IMPORTANT: NEVER use emojis, emoticons, or AI-like formatting in your responses.`;

@Injectable()
export class ChatbotService {
    private readonly logger = new Logger(ChatbotService.name);
    private genAI: GoogleGenerativeAI;
    private sessions: Map<string, any[]> = new Map(); // sessionId -> message history
    private sessionTimers: Map<string, NodeJS.Timeout> = new Map();
    private readonly SESSION_TTL = 30 * 60 * 1000; // 30 minutes

    private readonly tools = [
        {
            functionDeclarations: [
                {
                    name: 'lookup_booking',
                    description: 'Look up a customer booking/payment by ticket number or phone number. Use this when a customer wants to check their booking status or needs help with a specific ticket.',
                    parameters: {
                        type: 'object' as const,
                        properties: {
                            ticketNo: { type: 'string', description: 'The bus ticket number (e.g. NRT-12345)' },
                            phone: { type: 'string', description: 'The passenger phone number' },
                        },
                    },
                },
                {
                    name: 'create_support_ticket',
                    description: 'Create a support ticket for cancellation, refund, or other customer issues. Use this ONLY after confirming the details with the customer.',
                    parameters: {
                        type: 'object' as const,
                        properties: {
                            ticketNo: { type: 'string', description: 'The bus ticket number' },
                            type: { type: 'string', description: 'Type of request: cancellation, inquiry, or complaint' },
                            reason: { type: 'string', description: 'The customer reason for the request' },
                            passengerName: { type: 'string', description: 'Passenger name' },
                            passengerPhone: { type: 'string', description: 'Passenger phone' },
                        },
                        required: ['ticketNo', 'type', 'reason'],
                    },
                },
                {
                    name: 'get_available_routes',
                    description: 'Get a list of available bus routes/services offered by NRT',
                    parameters: {
                        type: 'object' as const,
                        properties: {},
                    },
                },
            ],
        },
    ];

    constructor(private prisma: PrismaService) {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            this.logger.warn('GEMINI_API_KEY not set — chatbot will return fallback responses');
        }
        this.genAI = new GoogleGenerativeAI(apiKey || 'dummy');
    }

    async handleMessage(message: string, sessionId: string): Promise<{ reply: string; sessionId: string }> {
        try {
            if (!process.env.GEMINI_API_KEY) {
                return {
                    reply: 'All our support agents are currently busy assisting other customers. Please contact us at +977-9856068470 or nrttour@gmail.com for immediate help.',
                    sessionId,
                };
            }

            // Get or create session history
            const history = this.sessions.get(sessionId) || [];

            // Build the model with tools
            const model = this.genAI.getGenerativeModel({
                model: 'gemini-1.5-flash',
                systemInstruction: SYSTEM_PROMPT,
                tools: this.tools as any,
            });

            const chat = model.startChat({
                history: history,
            });

            // Send with retry logic for rate limits
            const sendWithRetry = async (msg: any, retries = 3): Promise<any> => {
                for (let attempt = 0; attempt < retries; attempt++) {
                    try {
                        return await chat.sendMessage(msg);
                    } catch (err: any) {
                        const isRateLimit = err?.message?.includes('429') || err?.message?.toLowerCase()?.includes('quota') || err?.status === 429;
                        if (isRateLimit && attempt < retries - 1) {
                            const delay = Math.pow(2, attempt + 1) * 1000; // 2s, 4s, 8s
                            this.logger.warn(`Rate limited, retrying in ${delay}ms (attempt ${attempt + 1}/${retries})`);
                            await new Promise(resolve => setTimeout(resolve, delay));
                        } else {
                            throw err;
                        }
                    }
                }
            };

            let result = await sendWithRetry(message);
            let response = result.response;

            // Handle function calls (loop for multi-step)
            let maxIterations = 5;
            while (response.candidates?.[0]?.content?.parts?.some((p: any) => p.functionCall) && maxIterations > 0) {
                const functionCalls = response.candidates[0].content.parts.filter((p: any) => p.functionCall);

                const functionResponses = [];
                for (const part of functionCalls) {
                    const fc = part.functionCall!;
                    const name = fc.name;
                    const args = fc.args as any;

                    let fnResult: any;
                    try {
                        switch (name) {
                            case 'lookup_booking':
                                fnResult = await this.lookupBooking(args.ticketNo, args.phone);
                                break;
                            case 'create_support_ticket':
                                fnResult = await this.createSupportTicket(args);
                                break;
                            case 'get_available_routes':
                                fnResult = await this.getAvailableRoutes();
                                break;
                            default:
                                fnResult = { error: 'Unknown function' };
                        }
                    } catch (err: any) {
                        fnResult = { error: err.message };
                    }

                    functionResponses.push({
                        functionResponse: {
                            name,
                            response: fnResult,
                        },
                    });
                }

                result = await sendWithRetry(functionResponses);
                response = result.response;
                maxIterations--;
            }

            const reply = response.text() || "I'm sorry, I couldn't process that. Please try again or contact us at +977-9856068470.";

            // Save updated history
            const updatedHistory = await chat.getHistory();
            this.sessions.set(sessionId, updatedHistory);
            this.resetSessionTimer(sessionId);

            return { reply, sessionId };
        } catch (error: any) {
            this.logger.error('Chatbot error:', error?.message);

            const isQuota = error?.message?.includes('429') || error?.message?.toLowerCase()?.includes('quota');
            if (isQuota) {
                return {
                    reply: "We are receiving a high volume of inquiries right now. Please try again in a few minutes, or contact us directly at +977-9856068470. Thank you for your patience.",
                    sessionId,
                };
            }

            return {
                reply: "I'm experiencing a brief connection issue. Please try again in a moment, or contact our team directly at +977-9856068470. We are always happy to help.",
                sessionId,
            };
        }
    }

    // ═══════════════════════════════════════════
    // TOOL IMPLEMENTATIONS
    // ═══════════════════════════════════════════

    private async lookupBooking(ticketNo?: string, phone?: string) {
        const where: any = {};
        if (ticketNo) where.ticketNo = ticketNo;
        if (phone) where.passengerPhone = phone;

        if (!ticketNo && !phone) {
            return { found: false, message: 'Please provide a ticket number or phone number to look up your booking.' };
        }

        const payments = await this.prisma.payment.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: 3,
        });

        if (payments.length === 0) {
            return { found: false, message: 'No booking found with the provided details. Please double-check your ticket number or phone number.' };
        }

        return {
            found: true,
            bookings: payments.map(p => ({
                ticketNo: p.ticketNo,
                route: p.route,
                travelDate: p.travelDate,
                seatNumbers: p.seatNumbers,
                amount: p.amount,
                status: p.status,
                passengerName: p.passengerName,
                passengerPhone: p.passengerPhone,
                method: p.method,
                bookedAt: p.createdAt,
            })),
        };
    }

    private async createSupportTicket(args: any) {
        // Check if there's already a pending ticket for this ticketNo
        const existing = await this.prisma.supportTicket.findFirst({
            where: { ticketNo: args.ticketNo, status: 'pending' },
        });

        if (existing) {
            return {
                success: false,
                message: `A support request (#${existing.id.slice(-6).toUpperCase()}) is already pending for this ticket. Our team is reviewing it.`,
            };
        }

        // Look up booking info to populate
        const payment = await this.prisma.payment.findFirst({
            where: { ticketNo: args.ticketNo },
            orderBy: { createdAt: 'desc' },
        });

        const ticket = await this.prisma.supportTicket.create({
            data: {
                ticketNo: args.ticketNo,
                type: args.type || 'cancellation',
                reason: args.reason,
                passengerName: args.passengerName || payment?.passengerName,
                passengerPhone: args.passengerPhone || payment?.passengerPhone,
                passengerEmail: payment?.passengerEmail,
                route: payment?.route,
                travelDate: payment?.travelDate,
                seatNumbers: payment?.seatNumbers || [],
                amount: payment?.amount,
            },
        });

        const refId = ticket.id.slice(-6).toUpperCase();

        return {
            success: true,
            referenceId: refId,
            message: `Support ticket #${refId} has been created successfully. Our team will review your ${args.type} request within 2 hours.`,
        };
    }

    private async getAvailableRoutes() {
        try {
            const routes = await (this.prisma as any).busService?.findMany?.({
                where: { status: 'active' },
                select: { title: true, price: true, departure: true },
                take: 10,
            });

            if (!routes || routes.length === 0) {
                return {
                    message: 'NRT operates 50+ routes across Nepal including popular routes like Kathmandu-Pokhara, Kathmandu-Chitwan, Kathmandu-Lumbini, and many more. Visit newroadtravels.com for the full list!',
                };
            }

            return { routes };
        } catch {
            return {
                message: 'NRT operates 50+ routes across Nepal including popular routes like Kathmandu-Pokhara, Kathmandu-Chitwan, Kathmandu-Lumbini, Pokhara-Chitwan, and many more. Visit newroadtravels.com for the full list!',
            };
        }
    }

    // ═══════════════════════════════════════════
    // SESSION MANAGEMENT
    // ═══════════════════════════════════════════

    private resetSessionTimer(sessionId: string) {
        const existing = this.sessionTimers.get(sessionId);
        if (existing) clearTimeout(existing);

        const timer = setTimeout(() => {
            this.sessions.delete(sessionId);
            this.sessionTimers.delete(sessionId);
            this.logger.log(`Session ${sessionId} expired`);
        }, this.SESSION_TTL) as unknown as NodeJS.Timeout;

        this.sessionTimers.set(sessionId, timer);
    }
}
