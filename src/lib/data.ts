import type { Project, User, Comment } from './types';

export const MOCK_USERS: User[] = [
  {
    id: 'user-1',
    name: 'علياء سالم',
    avatarUrl: 'https://placehold.co/100x100.png',
    bio: 'مطور تطبيقات FlutterFlow متخصص في بناء تطبيقات جوال تفاعلية وعالية الأداء. شغوف بتحويل الأفكار إلى واقع ملموس.',
    skills: ['FlutterFlow', 'Firebase', 'UI/UX', 'Mobile Development'],
  },
  {
    id: 'user-2',
    name: 'خالد الغامدي',
    avatarUrl: 'https://placehold.co/100x100.png',
    bio: 'مصمم واجهات مستخدم ومطور ويب بخبرة تزيد عن 5 سنوات. أركز على إنشاء تجارب مستخدم جذابة وسهلة الاستخدام.',
    skills: ['UI/UX Design', 'Figma', 'React', 'Next.js', 'Web Design'],
  },
   {
    id: 'user-3',
    name: 'فاطمة الزهراء',
    avatarUrl: 'https://placehold.co/100x100.png',
    bio: 'باحثة ومهندسة في مجال الذكاء الاصطناعي. أعمل على تطوير نماذج تعلم الآلة لحل المشكلات المعقدة في مختلف الصناعات.',
    skills: ['Machine Learning', 'Python', 'TensorFlow', 'Data Analysis'],
  },
];

