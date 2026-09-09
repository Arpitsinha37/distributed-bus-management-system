import React from 'react';

const LiquidLoading = () => {
    const colors = [
        'from-purple-500 to-pink-500',
        'from-blue-500 to-purple-500',
        'from-cyan-400 to-blue-500',
        'from-green-400 to-cyan-400',
        'from-yellow-400 to-green-400',
        'from-orange-400 to-yellow-400',
        'from-red-500 to-orange-400'
    ];

    return (
        <>
            <style>{`
                @keyframes liquid-bounce {
                    0%, 100% { height: 10px; transform: scaleY(1); }
                    50% { height: 80px; transform: scaleY(1.1); }
                }
                @keyframes liquid-droplet {
                    0%, 100% { transform: translateY(10px) scale(0.5); opacity: 0; }
                    50% { transform: translateY(-10px) scale(1.2); opacity: 1; }
                }
                @keyframes liquid-surface {
                    0%, 100% { transform: translateY(0) scaleY(1); }
                    50% { transform: translateY(3px) scaleY(0.7); }
                }
            `}</style>
            <div className="flex items-end space-x-4 p-8">
                {colors.map((color, index) => {
                    const delay = index * 0.15;
                    return (
                        <div key={index} className="relative flex flex-col items-center">
                            {/* Droplet */}
                            <div
                                className={`w-4 h-4 rounded-full bg-gradient-to-r ${color} mb-3`}
                                style={{
                                    animation: `liquid-droplet 1.5s ease-in-out infinite`,
                                    animationDelay: `${delay}s`,
                                    filter: 'blur(0.5px)',
                                }}
                            />

                            {/* Main liquid bar */}
                            <div
                                className={`w-10 bg-gradient-to-t ${color} rounded-full relative overflow-hidden shadow-lg origin-bottom`}
                                style={{
                                    animation: `liquid-bounce 1.5s ease-in-out infinite`,
                                    animationDelay: `${delay}s`,
                                    filter: 'blur(0.3px)',
                                }}
                            >
                                {/* Liquid surface tension effect */}
                                <div
                                    className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-white/40 to-transparent rounded-full origin-top"
                                    style={{
                                        animation: `liquid-surface 1.5s ease-in-out infinite`,
                                        animationDelay: `${delay}s`,
                                    }}
                                />
                                {/* Shimmer effect */}
                                <div
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full w-[200%] -left-1/2"
                                    style={{
                                        animation: `liquid-surface 2s ease-in-out infinite alternate`,
                                    }}
                                />
                            </div>

                            {/* Enhanced base droplet */}
                            <div
                                className={`w-3 h-3 rounded-full bg-gradient-to-r ${color} mt-2`}
                                style={{
                                    animation: `liquid-surface 1.5s ease-in-out infinite`,
                                    animationDelay: `${delay}s`,
                                    filter: 'blur(0.2px)',
                                }}
                            />
                        </div>
                    );
                })}
            </div>
        </>
    );
};

export default LiquidLoading;

