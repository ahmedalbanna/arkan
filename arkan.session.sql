DROP Table 'users';

-- Insert data into users table
INSERT INTO users (id, name,email, avatar_url, bio,credits,created_at) VALUES
('user-1', 'علياء سالم','alyaa.salem@example.com', 'https://placehold.co/100x100.png', 'مطور تطبيقات FlutterFlow متخصص في بناء تطبيقات جوال تفاعلية وعالية الأداء. شغوف بتحويل الأفكار إلى واقع ملموس.',25,'2023-01-15T09:00:00Z'),
('user-2', 'خالد الغامدي','khaled.alghamdi@example.com', 'https://placehold.co/100x100.png', 'مصمم واجهات مستخدم ومطور ويب بخبرة تزيد عن 5 سنوات. أركز على إنشاء تجارب مستخدم جذابة وسهلة الاستخدام.',25,'2023-01-15T09:00:00Z'),
('user-3', 'فاطمة الزهراء','fatima.alzahraa@example.com', 'https://placehold.co/100x100.png', 'باحثة ومهندسة في مجال الذكاء الاصطناعي. أعمل على تطوير نماذج تعلم الآلة لحل المشكلات المعقدة في مختلف الصناعات.',25,'2023-01-15T09:00:00Z');

-- Insert data into projects table (Note: Dates need to be converted to a string format if your database requires it)
INSERT INTO projects (id, user_id, title, description, category, live_link, summary_short, created_at) VALUES
('proj-1', 'user-1', 'تطبيق إدارة المهام "إنجاز"', 'تطبيق جوال تم تطويره باستخدام FlutterFlow لمساعدة المستخدمين على تنظيم مهامهم اليومية وزيادة إنتاجيتهم. يتميز بواجهة مستخدم بسيطة وميزات متقدمة مثل التذكيرات الذكية والتقارير الأسبوعية.', 'FlutterFlow', 'https://example.com/enjaz-app', 'تطبيق إنتاجية لتنظيم المهام اليومية مع تذكيرات ذكية.', '2024-04-15T09:00:00Z'),
('proj-2', 'user-2', 'تصميم موقع للتجارة الإلكترونية "متجركم"', 'إعادة تصميم كاملة لمنصة تجارة إلكترونية رائدة، مع التركيز على تحسين تجربة المستخدم وزيادة معدلات التحويل. تم استخدام Figma للتصميم الأولي و React للتطوير.', 'UI/UX Design', NULL, 'إعادة تصميم منصة تجارة إلكترونية لتحسين تجربة المستخدم.', '2024-03-20T14:30:00Z'),
('proj-3', 'user-3', 'نظام توصيات ذكي للمحتوى', 'مشروع يستخدم تعلم الآلة لتحليل سلوك المستخدم وتقديم توصيات مخصصة للمقالات والأخبار. تم بناء النموذج باستخدام TensorFlow وتم دمجه في تطبيق ويب.', 'AI', 'https://example.com/ai-recommender', 'نظام توصيات محتوى يعتمد على تعلم الآلة لتحليل سلوك المستخدم.', '2024-05-01T11:00:00Z'),
('proj-4', 'user-2', 'موقع تعريفي لشركة استشارية', 'تصميم وتطوير موقع ويب حديث لشركة استشارات إدارية. يهدف الموقع إلى عكس هوية الشركة الاحترافية وتقديم خدماتها بشكل واضح وجذاب.', 'Web Design', 'https://example.com/consulting-site', 'موقع تعريفي أنيق يعكس احترافية شركة استشارية.', '2024-02-18T16:45:00Z'),
('proj-5', 'user-1', 'تطبيق حجوزات مطاعم', 'تطبيق يساعد المستخدمين على اكتشاف وحجز الطاولات في المطاعم بسهولة. تم بناؤه بالكامل على FlutterFlow مع تكامل خرائط Google.', 'FlutterFlow', NULL, 'تطبيق لحجز المطاعم مع تكامل خرائط Google.', '2023-12-10T18:00:00Z');

