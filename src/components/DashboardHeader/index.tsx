// components/DashboardHeader.tsx
'use client';

interface HeaderProps {
  onToggleSidebar: () => void;
}

const DashboardHeader: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  return (
    <header className="flex items-center justify-between bg-gray-100 px-4 py-3 shadow z-10">
      <button
        onClick={onToggleSidebar}
        className="text-gray-800 text-xl focus:outline-none"
      >
        ☰ {/* Toggle icon */}
      </button>
      <h1 className="text-xl font-semibold">Dashboard</h1>
    </header>
  );
};

export default DashboardHeader;
