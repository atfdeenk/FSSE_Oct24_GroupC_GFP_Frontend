import { FaMoneyBillWave } from 'react-icons/fa';

interface TopupRequestsHeaderProps {
  title: string;
  description: string;
}

export default function TopupRequestsHeader({ title, description }: TopupRequestsHeaderProps) {
  return (
    <div className="mb-4">
      <div className="flex items-center">
        <div className="bg-amber-900/30 p-2 rounded-full mr-3 border border-amber-700/50">
          <FaMoneyBillWave className="text-amber-400" size={20} />
        </div>
        <h2 className="text-2xl font-bold text-white">{title}</h2>
      </div>
      <p className="text-neutral-400 text-sm mt-2">{description}</p>
    </div>
  );
}
