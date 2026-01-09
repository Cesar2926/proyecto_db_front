import { Card } from '@/components/ui/card';

interface CardProps {
  title: string;
  icon: React.ReactNode;
  onClick?: () => void;
}

function HomeCard({ title, icon, onClick }: CardProps) {
  return (
    <Card
      onClick={onClick}
      className="relative w-full h-full min-h-[200px] bg-gradient-to-br from-red-900 to-red-950 rounded-2xl p-6 flex flex-col items-start justify-between hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 group overflow-hidden cursor-pointer border-none"
    >
      {/* Ícono decorativo (grande y con opacidad) */}
      <div className="absolute top-4 right-4 text-red-700/30 transform group-hover:scale-105 group-hover:rotate-3 transition-transform duration-300">
        {icon}
      </div>

      {/* Título */}
      <div className="relative z-10 mt-auto">
        <h3 className="text-white font-bold text-xl md:text-2xl lg:text-3xl text-left uppercase tracking-wide">
          {title}
        </h3>
      </div>
    </Card>
  );
}

export default HomeCard;
