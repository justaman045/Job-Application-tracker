import { Link } from 'react-router-dom'
import { Bookmark, ArrowLeft } from 'lucide-react'

const bookmarkletCode = `javascript:(function(){var t=encodeURIComponent(document.title),u=encodeURIComponent(location.href);window.open('${location.origin}/applications/new?source='+u+'&title='+t,'_blank')})()`

export function BookmarkletPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="max-w-lg w-full animate-fade-in">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold">
              N
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">North Bookmarklet</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Quick-capture jobs from any site</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-5 border border-indigo-200 dark:border-indigo-800">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">How to install</h2>
              <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-2 list-decimal list-inside">
                <li>Show your bookmarks bar (Ctrl+Shift+B / Cmd+Shift+B)</li>
                <li>Drag the button below to your bookmarks bar</li>
                <li>Click it anytime you're on a job posting page to open North pre-filled</li>
              </ol>
            </div>

            <div className="text-center">
              <a
                href={bookmarkletCode}
                onClick={(e) => e.preventDefault()}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-medium rounded-xl hover:from-indigo-600 hover:to-violet-700 transition-all shadow-md hover:shadow-lg cursor-grab active:cursor-grabbing"
                draggable
                onDragStart={(e) => { e.dataTransfer.setData('text/uri-list', bookmarkletCode); e.dataTransfer.setData('text/plain', bookmarkletCode) }}
              >
                <Bookmark className="w-4 h-4" />
                <span className="font-mono text-xs">North Capture</span>
              </a>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Drag this button to your bookmarks bar</p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <code className="text-xs font-mono bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-800 dark:text-gray-200">bookmarklet</code>
                <span className="text-xs text-gray-400">or copy the code below</span>
              </div>
              <textarea
                readOnly
                value={bookmarkletCode}
                className="w-full text-xs font-mono bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-gray-700 dark:text-gray-300 resize-none h-20 focus:outline-none"
                onClick={(e) => e.target.select()}
              />
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
            <Link to="/applications/new" className="inline-flex items-center gap-1.5 text-sm text-indigo-500 hover:text-indigo-600 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Go to New Application
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
