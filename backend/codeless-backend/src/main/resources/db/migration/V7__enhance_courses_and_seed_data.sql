-- V7: Enhance Course table with all missing fields and seed realistic data

-- Add new columns to course table
ALTER TABLE course ADD COLUMN IF NOT EXISTS original_price NUMERIC(12,2);
ALTER TABLE course ADD COLUMN IF NOT EXISTS instructor_name VARCHAR(200);
ALTER TABLE course ADD COLUMN IF NOT EXISTS instructor_title VARCHAR(200);
ALTER TABLE course ADD COLUMN IF NOT EXISTS instructor_avatar_url TEXT;
ALTER TABLE course ADD COLUMN IF NOT EXISTS level VARCHAR(20);
ALTER TABLE course ADD COLUMN IF NOT EXISTS rating NUMERIC(3,2);
ALTER TABLE course ADD COLUMN IF NOT EXISTS review_count INTEGER;
ALTER TABLE course ADD COLUMN IF NOT EXISTS lesson_count INTEGER;
ALTER TABLE course ADD COLUMN IF NOT EXISTS duration_hours INTEGER;
ALTER TABLE course ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE course ADD COLUMN IF NOT EXISTS end_date DATE;
ALTER TABLE course ADD COLUMN IF NOT EXISTS session_count INTEGER;
ALTER TABLE course ADD COLUMN IF NOT EXISTS max_students INTEGER;
ALTER TABLE course ADD COLUMN IF NOT EXISTS enrolled_count INTEGER DEFAULT 0;
ALTER TABLE course ADD COLUMN IF NOT EXISTS published BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE course ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE;
ALTER TABLE course ADD COLUMN IF NOT EXISTS category VARCHAR(100);
ALTER TABLE course ADD COLUMN IF NOT EXISTS tags TEXT;
ALTER TABLE course ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;

-- Add unique constraint to slug if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'course_slug_key'
    ) THEN
        ALTER TABLE course ADD CONSTRAINT course_slug_key UNIQUE (slug);
    END IF;
END $$;

