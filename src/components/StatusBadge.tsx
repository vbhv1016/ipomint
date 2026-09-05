import { IPOStatus } from '@/data/ipoData';

const statusConfig: Record<IPOStatus, string> = {
  open: 'status-badge status-open',
  upcoming: 'status-badge status-upcoming',
  closed: 'status-badge status-closed',
  listed: 'status-badge status-listed',
};

const statusLabels: Record<IPOStatus, string> = {
  open: 'Open',
  upcoming: 'Upcoming',
  closed: 'Closed',
  listed: 'Listed',
};

const StatusBadge = ({ status }: { status: IPOStatus }) => (
  <span className={statusConfig[status]}>{statusLabels[status]}</span>
);

export default StatusBadge;
