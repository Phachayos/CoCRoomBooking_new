import styles from './Skeleton.module.css';

export default function Skeleton({ width, height, borderRadius, style, className = '' }) {
  const mergedStyle = {
    width: width || '100%',
    height: height || '1rem',
    borderRadius: borderRadius || 'var(--radius-sm)',
    ...style,
  };

  return (
    <div 
      className={`${styles.skeleton} ${className}`} 
      style={mergedStyle}
    ></div>
  );
}