-- Clear existing courses (since they're incomplete)
TRUNCATE TABLE course_progress CASCADE;
TRUNCATE TABLE cart_items CASCADE;
TRUNCATE TABLE order_items CASCADE;
TRUNCATE TABLE enrollments CASCADE;
TRUNCATE TABLE course CASCADE;

-- Reset sequence
ALTER SEQUENCE course_id_seq RESTART WITH 1;

-- Seed comprehensive course data
INSERT INTO course (
    title, slug, description, price, original_price, 
    instructor_name, instructor_title, instructor_avatar_url,
    image_url, kind, level, rating, review_count,
    lesson_count, duration_hours, start_date, end_date, session_count, max_students, enrolled_count,
    published, featured, category, tags, created_at, updated_at
) VALUES
-- PRE-RECORDED COURSES
(
    'Complete Web Development Bootcamp',
    'complete-web-development-bootcamp',
    'Master web development from scratch. Learn HTML, CSS, JavaScript, React, Node.js, databases, and deployment. Build 12+ real-world projects including e-commerce sites, social networks, and web apps.',
    89.99,
    149.99,
    'Sarah Johnson',
    'Senior Full-Stack Developer at Google',
    'https://i.pravatar.cc/150?img=5',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800',
    'PRE_RECORDED',
    'BEGINNER',
    4.8,
    2847,
    245,
    40,
    NULL,
    NULL,
    NULL,
    NULL,
    1247,
    TRUE,
    TRUE,
    'Development',
    'web development, javascript, react, node.js, full-stack',
    NOW(),
    NOW()
),
(
    'Python for Data Science & Machine Learning',
    'python-data-science-machine-learning',
    'Learn Python programming and dive deep into data science and machine learning. Master NumPy, Pandas, Matplotlib, Scikit-Learn, TensorFlow, and more. Build ML models and analyze real datasets.',
    79.99,
    129.99,
    'Dr. Michael Chen',
    'AI Research Scientist & Stanford Professor',
    'https://i.pravatar.cc/150?img=12',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800',
    'PRE_RECORDED',
    'INTERMEDIATE',
    4.9,
    3521,
    180,
    35,
    NULL,
    NULL,
    NULL,
    NULL,
    892,
    TRUE,
    TRUE,
    'Data Science',
    'python, machine learning, data science, ai, tensorflow',
    NOW(),
    NOW()
),
(
    'UI/UX Design Masterclass',
    'ui-ux-design-masterclass',
    'Become a professional UI/UX designer. Learn Figma, design systems, user research, wireframing, prototyping, and visual design. Create stunning interfaces that users love.',
    69.99,
    119.99,
    'Emma Wilson',
    'Lead Designer at Airbnb',
    'https://i.pravatar.cc/150?img=9',
    'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800',
    'PRE_RECORDED',
    'ALL_LEVELS',
    4.7,
    1876,
    120,
    25,
    NULL,
    NULL,
    NULL,
    NULL,
    654,
    TRUE,
    FALSE,
    'Design',
    'ui, ux, figma, design, user experience',
    NOW(),
    NOW()
),
(
    'AWS Cloud Practitioner Complete Course',
    'aws-cloud-practitioner',
    'Master Amazon Web Services from basics to advanced. Learn EC2, S3, Lambda, RDS, CloudFormation, and more. Prepare for AWS Certified Cloud Practitioner exam.',
    59.99,
    99.99,
    'James Rodriguez',
    'AWS Solutions Architect & Certified Trainer',
    'https://i.pravatar.cc/150?img=14',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
    'PRE_RECORDED',
    'BEGINNER',
    4.6,
    1432,
    95,
    20,
    NULL,
    NULL,
    NULL,
    NULL,
    423,
    TRUE,
    FALSE,
    'Cloud Computing',
    'aws, cloud, devops, infrastructure',
    NOW(),
    NOW()
),
(
    'Mobile App Development with React Native',
    'react-native-mobile-development',
    'Build cross-platform mobile apps for iOS and Android using React Native. Learn navigation, state management, API integration, and app deployment to stores.',
    74.99,
    124.99,
    'Alex Martinez',
    'Mobile Lead at Meta',
    'https://i.pravatar.cc/150?img=33',
    'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800',
    'PRE_RECORDED',
    'INTERMEDIATE',
    4.7,
    987,
    140,
    28,
    NULL,
    NULL,
    NULL,
    NULL,
    312,
    TRUE,
    FALSE,
    'Mobile Development',
    'react native, mobile, ios, android, app development',
    NOW(),
    NOW()
),

-- LIVE COURSES
(
    'Digital Marketing Masterclass - LIVE',
    'digital-marketing-masterclass-live',
    'Join our exclusive 6-week live cohort! Learn SEO, content marketing, social media, email marketing, and paid advertising. Interactive sessions with Q&A, assignments, and personalized feedback.',
    299.99,
    499.99,
    'David Rodriguez',
    'Marketing Director & Growth Expert',
    'https://i.pravatar.cc/150?img=68',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
    'LIVE',
    'INTERMEDIATE',
    4.9,
    234,
    24,
    NULL,
    '2024-02-15',
    '2024-03-28',
    12,
    50,
    37,
    TRUE,
    TRUE,
    'Marketing',
    'digital marketing, seo, social media, growth hacking',
    NOW(),
    NOW()
),
(
    'Live Coding Bootcamp - Full Stack',
    'live-coding-bootcamp-full-stack',
    'Intensive 12-week live bootcamp with real instructors. Build 8 portfolio projects, get code reviews, participate in pair programming, and receive career coaching. Limited to 30 students.',
    1499.99,
    2499.99,
    'Team of Senior Developers',
    'Industry Experts from FAANG Companies',
    'https://i.pravatar.cc/150?img=60',
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
    'LIVE',
    'BEGINNER',
    4.9,
    156,
    96,
    NULL,
    '2024-03-01',
    '2024-05-24',
    48,
    30,
    22,
    TRUE,
    TRUE,
    'Development',
    'bootcamp, full-stack, live training, career change',
    NOW(),
    NOW()
),
(
    'Product Management LIVE Workshop',
    'product-management-live-workshop',
    'Learn product management from industry PMs. 4-week intensive program covering product strategy, roadmapping, user research, metrics, and stakeholder management.',
    399.99,
    599.99,
    'Lisa Anderson',
    'VP of Product at Stripe',
    'https://i.pravatar.cc/150?img=47',
    'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800',
    'LIVE',
    'ADVANCED',
    4.8,
    89,
    16,
    NULL,
    '2024-02-20',
    '2024-03-12',
    8,
    40,
    28,
    TRUE,
    FALSE,
    'Business',
    'product management, strategy, pm, leadership',
    NOW(),
    NOW()
),

-- BUNDLE COURSES
(
    'Complete Developer Bundle - 5 Courses',
    'complete-developer-bundle',
    'Get all our development courses in one bundle! Includes Web Development, Mobile Development, Python, AWS Cloud, and DevOps. Save 60% compared to buying separately.',
    249.99,
    599.99,
    'Multiple Expert Instructors',
    'Industry Professionals',
    'https://i.pravatar.cc/150?img=41',
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800',
    'BUNDLE',
    'ALL_LEVELS',
    4.8,
    567,
    NULL,
    150,
    NULL,
    NULL,
    NULL,
    NULL,
    234,
    TRUE,
    TRUE,
    'Development',
    'bundle, web, mobile, cloud, full package',
    NOW(),
    NOW()
),
(
    'Business & Marketing Pro Bundle',
    'business-marketing-pro-bundle',
    'Master business and marketing with 3 comprehensive courses. Includes Digital Marketing, Product Management fundamentals, and Business Analytics. Perfect for entrepreneurs.',
    179.99,
    449.99,
    'Multiple Expert Instructors',
    'Business & Marketing Professionals',
    'https://i.pravatar.cc/150?img=56',
    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800',
    'BUNDLE',
    'INTERMEDIATE',
    4.7,
    321,
    NULL,
    80,
    NULL,
    NULL,
    NULL,
    NULL,
    145,
    TRUE,
    FALSE,
    'Business',
    'bundle, marketing, business, entrepreneurship',
    NOW(),
    NOW()
),

-- Additional PRE-RECORDED courses
(
    'JavaScript ES6+ Modern Development',
    'javascript-es6-modern-development',
    'Deep dive into modern JavaScript. Master ES6+, async/await, modules, webpack, Babel, testing with Jest, and modern JS patterns. Build scalable applications.',
    49.99,
    89.99,
    'Chris Taylor',
    'JavaScript Architect at Netflix',
    'https://i.pravatar.cc/150?img=51',
    'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=800',
    'PRE_RECORDED',
    'INTERMEDIATE',
    4.8,
    1654,
    85,
    18,
    NULL,
    NULL,
    NULL,
    NULL,
    543,
    TRUE,
    FALSE,
    'Development',
    'javascript, es6, modern js, async, webpack',
    NOW(),
    NOW()
),
(
    'Cybersecurity Fundamentals',
    'cybersecurity-fundamentals',
    'Learn essential cybersecurity concepts. Cover network security, encryption, ethical hacking, penetration testing, and security best practices. Prepare for entry-level security roles.',
    69.99,
    109.99,
    'Rachel Green',
    'Security Consultant & Ethical Hacker',
    'https://i.pravatar.cc/150?img=27',
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800',
    'PRE_RECORDED',
    'BEGINNER',
    4.7,
    876,
    110,
    22,
    NULL,
    NULL,
    NULL,
    NULL,
    287,
    TRUE,
    FALSE,
    'Security',
    'cybersecurity, hacking, security, penetration testing',
    NOW(),
    NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_course_kind ON course(kind);
CREATE INDEX IF NOT EXISTS idx_course_level ON course(level);
CREATE INDEX IF NOT EXISTS idx_course_category ON course(category);
CREATE INDEX IF NOT EXISTS idx_course_featured ON course(featured) WHERE featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_course_published ON course(published) WHERE published = TRUE;
CREATE INDEX IF NOT EXISTS idx_course_rating ON course(rating DESC);
CREATE INDEX IF NOT EXISTS idx_course_enrolled_count ON course(enrolled_count DESC);

