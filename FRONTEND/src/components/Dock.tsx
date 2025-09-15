import React, { useState } from 'react';

interface DockItem {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

interface DockProps {
  items: DockItem[];
  panelHeight?: number;
  baseItemSize?: number;
  magnification?: number;
}

const Dock: React.FC<DockProps> = ({
  items,
  panelHeight = 68,
  baseItemSize = 50,
  magnification = 70,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const getItemSize = (index: number) => {
    if (hoveredIndex === null) return baseItemSize;

    const distance = Math.abs(index - hoveredIndex);
    const scale = Math.max(1, magnification / (distance * 40 + 1));

    return baseItemSize * scale;
  };

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 8,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'flex-end',
        height: panelHeight,
        gap: 16,
        borderRadius: 16,
        backgroundColor: 'white',
        border: '1px solid #ccc',
        padding: '0 8px 8px',
        zIndex: 50,
      }}
    >
      {items.map((item, index) => (
        <div
          key={index}
          style={{
            position: 'relative',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 10,
            backgroundColor: 'white',
            border: '1px solid #ccc',
            boxShadow:
              '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            cursor: 'pointer',
            outline: 'none',
            width: getItemSize(index),
            height: getItemSize(index),
          }}
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
          onClick={item.onClick}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: getItemSize(index) * 0.4,
            }}
          >
            {item.icon}
          </div>

          {/* Tooltip */}
          <div
            style={{
              position: 'absolute',
              top: -24,
              left: '50%',
              width: 'fit-content',
              whiteSpace: 'pre',
              borderRadius: 6,
              border: '1px solid #222',
              backgroundColor: '#060010',
              padding: '2px 8px',
              fontSize: 12,
              color: 'white',
              transform: 'translateX(-50%)',
              opacity: hoveredIndex === index ? 1 : 0,
              visibility: hoveredIndex === index ? 'visible' : 'hidden',
              transition: 'opacity 0.2s, visibility 0.2s',
              pointerEvents: 'none',
            }}
          >
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Dock;
