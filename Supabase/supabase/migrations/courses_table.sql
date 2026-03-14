-- First check if courses table exists and what columns it has
-- Drop the table if it exists (to start fresh)
DROP TABLE IF EXISTS public.courses CASCADE;

-- Create fresh courses table
CREATE TABLE public.courses12 (
    id INTEGER PRIMARY KEY,
    slug TEXT,
    title TEXT,
    category TEXT,
    image TEXT,
    duration TEXT,
    level TEXT,
    price TEXT,
    original_price TEXT,
    rating DOUBLE PRECISION,
    theme_color TEXT,
    trainer TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view courses"
    ON public.courses FOR SELECT
    TO authenticated
    USING (is_active = true);

CREATE POLICY "Admin can manage courses"
    ON public.courses FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role = 'admin'
        )
    );

-- Insert courses
INSERT INTO public.courses (id, slug, title, category, image, duration, level, price, original_price, rating, theme_color, trainer, is_active) VALUES
(1, 'ai-machine-learning', 'AI & Machine Learning', 'Data Science & AI', 'https://res.cloudinary.com/dhrommrn4/image/upload/v1767892205/ai_oyxa8p.jpg', '3 Months', 'Artificial Intelligence/Deep Learning/Neural Networks', '₹35,000', '₹75,000', 4.9, '#8B5CF6', NULL, true),
(2, 'cyber-security', 'Cyber Security', 'Security', 'https://res.cloudinary.com/dhrommrn4/image/upload/v1767892205/cyber-security_rbjfxy.jpg', '3 Months', 'Ethical Hacking/Network Security/Risk Management', '₹35,000', '₹65,000', 4.8, '#EF4444', NULL, true),
(3, 'data-analytics', 'Data Analytics', 'Data Science', 'https://res.cloudinary.com/dhrommrn4/image/upload/v1768384986/data-analytics-v2_glp5sc_b81jrw.jpg', '3 Months', 'Data Visualization/Business Analytics/Excel & Power BI', '₹35,000', '₹55,000', 4.7, '#F59E0B', NULL, true),
(4, 'data-science', 'Data Science', 'Data Science', 'https://res.cloudinary.com/dhrommrn4/image/upload/v1768329468/multi-cloud-consultant_czpj7e.jpg', '6 Months', 'Machine Learning/Data Modeling/Predictive Analytics', '₹45,000', '₹80,000', 4.9, '#10B981', NULL, true),
(5, 'devops', 'DevOps Engineering', 'Cloud & DevOps', 'https://res.cloudinary.com/dhrommrn4/image/upload/v1767892207/devops_am6nxl.jpg', '3 Months', 'CI/CD/Cloud Automation/Docker', '₹35,000', '₹70,000', 4.8, '#06B6D4', NULL, true),
(6, 'embedded-systems', 'Embedded Systems', 'Hardware & IoT', 'https://res.cloudinary.com/dhrommrn4/image/upload/v1767892208/embedded-systems_keok0a.jpg', '3 Months', 'Microcontrollers/IoT/Hardware', '₹35,000', '₹60,000', 4.6, '#6366F1', NULL, true),
(7, 'java-full-stack', 'Java Full Stack', 'Web Development', 'https://res.cloudinary.com/dhrommrn4/image/upload/v1767892209/java-full-stack_x5y7x8.jpg', '3 Months', 'Java Backend/Spring Boot/Full Stack Development', '₹35,000', '₹60,000', 4.8, '#EA580C', NULL, true),
(8, 'mean-stack', 'MEAN Stack', 'Web Development', 'https://res.cloudinary.com/dhrommrn4/image/upload/v1768329456/MEAN_an1fcb.jpg', '3 Months', 'MongoDB/Angular/Node.js', '₹35,000', '₹55,000', 4.5, '#DD0031', NULL, true),
(9, 'mern-stack', 'MERN Stack', 'Web Development', 'https://res.cloudinary.com/dhrommrn4/image/upload/v1767892211/MERN_e5yyw3.jpg', '3 Months', 'Beginner to Intermediate', '₹35,000', '₹60,000', 4.9, '#0EA5E9', 'Build modern web apps with JavaScript.', true),
(10, 'multi-cloud-consultant', 'Multi-Cloud Consultant', 'Cloud Computing', 'https://res.cloudinary.com/dhrommrn4/image/upload/v1767892205/cloud-computing_vhwvx0.jpg', '3 Months', 'AWS/Azure/Cloud Architecture', '₹35,000', '₹85,000', 4.9, '#3B82F6', NULL, true),
(11, 'multi-cloud-engineering', 'Data Engineering', 'Cloud Computing', 'https://res.cloudinary.com/dhrommrn4/image/upload/v1768329468/multi-cloud-consultant_czpj7e.jpg', '3 Months', 'Big Data Processing/ETL/ELT/Pipelines/Data Warehousing', '₹35,000', '₹80,000', 4.7, '#8B5CF6', NULL, true),
(12, 'python-full-stack', 'Python Full Stack', 'Web Development', 'https://res.cloudinary.com/dhrommrn4/image/upload/v1767892211/python_urv1ku.jpg', '3 Months', 'Python Development/Django/Flask/Full Stack Web', '₹35,000', '₹60,000', 4.8, '#22C55E', NULL, true),
(13, 'quantum-computing', 'Quantum Computing', 'Emerging Tech', 'https://res.cloudinary.com/dhrommrn4/image/upload/v1767892214/quantom-computing_xbug8h.jpg', '3 Months', 'Quantum Algorithms/Qubits/Future', '₹35,000', '₹65,000', 5.0, '#7C3AED', NULL, true),
(14, 'ui-ux-design', 'UI/UX Design', 'Design', 'https://res.cloudinary.com/dhrommrn4/image/upload/v1767892215/uiux_ulkrs5.jpg', '3 Months', 'User Experience/Wireframing/Design', '₹35,000', '₹50,000', 4.7, '#EC4899', NULL, true),
(15, 'qa-automation', 'QA Automation', 'Testing', 'https://res.cloudinary.com/dhrommrn4/image/upload/v1767892214/qa-automation-v2_guvvno.jpg', '3 Months', 'Test Automation/Selenium/Software', '₹35,000', '₹55,000', 4.6, '#F97316', 'Satish Rao', true);
