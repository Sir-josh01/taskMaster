
const SkeletonLoader = () => {
  return (
    <div className="skeleton-container">
      {[1, 2, 3].map((n) => (
        <div key={n} className="skeleton-card">
          <div className="skeleton-title"></div>
          <div className="skeleton-text"></div>
          <div className="skeleton-footer">
            <div className="skeleton-button"></div>
            <div className="skeleton-button"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;