-- Insert data into media table (Remember to populate the 'id' column appropriately, potentially with auto-increment or a UUID)
INSERT INTO media (project_id, type, url, alt, ai_hint) VALUES
('proj-1', 'image', 'https://placehold.co/800x600.png', 'إنجاز App Screenshot 1', 'mobile app'),
('proj-1', 'image', 'https://placehold.co/800x600.png', 'إنجاز App Screenshot 2', 'task manager'),
('proj-2', 'image', 'https://placehold.co/800x600.png', 'متجركم UI Design', 'website design'),
('proj-2', 'image', 'https://placehold.co/800x600.png', 'متجركم Mobile View', 'ecommerce platform'),
('proj-2', 'video', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'متجركم Interactive Demo', NULL),
('proj-3', 'image', 'https://placehold.co/800x600.png', 'AI System Architecture', 'data flow'),
('proj-4', 'image', 'https://placehold.co/800x600.png', 'Corporate Website Homepage', 'corporate website'),
('proj-4', 'image', 'https://placehold.co/800x600.png', 'Services Page', 'web page'),
('proj-5', 'image', 'https://placehold.co/800x600.png', 'Restaurant Booking App', 'restaurant app'),
('proj-5', 'image', 'https://placehold.co/800x600.png', 'Map View', 'map interface');

-- Insert data into comments table (Again, handle 'id' as needed)
INSERT INTO comments (id, project_id, user_id, content, created_at) VALUES
('comment-1', 'proj-1', 'user-2', 'عمل رائع! التصميم نظيف والوظائف سلسة.', '2024-05-10T10:00:00Z'),
('comment-2', 'proj-1', 'user-3', 'أعجبني استخدامكم لـ Firebase. هل واجهتم أي تحديات في التكامل؟', '2024-05-10T11:30:00Z'),
('comment-3', 'proj-2', 'user-1', 'لوحة الألوان مذهلة! تجربة المستخدم رائعة.', '2024-05-11T14:00:00Z'),
('comment-4', 'proj-3', 'user-2', 'فكرة مبتكرة لاستخدام الذكاء الاصطناعي. هل يمكن مشاركة المزيد عن النموذج المستخدم؟', '2024-05-12T09:00:00Z');

-- For Skills, Tags, and Technologies, we need to first insert the unique names, then create the relationships

-- Insert Skills
INSERT INTO skills (name) VALUES
('FlutterFlow'), ('Firebase'), ('UI/UX'), ('Mobile Development'), ('UI/UX Design'), ('Figma'), ('React'), ('Next.js'), ('Web Design'),
('Machine Learning'), ('Python'), ('TensorFlow'), ('Data Analysis'), ('Booking'), ('Food App'), ('Google Maps API');

-- Insert User Skills (Lookup Skill IDs first)
INSERT INTO user_skills (user_id, skill_id) VALUES
('user-1', (SELECT id FROM skills WHERE name = 'FlutterFlow')),
('user-1', (SELECT id FROM skills WHERE name = 'Firebase')),
('user-1', (SELECT id FROM skills WHERE name = 'UI/UX')),
('user-1', (SELECT id FROM skills WHERE name = 'Mobile Development')),
('user-2', (SELECT id FROM skills WHERE name = 'UI/UX Design')),
('user-2', (SELECT id FROM skills WHERE name = 'Figma')),
('user-2', (SELECT id FROM skills WHERE name = 'React')),
('user-2', (SELECT id FROM skills WHERE name = 'Next.js')),
('user-2', (SELECT id FROM skills WHERE name = 'Web Design')),
('user-3', (SELECT id FROM skills WHERE name = 'Machine Learning')),
('user-3', (SELECT id FROM skills WHERE name = 'Python')),
('user-3', (SELECT id FROM skills WHERE name = 'TensorFlow')),
('user-3', (SELECT id FROM skills WHERE name = 'Data Analysis'));

