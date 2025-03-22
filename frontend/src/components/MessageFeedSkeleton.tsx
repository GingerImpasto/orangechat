import React from "react";

const MessageFeedSkeleton: React.FC = () => {
  return (
    <div className="message-feed-skeleton">
      {/* Incoming Message Skeleton */}
      <div className="skeleton-message incoming">
        <div className="skeleton-avatar" />
        <div className="skeleton-content">
          <div className="skeleton-text short" />
          <div className="skeleton-text medium" />
        </div>
      </div>

      {/* Outgoing Message Skeleton */}
      <div className="skeleton-message outgoing">
        <div className="skeleton-content">
          <div className="skeleton-text long" />
        </div>
      </div>

      {/* Incoming Message Skeleton */}
      <div className="skeleton-message incoming">
        <div className="skeleton-avatar" />
        <div className="skeleton-content">
          <div className="skeleton-text short" />
        </div>
      </div>

      {/* Outgoing Message Skeleton */}
      <div className="skeleton-message outgoing">
        <div className="skeleton-content">
          <div className="skeleton-text medium" />
        </div>
      </div>
    </div>
  );
};

export default MessageFeedSkeleton;
