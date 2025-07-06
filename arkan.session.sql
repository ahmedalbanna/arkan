CREATE TABLE Project (
    id VARCHAR(255) PRIMARY KEY,
    userId VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('FlutterFlow', 'UI/UX Design', 'AI', 'Web Design')),
    liveLink VARCHAR(255),
    summaryShort TEXT,
    createdAt DATETIME NOT NULL
);

CREATE TABLE Media (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    projectId VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('image', 'video')),
    url VARCHAR(255) NOT NULL,
    alt VARCHAR(255) NOT NULL,
    aiHint VARCHAR(255),
    FOREIGN KEY (projectId) REFERENCES Project(id) ON DELETE CASCADE
);

CREATE TABLE Comment (
    id VARCHAR(255) PRIMARY KEY,
    projectId VARCHAR(255) NOT NULL,
    userId VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    createdAt DATETIME NOT NULL,
    FOREIGN KEY (projectId) REFERENCES Project(id) ON DELETE CASCADE
);

CREATE TABLE Tag (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE ProjectTag (
    projectId VARCHAR(255) NOT NULL,
    tagId INTEGER NOT NULL,
    PRIMARY KEY (projectId, tagId),
    FOREIGN KEY (projectId) REFERENCES Project(id) ON DELETE CASCADE,
    FOREIGN KEY (tagId) REFERENCES Tag(id) ON DELETE CASCADE
);

CREATE TABLE Technology (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE ProjectTechnology (
    projectId VARCHAR(255) NOT NULL,
    technologyId INTEGER NOT NULL,
    PRIMARY KEY (projectId, technologyId),
    FOREIGN KEY (projectId) REFERENCES Project(id) ON DELETE CASCADE,
    FOREIGN KEY (technologyId) REFERENCES Technology(id) ON DELETE CASCADE
);

-- Sample Data (Note: Adjust values as needed)

INSERT INTO Project (id, userId, title, description, category, liveLink, summaryShort, createdAt) VALUES
('proj-1', 'user-1', 'Task Manager App', 'A mobile app for managing daily tasks.', 'FlutterFlow', 'https://example.com/task-app', 'Productivity app for task organization.', '2024-01-15 09:00:00'),
('proj-2', 'user-2', 'E-commerce Website Redesign', 'Complete redesign of an e-commerce platform.', 'UI/UX Design', 'https://example.com/ecommerce-redesign', 'Redesign to improve user experience.', '2023-11-20 14:30:00');

INSERT INTO Media (projectId, type, url, alt, aiHint) VALUES
('proj-1', 'image', 'https://placehold.co/800x600.png', 'Task Manager App Screenshot 1', 'mobile app'),
('proj-1', 'image', 'https://placehold.co/800x600.png', 'Task Manager App Screenshot 2', 'task manager'),
('proj-2', 'image', 'https://placehold.co/800x600.png', 'E-commerce UI Design', 'website design'),
('proj-2', 'image', 'https://placehold.co/800x600.png', 'E-commerce Mobile View', 'ecommerce platform'),
('proj-2', 'video', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'E-commerce Interactive Demo', NULL);

INSERT INTO Comment (id, projectId, userId, content, createdAt) VALUES
('comment-1', 'proj-1', 'user-2', 'Great work! Clean design and smooth functionality.', '2024-01-20 10:00:00'),
('comment-2', 'proj-1', 'user-3', 'I like your use of Firebase. Any integration challenges?', '2024-01-20 11:30:00'),
('comment-3', 'proj-2', 'user-1', 'Stunning color palette! Excellent user experience.', '2023-12-05 14:00:00');

INSERT INTO Tag (name) VALUES
('FlutterFlow'), ('Productivity'), ('Mobile App'), ('UI/UX'), ('eCommerce'), ('Web Design'), ('React');

INSERT INTO ProjectTag (projectId, tagId) VALUES
('proj-1', (SELECT id FROM Tag WHERE name = 'FlutterFlow')),
('proj-1', (SELECT id FROM Tag WHERE name = 'Productivity')),
('proj-1', (SELECT id FROM Tag WHERE name = 'Mobile App')),
('proj-2', (SELECT id FROM Tag WHERE name = 'UI/UX')),
('proj-2', (SELECT id FROM Tag WHERE name = 'eCommerce')),
('proj-2', (SELECT id FROM Tag WHERE name = 'Web Design')),
('proj-2', (SELECT id FROM Tag WHERE name = 'React'));

INSERT INTO Technology (name) VALUES
('FlutterFlow'), ('Firebase Auth'), ('Firestore'), ('Figma'), ('React'), ('Styled Components');

INSERT INTO ProjectTechnology (projectId, technologyId) VALUES
('proj-1', (SELECT id FROM Technology WHERE name = 'FlutterFlow')),
('proj-1', (SELECT id FROM Technology WHERE name = 'Firebase Auth')),
('proj-1', (SELECT id FROM Technology WHERE name = 'Firestore')),
('proj-2', (SELECT id FROM Technology WHERE name = 'Figma')),
('proj-2', (SELECT id FROM Technology WHERE name = 'React')),
('proj-2', (SELECT id FROM Technology WHERE name = 'Styled Components'));
