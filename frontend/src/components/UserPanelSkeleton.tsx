import React from "react";
import "../styles/SkeletonLoader.css";

const UserPanelSkeleton: React.FC = () => {
  return (
    <div className="user-panel-skeleton">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="skeleton-item"
          style={{
            width: "100%",
            height: "50px",
            backgroundColor: "#ffd699",
            marginBottom: "10px",
          }}
        />
      ))}
    </div>
  );
};

export default UserPanelSkeleton;
