
'use client';

export function WLogo() {
  return <div className="w-4 h-4 bg-[#2E68EB] text-white flex items-center justify-center rounded-sm text-xs font-bold">W</div>;
}
export function PLogo() {
  return <div className="w-4 h-4 bg-[#D95F3B] text-white flex items-center justify-center rounded-sm text-xs font-bold">P</div>;
}
export function SLogo() {
  return <div className="w-4 h-4 bg-[#308A5D] text-white flex items-center justify-center rounded-sm text-xs font-bold">S</div>;
}
export function PDFLogo() {
    return <div className="w-4 h-4 bg-red-600 text-white flex items-center justify-center rounded-sm text-xs font-bold">P</div>;
}
export function HomeLogo() {
    return <div className="w-4 h-4 bg-gray-600 text-white flex items-center justify-center rounded-sm text-xs font-bold">W</div>;
}

export function NavItem({ icon, label, isActive, onClick, isVertical = true }: { icon: React.ReactNode, label: string, isActive?: boolean, onClick?: () => void, isVertical?: boolean }) {
  return (
    <button onClick={onClick} className={`flex items-center text-sm font-medium w-full text-left ${isActive ? 'bg-blue-100 text-blue-700' : 'text-slate-700 hover:bg-slate-200'} ${isVertical ? 'flex-col h-16 justify-center text-center' : 'p-3 rounded-md'}`}>
      <div className={`flex items-center justify-center ${isVertical ? 'mb-1' : 'mr-3'}`}>{icon}</div>
      <span className="text-xs">{label}</span>
    </button>
  );
}
