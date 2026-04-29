import { memo } from 'react';
import { getBezierPath, EdgeLabelRenderer, useReactFlow } from 'reactflow';

const CustomEdge = memo(({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}) => {
  const { setEdges } = useReactFlow();
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: 0.15, // Steeper, more technical curvature
  });

  const isActive = data?.active || false;
  const edgeColor = isActive ? '#FF5F1F' : 'rgba(255,255,255,0.1)';

  return (
    <>
      <defs>
        {/* Laser glow filter */}
        <filter id={`laser-glow-${id}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        
        <linearGradient id={`pulse-grad-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="50%" stopColor="#FF5F1F" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>

      {/* Background path (subtle) */}
      <path
        d={edgePath}
        fill="none"
        stroke="rgba(255,255,255,0.02)"
        strokeWidth={4}
        strokeLinecap="square"
      />

      {/* Main edge path */}
      <path
        id={id}
        className={`react-flow__edge-path transition-all duration-500`}
        d={edgePath}
        fill="none"
        stroke={edgeColor}
        strokeWidth={isActive ? 2 : 1}
        strokeDasharray={isActive ? "0" : "4 4"} // Dashed when inactive, solid when active
        strokeLinecap="square"
        markerEnd={markerEnd}
        style={{
          ...style,
          filter: isActive ? `url(#laser-glow-${id})` : 'none',
        }}
      />

      {/* Data pulse particle (The "Kinetic" element) */}
      {isActive && (
        <circle r="2" fill="#FF5F1F">
          <animateMotion
            dur="1.5s"
            repeatCount="indefinite"
            path={edgePath}
            calcMode="linear"
          />
          <animate
            attributeName="r"
            values="2;3;2"
            dur="0.5s"
            repeatCount="indefinite"
          />
        </circle>
      )}

      {/* Edge label - Monospace industrial tag with Delete button */}
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="flex items-center gap-1 group/edge-label"
        >
          {data?.label && (
            <div className="px-1.5 py-0.5 bg-surface-1 border border-white/10 text-[8px] font-mono text-white/40 uppercase tracking-[0.2em]">
              DATA_FLOW::{data.label}
            </div>
          )}
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              setEdges((es) => es.filter((edge) => edge.id !== id));
            }}
            className="w-4 h-4 bg-surface-1 border border-white/10 flex items-center justify-center text-[10px] text-white/20 hover:text-red-400 hover:border-red-500/30 transition-all opacity-0 group-hover/edge-label:opacity-100"
            title="Remove Connection"
          >
            ×
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
});

CustomEdge.displayName = 'CustomEdge';
export default CustomEdge;
