import React, { useState } from 'react';

type Language = 'tr' | 'en';

interface LanguageTabsProps {
    children: (lang: Language) => React.ReactNode;
}

const LanguageTabs: React.FC<LanguageTabsProps> = ({ children }) => {
    const [activeTab, setActiveTab] = useState<Language>('tr');

    return (
        <div className="space-y-4">
            <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1">
                <button
                    type="button"
                    onClick={() => setActiveTab('tr')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                        activeTab === 'tr'
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-gray-600 hover:text-gray-800'
                    }`}
                >
                    TR
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('en')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                        activeTab === 'en'
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-gray-600 hover:text-gray-800'
                    }`}
                >
                    EN
                </button>
            </div>
            <div>{children(activeTab)}</div>
        </div>
    );
};

export default LanguageTabs;
