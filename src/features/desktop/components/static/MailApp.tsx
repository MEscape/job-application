import { PlusCircle, Search, Archive, Trash2, Reply, Forward, Star } from "lucide-react";
import React from "react";

export const MailApp: React.FC = () => (
    <div className="h-full bg-white flex flex-col">
        {/* Toolbar */}
        <div className="bg-white border-b border-gray-200 px-4 py-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <button className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 flex items-center">
                        <PlusCircle className="w-4 h-4 mr-1" />
                        New Message
                    </button>
                    <button className="p-1.5 text-gray-400 hover:text-gray-600">
                        <Archive className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 text-gray-400 hover:text-gray-600">
                        <Trash2 className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 text-gray-400 hover:text-gray-600">
                        <Reply className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 text-gray-400 hover:text-gray-600">
                        <Forward className="w-4 h-4" />
                    </button>
                </div>
                <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input 
                        className="pl-9 pr-4 py-1.5 bg-gray-100 border-0 rounded-md text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        placeholder="Search Mail"
                    />
                </div>
            </div>
        </div>

        <div className="flex flex-1">
            {/* Sidebar */}
            <div className="w-56 bg-gray-50 border-r border-gray-200 flex flex-col">
                <div className="p-3">
                    <div className="space-y-1">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Mailboxes</div>
                        {[
                            { name: "Inbox", count: 12, active: true, icon: "📥", color: "text-blue-600" },
                            { name: "Sent", count: 0, active: false, icon: "📤", color: "text-gray-600" },
                            { name: "Drafts", count: 3, active: false, icon: "📝", color: "text-orange-600" },
                            { name: "Junk", count: 0, active: false, icon: "🗑️", color: "text-gray-600" },
                            { name: "Trash", count: 0, active: false, icon: "🗑️", color: "text-red-600" },
                        ].map((folder, i) => (
                            <div key={i} className={`flex items-center justify-between px-2 py-1.5 rounded cursor-pointer ${
                                folder.active ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-200'
                            }`}>
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm">{folder.icon}</span>
                                    <span className="text-sm font-medium">{folder.name}</span>
                                </div>
                                {folder.count > 0 && (
                                    <span className="bg-gray-400 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                                        {folder.count}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Email List */}
            <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
                <div className="p-3 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Inbox</h2>
                    <p className="text-sm text-gray-500">12 messages</p>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {[
                        { sender: "John Smith", subject: "Quarterly Report Review", preview: "Please find the attached quarterly report for your review...", time: "2:34 PM", unread: true, selected: true },
                        { sender: "Sarah Johnson", subject: "Meeting Tomorrow", preview: "Don't forget about our meeting tomorrow at 10 AM...", time: "1:15 PM", unread: true, selected: false },
                        { sender: "LinkedIn", subject: "You have 3 new messages", preview: "Check out your latest connections and messages...", time: "12:30 PM", unread: false, selected: false },
                        { sender: "GitHub", subject: "Weekly digest", preview: "Here's what happened in your repositories this week...", time: "11:45 AM", unread: false, selected: false },
                        { sender: "Apple", subject: "Your receipt from Apple", preview: "Thank you for your purchase. Here's your receipt...", time: "10:22 AM", unread: false, selected: false },
                    ].map((email, i) => (
                        <div key={i} className={`border-b border-gray-100 p-3 hover:bg-gray-50 cursor-pointer ${
                            email.selected ? 'bg-blue-100' : email.unread ? 'bg-blue-25' : ''
                        }`}>
                            <div className="flex items-start justify-between mb-1">
                                <div className="flex items-center space-x-2">
                                    {email.unread && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                                    <span className={`text-sm ${email.unread ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                                        {email.sender}
                                    </span>
                                </div>
                                <span className="text-xs text-gray-500">{email.time}</span>
                            </div>
                            <div className={`text-sm mb-1 ${email.unread ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                                {email.subject}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                                {email.preview}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Email Preview */}
            <div className="flex-1 bg-white flex flex-col">
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-start justify-between mb-3">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Quarterly Report Review</h3>
                            <p className="text-sm text-gray-600">From: John Smith &lt;john.smith@company.com&gt;</p>
                            <p className="text-sm text-gray-600">To: me</p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button className="p-1.5 text-gray-400 hover:text-gray-600">
                                <Star className="w-4 h-4" />
                            </button>
                            <span className="text-sm text-gray-500">Today at 2:34 PM</span>
                        </div>
                    </div>
                </div>
                
                <div className="flex-1 p-4 overflow-y-auto">
                    <div className="prose max-w-none text-gray-800">
                        <p className="mb-4">Hi there,</p>
                        <p className="mb-4">
                            I hope this email finds you well. I wanted to reach out regarding the quarterly report that we discussed in our last meeting.
                        </p>
                        <p className="mb-4">
                            Please find the attached quarterly report for your review. The document contains detailed analysis of our performance metrics, financial summaries, and strategic recommendations for the upcoming quarter.
                        </p>
                        <p className="mb-4">
                            Key highlights include:
                        </p>
                        <ul className="list-disc list-inside mb-4 space-y-1">
                            <li>15% increase in revenue compared to last quarter</li>
                            <li>Successful launch of three new product features</li>
                            <li>Expansion into two new market segments</li>
                            <li>Improved customer satisfaction scores</li>
                        </ul>
                        <p className="mb-4">
                            I would appreciate your feedback on the report, particularly on the strategic recommendations section. Please let me know if you have any questions or would like to schedule a meeting to discuss the findings in detail.
                        </p>
                        <p className="mb-4">
                            Looking forward to hearing from you.
                        </p>
                        <p>
                            Best regards,<br />
                            John Smith<br />
                            Senior Analyst<br />
                            Company Inc.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
);