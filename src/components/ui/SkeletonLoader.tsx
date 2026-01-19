import React from 'react';

interface SkeletonLoaderProps {
  count?: number;
  height?: string;
  width?: string;
  variant?: 'text' | 'rectangular' | 'circular';
  animation?: 'pulse' | 'wave' | false;
}

/**
 * Компонент для отображения skeleton loaders во время загрузки контента
 */
export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  count = 1,
  height = '20px',
  width = '100%',
  variant = 'text',
  animation = 'pulse'
}) => {
  const getSkeletonStyle = () => {
    const baseStyle = {
      backgroundColor: '#e5e7eb',
      borderRadius: variant === 'circular' ? '50%' : '4px',
      width,
      height
    };

    if (!animation) return baseStyle;

    const animationStyle = animation === 'wave' 
      ? {
          background: 'linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%)',
          backgroundSize: '200% 100%',
          animation: 'wave 1.5s infinite'
        }
      : {
          animation: 'pulse 1.5s ease-in-out infinite'
        };

    return { ...baseStyle, ...animationStyle };
  };

  const renderSkeleton = (index: number) => (
    <div
      key={index}
      style={{
        ...getSkeletonStyle(),
        marginBottom: index < count - 1 ? '10px' : '0'
      }}
    />
  );

  return (
    <>
      {Array.from({ length: count }, (_, index) => renderSkeleton(index))}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        @keyframes wave {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </>
  );
};

/**
 * Компонент для skeleton loading карточки проекта
 */
export const ProjectCardSkeleton: React.FC = () => (
  <div style={{
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '20px',
    backgroundColor: 'white'
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
      <SkeletonLoader width="150px" height="24px" />
      <SkeletonLoader width="80px" height="24px" variant="rectangular" />
    </div>
    <SkeletonLoader height="16px" width="100%" count={2} />
  </div>
);

/**
 * Компонент для skeleton loading карточки задачи
 */
export const TaskCardSkeleton: React.FC = () => (
  <div style={{
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '20px',
    backgroundColor: 'white'
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
      <SkeletonLoader width="120px" height="20px" />
      <div style={{ display: 'flex', gap: '5px' }}>
        <SkeletonLoader width="40px" height="30px" variant="rectangular" />
        <SkeletonLoader width="40px" height="30px" variant="rectangular" />
      </div>
    </div>
    <SkeletonLoader height="16px" width="100%" count={3} />
    <div style={{ marginTop: '15px' }}>
      <SkeletonLoader width="100%" height="8px" />
    </div>
  </div>
);

/**
 * Компонент для skeleton loading карточки ресурса
 */
export const ResourceCardSkeleton: React.FC = () => (
  <div style={{
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '20px',
    backgroundColor: 'white'
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
      <SkeletonLoader width="120px" height="18px" />
      <SkeletonLoader width="100px" height="20px" variant="rectangular" />
    </div>
    <SkeletonLoader height="16px" width="100%" count={2} />
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '15px' }}>
      <div>
        <SkeletonLoader height="16px" width="60px" />
        <SkeletonLoader height="6px" width="100%" style={{ marginTop: '5px' }} />
      </div>
      <div>
        <SkeletonLoader height="16px" width="70px" />
        <SkeletonLoader height="20px" width="60px" style={{ marginTop: '5px' }} />
      </div>
    </div>
  </div>
);

