import { getStatusColor, getStatusDot } from '../../utils/helpers';

export const Badge = ({ status, children, dot = true, className = '' }) => {
  return (
    <span
      className={`
        inline-flex
        items-center
        gap-1.5
        px-3
        py-1
        rounded-full
        text-xs
        font-medium
        ${getStatusColor(status)}
        ${className}
      `}
    >
      {dot && <span className={`w-2 h-2 rounded-full ${getStatusDot(status)}`} />}
      {children || status}
    </span>
  );
};