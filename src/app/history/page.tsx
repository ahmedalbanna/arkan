import HistoryViewer from '@/components/HistoryViewer';
import { History } from 'lucide-react';

export default function HistoryPage() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary flex items-center justify-center gap-4">
          <History className="w-10 h-10" />
          سجل الأنشطة
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          استعرض وحمّل جميع المخرجات التي قمت بتوليدها باستخدام أدوات الذكاء الاصطناعي.
        </p>
      </div>
      <HistoryViewer />
    </div>
  );
}