-- Insert Tags
INSERT INTO tags (name) VALUES
('FlutterFlow'), ('Productivity'), ('Mobile App'), ('UI/UX'), ('eCommerce'), ('Web Design'), ('React'), ('AI'), ('Machine Learning'),
('Recommendation System'), ('Python'), ('Corporate'), ('Next.js'), ('Booking'), ('Food App');

-- Insert Project Tags
INSERT INTO project_tags (project_id, tag_id) VALUES
('proj-1', (SELECT id FROM tags WHERE name = 'FlutterFlow')),
('proj-1', (SELECT id FROM tags WHERE name = 'Productivity')),
('proj-1', (SELECT id FROM tags WHERE name = 'Mobile App')),
('proj-2', (SELECT id FROM tags WHERE name = 'UI/UX')),
('proj-2', (SELECT id FROM tags WHERE name = 'eCommerce')),
('proj-2', (SELECT id FROM tags WHERE name = 'Web Design')),
('proj-2', (SELECT id FROM tags WHERE name = 'React')),
('proj-3', (SELECT id FROM tags WHERE name = 'AI')),
('proj-3', (SELECT id FROM tags WHERE name = 'Machine Learning')),
('proj-3', (SELECT id FROM tags WHERE name = 'Recommendation System')),
('proj-3', (SELECT id FROM tags WHERE name = 'Python')),
('proj-4', (SELECT id FROM tags WHERE name = 'Web Design')),
('proj-4', (SELECT id FROM tags WHERE name = 'Corporate')),
('proj-4', (SELECT id FROM tags WHERE name = 'Next.js')),
('proj-5', (SELECT id FROM tags WHERE name = 'FlutterFlow')),
('proj-5', (SELECT id FROM tags WHERE name = 'Booking')),
('proj-5', (SELECT id FROM tags WHERE name = 'Food App'));

-- Insert Technologies
INSERT INTO technologies (name) VALUES
('FlutterFlow'), ('Firebase Auth'), ('Firestore'), ('Figma'), ('React'), ('Styled Components'), ('Python'), ('TensorFlow'), ('Flask'),
('Next.js'), ('Tailwind CSS'), ('Framer Motion'), ('Google Maps API'), ('Firebase');

-- Insert Project Technologies (Summary)
INSERT INTO summary_technologies (project_id, technology_id) VALUES
('proj-1', (SELECT id FROM technologies WHERE name = 'FlutterFlow')),
('proj-1', (SELECT id FROM technologies WHERE name = 'Firebase Auth')),
('proj-1', (SELECT id FROM technologies WHERE name = 'Firestore')),
('proj-2', (SELECT id FROM technologies WHERE name = 'Figma')),
('proj-2', (SELECT id FROM technologies WHERE name = 'React')),
('proj-2', (SELECT id FROM technologies WHERE name = 'Styled Components')),
('proj-3', (SELECT id FROM technologies WHERE name = 'Python')),
('proj-3', (SELECT id FROM technologies WHERE name = 'TensorFlow')),
('proj-3', (SELECT id FROM technologies WHERE name = 'Flask')),
('proj-3', (SELECT id FROM technologies WHERE name = 'React')), -- Added React as it's mentioned in the description
('proj-4', (SELECT id FROM technologies WHERE name = 'Next.js')),
('proj-4', (SELECT id FROM technologies WHERE name = 'Tailwind CSS')),
('proj-4', (SELECT id FROM technologies WHERE name = 'Framer Motion')),
('proj-5', (SELECT id FROM technologies WHERE name = 'FlutterFlow')),
('proj-5', (SELECT id FROM technologies WHERE name = 'Google Maps API')),
('proj-5', (SELECT id FROM technologies WHERE name = 'Firebase'));
