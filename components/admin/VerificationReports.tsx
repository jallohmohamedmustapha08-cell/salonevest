import { useState } from "react";

interface VerificationReport {
    id: string;
    project_id: number;
    project_title: string;
    agent_name: string;
    report_text: string;
    image_url: string | null;
    status: string;
    created_at: string;
}

interface VerificationReportsProps {
    reports: VerificationReport[];
    handleUpdateStatus: (id: string, status: string) => void;
}

export default function VerificationReports({ reports, handleUpdateStatus }: VerificationReportsProps) {
    const [filter, setFilter] = useState('Submitted');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const filteredReports = reports.filter(r => {
        if (filter === 'All') return true;
        return r.status === filter;
    });

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white">Field Verification Reports</h2>

            {/* Image Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 cursor-pointer"
                    onClick={() => setSelectedImage(null)}
                >
                    <img src={selectedImage} alt="Verification Evidence" className="max-w-full max-h-[90vh] rounded-lg border border-gray-600" />
                </div>
            )}

            <div className="flex gap-4 mb-6">
                {['Submitted', 'Verified', 'Rejected', 'All'].map(status => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-4 py-2 rounded-lg font-bold transition ${filter === status ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
                    >
                        {status}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-6">
                {filteredReports.length === 0 ? (
                    <div className="text-gray-400 text-center py-10 bg-gray-800 rounded-xl border border-gray-700">
                        No reports found with status: {filter}
                    </div>
                ) : (
                    filteredReports.map((report) => (
                        <div key={report.id} className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex flex-col lg:flex-row gap-6 hover:border-gray-600 transition">
                            {/* Image Section */}
                            <div className="lg:w-1/4">
                                {report.image_url ? (
                                    <div
                                        onClick={() => setSelectedImage(report.image_url)}
                                        className="h-40 w-full rounded-lg bg-gray-700 overflow-hidden cursor-zoom-in relative group"
                                    >
                                        <img src={report.image_url} alt="Evidence" className="w-full h-full object-cover transition group-hover:opacity-75" />
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                            <span className="bg-black/50 text-white text-xs px-2 py-1 rounded">View Full Size</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-40 w-full rounded-lg bg-gray-700 flex items-center justify-center text-gray-500 text-sm">
                                        No Image
                                    </div>
                                )}
                            </div>

                            {/* Content Section */}
                            <div className="flex-1 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="text-xl font-bold text-white max-w-md">{report.project_title}</h3>
                                            <p className="text-sm text-blue-400 font-bold">Agent: {report.agent_name}</p>
                                        </div>
                                        <span className={`px-3 py-1 text-xs rounded-full font-bold uppercase ${report.status === 'Submitted' ? 'bg-yellow-900/50 text-yellow-400' :
                                                report.status === 'Verified' ? 'bg-green-900/50 text-green-400' :
                                                    'bg-red-900/50 text-red-400'
                                            }`}>
                                            {report.status}
                                        </span>
                                    </div>
                                    <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/50 mb-4">
                                        <p className="text-gray-300 text-sm whitespace-pre-wrap">"{report.report_text}"</p>
                                    </div>
                                    <p className="text-xs text-gray-500">Submitted on {new Date(report.created_at).toLocaleDateString()} at {new Date(report.created_at).toLocaleTimeString()}</p>
                                </div>

                                {/* Actions */}
                                {report.status === 'Submitted' && (
                                    <div className="flex gap-3 mt-4 pt-4 border-t border-gray-700">
                                        <button
                                            onClick={() => handleUpdateStatus(report.id, 'Verified')}
                                            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-bold text-sm transition flex items-center justify-center gap-2"
                                        >
                                            ✅ Approve & Verify
                                        </button>
                                        <button
                                            onClick={() => handleUpdateStatus(report.id, 'Rejected')}
                                            className="flex-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-900/50 py-2 rounded-lg font-bold text-sm transition"
                                        >
                                            Reject Report
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