export const MOCK_COMMENTS: Comment[] = [
  { id: 'comment-1', projectId: 'proj-1', userId: 'user-2', content: 'عمل رائع! التصميم نظيف والوظائف سلسة.', createdAt: '2024-05-10T10:00:00Z' },
  { id: 'comment-2', projectId: 'proj-1', userId: 'user-3', content: 'أعجبني استخدامكم لـ Firebase. هل واجهتم أي تحديات في التكامل؟', createdAt: '2024-05-10T11:30:00Z' },
  { id: 'comment-3', projectId: 'proj-2', userId: 'user-1', content: 'لوحة الألوان مذهلة! تجربة المستخدم رائعة.', createdAt: '2024-05-11T14:00:00Z' },
  { id: 'comment-4', projectId: 'proj-3', userId: 'user-2', content: 'فكرة مبتكرة لاستخدام الذكاء الاصطناعي. هل يمكن مشاركة المزيد عن النموذج المستخدم؟', createdAt: '2024-05-12T09:00:00Z' },
];

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    userId: 'user-1',
    title: 'تطبيق إدارة المهام "إنجاز"',
    description: 'تطبيق جوال تم تطويره باستخدام FlutterFlow لمساعدة المستخدمين على تنظيم مهامهم اليومية وزيادة إنتاجيتهم. يتميز بواجهة مستخدم بسيطة وميزات متقدمة مثل التذكيرات الذكية والتقارير الأسبوعية.',
    category: 'FlutterFlow',
    tags: ['FlutterFlow', 'Productivity', 'Mobile App'],
    media: [
      { type: 'image', url: 'https://placehold.co/800x600.png', alt: 'إنجاز App Screenshot 1', aiHint: 'mobile app' },
      { type: 'image', url: 'https://placehold.co/800x600.png', alt: 'إنجاز App Screenshot 2', aiHint: 'task manager' },
    ],
    liveLink: 'https://example.com/enjaz-app',
    summary: {
      short: 'تطبيق إنتاجية لتنظيم المهام اليومية مع تذكيرات ذكية.',
      technologies: ['FlutterFlow', 'Firebase Auth', 'Firestore'],
    },
    comments: MOCK_COMMENTS.filter(c => c.projectId === 'proj-1'),
    createdAt: '2024-04-15T09:00:00Z',
  },
  {
    id: 'proj-2',
    userId: 'user-2',
    title: 'تصميم موقع للتجارة الإلكترونية "متجركم"',
    description: 'إعادة تصميم كاملة لمنصة تجارة إلكترونية رائدة، مع التركيز على تحسين تجربة المستخدم وزيادة معدلات التحويل. تم استخدام Figma للتصميم الأولي و React للتطوير.',
    category: 'UI/UX Design',
    tags: ['UI/UX', 'eCommerce', 'Web Design', 'React'],
    media: [
      { type: 'image', url: 'https://placehold.co/800x600.png', alt: 'متجركم UI Design', aiHint: 'website design' },
      { type: 'image', url: 'https://placehold.co/800x600.png', alt: 'متجركم Mobile View', aiHint: 'ecommerce platform' },
      { type: 'video', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', alt: 'متجركم Interactive Demo' },
    ],
    summary: {
      short: 'إعادة تصميم منصة تجارة إلكترونية لتحسين تجربة المستخدم.',
      technologies: ['Figma', 'React', 'Styled Components'],
    },
    comments: MOCK_COMMENTS.filter(c => c.projectId === 'proj-2'),
    createdAt: '2024-03-20T14:30:00Z',
  },
  {
    id: 'proj-3',
    userId: 'user-3',
    title: 'نظام توصيات ذكي للمحتوى',
    description: 'مشروع يستخدم تعلم الآلة لتحليل سلوك المستخدم وتقديم توصيات مخصصة للمقالات والأخبار. تم بناء النموذج باستخدام TensorFlow وتم دمجه في تطبيق ويب.',
    category: 'AI',
    tags: ['AI', 'Machine Learning', 'Recommendation System', 'Python'],
    media: [
      { type: 'image', url: 'https://placehold.co/800x600.png', alt: 'AI System Architecture', aiHint: 'data flow' },
    ],
    liveLink: 'https://example.com/ai-recommender',
    summary: {
      short: 'نظام توصيات محتوى يعتمد على تعلم الآلة لتحليل سلوك المستخدم.',
      technologies: ['Python', 'TensorFlow', 'Flask', 'React'],
    },
    comments: MOCK_COMMENTS.filter(c => c.projectId === 'proj-3'),
    createdAt: '2024-05-01T11:00:00Z',
  },
  {
    id: 'proj-4',
    userId: 'user-2',
    title: 'موقع تعريفي لشركة استشارية',
    description: 'تصميم وتطوير موقع ويب حديث لشركة استشارات إدارية. يهدف الموقع إلى عكس هوية الشركة الاحترافية وتقديم خدماتها بشكل واضح وجذاب.',
    category: 'Web Design',
    tags: ['Web Design', 'Corporate', 'Next.js'],
    media: [
      { type: 'image', url: 'https://placehold.co/800x600.png', alt: 'Corporate Website Homepage', aiHint: 'corporate website' },
      { type: 'image', url: 'https://placehold.co/800x600.png', alt: 'Services Page', aiHint: 'web page' },
    ],
    liveLink: 'https://example.com/consulting-site',
    summary: {
      short: 'موقع تعريفي أنيق يعكس احترافية شركة استشارية.',
      technologies: ['Next.js', 'Tailwind CSS', 'Framer Motion'],
    },
    comments: [],
    createdAt: '2024-02-18T16:45:00Z',
  },
   {
    id: 'proj-5',
    userId: 'user-1',
    title: 'تطبيق حجوزات مطاعم',
    description: 'تطبيق يساعد المستخدمين على اكتشاف وحجز الطاولات في المطاعم بسهولة. تم بناؤه بالكامل على FlutterFlow مع تكامل خرائط Google.',
    category: 'FlutterFlow',
    tags: ['FlutterFlow', 'Booking', 'Food App'],
    media: [
      { type: 'image', url: 'https://placehold.co/800x600.png', alt: 'Restaurant Booking App', aiHint: 'restaurant app' },
      { type: 'image', url: 'https://placehold.co/800x600.png', alt: 'Map View', aiHint: 'map interface' },
    ],
    summary: {
      short: 'تطبيق لحجز المطاعم مع تكامل خرائط Google.',
      technologies: ['FlutterFlow', 'Google Maps API', 'Firebase'],
    },
    comments: [],
    createdAt: '2023-12-10T18:00:00Z',
  },
];
