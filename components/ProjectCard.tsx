import Link from "next/link";

interface ProjectCardProps {
    id: string;
    title: string;
    category: string;
    location: string;
    imageUrl: string;
    fundingGoal: number;
    currentFunding: number;
    trustScore: number;
    minInvestment: number;
    groupName?: string;
    groupScore?: number;
}

export default function ProjectCard({
    id,
    title,
    category,
    location,
    imageUrl,
    fundingGoal,
    currentFunding,
    trustScore,
    minInvestment,
    groupName,
    groupScore
}: ProjectCardProps & { groupName?: string; groupScore?: number }) {
    const progress = Math.min((currentFunding / fundingGoal) * 100, 100);

    return (
        <Link href={`/projects/${id}`} className="block group h-full">
            <div className="glass rounded-3xl overflow-hidden border border-white/10 hover:border-green-500/50 transition duration-300 shadow-lg hover:shadow-2xl hover:-translate-y-1 h-full flex flex-col">
                <div className="relative h-56 w-full overflow-hidden">
                    <img
                        src={imageUrl}
                        alt={title}
                        className="object-cover w-full h-full group-hover:scale-105 transition duration-700"
                    />
                    <div className="absolute top-0 inset-x-0 h-20 bg-gradient-to-b from-black/60 to-transparent"></div>
                    <div className="absolute top-3 right-3 bg-white/10 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/20">
                        {category}
                    </div>
                </div>

                <div className="p-6 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-2 gap-2">
                        <div className="bg-green-500/20 text-green-300 text-xs font-bold px-2 py-1 rounded-lg border border-green-500/30">
                            Trust Score: {trustScore}
                        </div>
                        {groupName && (
                            <div className="bg-blue-500/20 text-blue-300 text-xs font-bold px-2 py-1 rounded-lg border border-blue-500/30 truncate max-w-[50%]">
                                👥 {groupName} ({groupScore})
                            </div>
                        )}
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-green-400 transition leading-tight">
                        {title}
                    </h3>
                    <p className="text-gray-400 text-sm mb-6 flex items-center gap-1.5">
                        <svg
                            className="w-4 h-4 text-gray-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                        </svg>
                        {location}
                    </p>

                    <div className="mb-6 mt-auto">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-white font-bold">
                                ${currentFunding.toLocaleString()}
                            </span>
                            <span className="text-gray-400 text-xs self-end mb-0.5">
                                of ${fundingGoal.toLocaleString()}
                            </span>
                        </div>
                        <div className="w-full bg-white/5 rounded-full h-2">
                            <div
                                className="bg-gradient-to-r from-green-500 to-emerald-400 h-2 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                        <div className="text-xs text-gray-400">
                            Min Investment <br />
                            <span className="text-white font-bold text-base">
                                ${minInvestment}
                            </span>
                        </div>
                        <span className="text-green-400 text-sm font-bold group-hover:translate-x-1 transition flex items-center gap-1">
                            Details <span>→</span>
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
