import * as React from "react";
import { cn } from "@/lib/utils";

// --- SVG Icons ---
const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

// --- Helper Components ---
const DashedLine = () => (
  <div
    className="w-full border-t-2 border-dashed border-gray-200"
    aria-hidden="true"
  />
);

const Barcode = ({ value }: { value: string }) => {
    const hashCode = (s: string) => s.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0);
    const seed = hashCode(value || "0");
    const random = (s: number) => {
        const x = Math.sin(s) * 10000;
        return x - Math.floor(x);
    };

    const bars = Array.from({ length: 60 }).map((_, index) => {
        const rand = random(seed + index);
        const width = rand > 0.7 ? 2.5 : 1.5;
        return { width };
    });

    const spacing = 1.5;
    const totalWidth = bars.reduce((acc, bar) => acc + bar.width + spacing, 0) - spacing;
    const svgWidth = 250;
    const svgHeight = 70;
    let currentX = (svgWidth - totalWidth) / 2;

    return (
        <div className="flex flex-col items-center py-2">
             <svg
                xmlns="http://www.w3.org/2000/svg"
                width={svgWidth}
                height={svgHeight}
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                aria-label={`Barcode for value ${value}`}
                className="fill-current text-gray-800"
            >
                {bars.map((bar, index) => {
                    const x = currentX;
                    currentX += bar.width + spacing;
                    return (
                        <rect
                            key={index}
                            x={x}
                            y="10"
                            width={bar.width}
                            height="50"
                        />
                    );
                })}
            </svg>
            <p className="text-sm text-gray-500 tracking-[0.3em] mt-2">{value}</p>
        </div>
    );
};

const ConfettiExplosion = () => {
  const confettiCount = 100;
  const colors = ["#ef4444", "#3b82f6", "#22c55e", "#eab308", "#8b5cf6", "#f97316"];

  return (
    <>
      <style>
        {`
          @keyframes fall {
            0% {
                transform: translateY(-10vh) rotate(0deg);
                opacity: 1;
            }
            100% {
              transform: translateY(110vh) rotate(720deg);
              opacity: 0;
            }
          }
        `}
      </style>
      <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
        {Array.from({ length: confettiCount }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-4"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${-20 + Math.random() * 10}%`,
              backgroundColor: colors[i % colors.length],
              transform: `rotate(${Math.random() * 360}deg)`,
              animation: `fall ${2.5 + Math.random() * 2.5}s ${Math.random() * 2}s linear forwards`,
            }}
          />
        ))}
      </div>
    </>
  );
};

// --- Main Ticket Component ---

export interface TicketProps extends React.HTMLAttributes<HTMLDivElement> {
  pnr: string;
  amount: number;
  date: Date;
  passengerName: string;
  route: string;
  seats: string;
  barcodeValue: string;
}

const AnimatedTicket = React.forwardRef<HTMLDivElement, TicketProps>(
  (
    {
      className,
      pnr,
      amount,
      date,
      passengerName,
      route,
      seats,
      barcodeValue,
      ...props
    },
    ref
  ) => {
    const [showConfetti, setShowConfetti] = React.useState(false);

    React.useEffect(() => {
      const mountTimer = setTimeout(() => setShowConfetti(true), 100);
      const unmountTimer = setTimeout(() => setShowConfetti(false), 6000);
      return () => {
        clearTimeout(mountTimer);
        clearTimeout(unmountTimer);
      };
    }, []);

    const formattedAmount = new Intl.NumberFormat("en-NP", {
      style: "currency",
      currency: "NPR",
      minimumFractionDigits: 0
    }).format(amount);

    const formattedDate = new Intl.DateTimeFormat("en-GB", {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date).replace(',', ' •');

    return (
      <>
        {showConfetti && <ConfettiExplosion />}
        <div
          ref={ref}
          className={cn(
            "relative w-full max-w-sm bg-white text-gray-900 rounded-2xl shadow-xl font-sans z-10 mx-auto",
            "animate-in fade-in-0 zoom-in-95 duration-500",
            className
          )}
          {...props}
        >
          {/* Ticket cut-out effect */}
          <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-50 shadow-inner" />
          <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-50 shadow-inner" />

          <div className="p-8 flex flex-col items-center text-center">
              <div className="p-3 bg-green-100 rounded-full animate-in zoom-in-50 delay-300 duration-500">
                  <CheckCircleIcon className="w-10 h-10 text-green-600 animate-in zoom-in-75 delay-500 duration-500" />
              </div>
              <h1 className="text-2xl font-bold mt-4 font-display">Booking Confirmed!</h1>
              <p className="text-gray-500 mt-1 text-sm">
                Your ticket has been issued successfully
              </p>
          </div>

          <div className="px-8 pb-8 space-y-6">
              <DashedLine />

              <div className="grid grid-cols-2 gap-4 text-left">
                  <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">PNR Number</p>
                      <p className="font-mono font-bold text-gray-800">{pnr}</p>
                  </div>
                  <div className="text-right">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Amount Paid</p>
                      <p className="font-bold text-lg text-green-600">{formattedAmount}</p>
                  </div>
              </div>

              <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Date & Time</p>
                  <p className="font-medium text-gray-800">{formattedDate}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl flex items-center space-x-4 border border-gray-100">
                  <div className="flex-1">
                      <p className="font-bold text-gray-900">{passengerName}</p>
                      <p className="text-gray-500 text-sm mt-0.5">{route}</p>
                      <div className="mt-2 inline-block bg-nepal-red/10 text-nepal-red px-2 py-1 rounded text-xs font-bold">
                        Seat: {seats}
                      </div>
                  </div>
              </div>

              <DashedLine />

              <Barcode value={barcodeValue} />
          </div>
        </div>
      </>
    );
  }
);

AnimatedTicket.displayName = "AnimatedTicket";

export { AnimatedTicket };
