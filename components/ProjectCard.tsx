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
}: ProjectCardProps) {
    const progress = Math.min((currentFunding / fundingGoal) * 100, 100);

    return (
        <Link href={`/projects/${id}`} className="block group">
            <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-blue-500 transition duration-300 shadow-lg hover:shadow-2xl">
                <div className="relative h-48 w-full overflow-hidden">
                    <img
                        src={imageUrl}
                        alt={title}
                        className="object-cover w-full h-full group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-2 py-1 rounded-full border border-white/20">
                        {category}
                    </div>
                    <div className="absolute bottom-2 left-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                        Trust Score: {trustScore}/100
                    </div>
                </div>

                <div className="p-5">
                    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-blue-400 transition">
                        {title}
                    </h3>
                    <p className="text-gray-400 text-sm mb-4 flex items-center gap-1">
                        <svg
                            className="w-4 h-4"
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

                    <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-300 font-medium">
                                ${currentFunding.toLocaleString()} raised
                            </span>
                            <span className="text-gray-500">
                                of ${fundingGoal.toLocaleString()}
                            </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2.5">
                            <div
                                className="bg-blue-500 h-2.5 rounded-full"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                        <div className="text-xs text-gray-400">
                            Min Investment <br />
                            <span className="text-white font-bold text-base">
                                ${minInvestment}
                            </span>
                        </div>
                        <span className="text-blue-400 text-sm font-bold group-hover:underline">
                            View Details &rarr;
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
