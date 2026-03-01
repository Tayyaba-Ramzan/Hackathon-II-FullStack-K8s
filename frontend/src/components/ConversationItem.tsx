/**
 * ConversationItem Component
 *
 * Individual conversation item in the sidebar list.
 */
'use client';

interface ConversationItemProps {
  conversationId: string;
  title: string;
  lastMessagePreview: string | null;
  updatedAt: string;
  isActive: boolean;
  onClick: () => void;
}

export default function ConversationItem({
  conversationId,
  title,
  lastMessagePreview,
  updatedAt,
  isActive,
  onClick
}: ConversationItemProps) {
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 rounded-lg transition-colors ${
        isActive
          ? 'bg-blue-100 border-l-4 border-blue-600'
          : 'hover:bg-gray-100 border-l-4 border-transparent'
      }`}
      aria-label={`Select conversation: ${title}`}
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-sm text-gray-900 truncate flex-1">
            {title}
          </h3>
          <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
            {formatTimestamp(updatedAt)}
          </span>
        </div>

        {lastMessagePreview && (
          <p className="text-xs text-gray-600 truncate">
            {lastMessagePreview}
          </p>
        )}
      </div>
    </button>
  );
}
