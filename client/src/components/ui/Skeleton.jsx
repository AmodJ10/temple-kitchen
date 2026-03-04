const Skeleton = ({ className = '', count = 1 }) => {
    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className={`skeleton ${className}`} />
            ))}
        </>
    );
};

export default Skeleton;
