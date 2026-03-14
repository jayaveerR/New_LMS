import { useEffect, useState, useRef, useCallback } from 'react';
import { useCourses, Course } from '@/hooks/useCourses';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Star, Clock, BookOpen, ArrowRight, User, ChevronDown } from 'lucide-react';

export default function CoursesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [enrolling, setEnrolling] = useState<number | null>(null);
  
  // Check if user is logged in via token
  const isLoggedIn = !!localStorage.getItem('access_token');
  
  const {
    courses,
    loading,
    error,
    hasMore,
    categories,
    fetchCourses,
    fetchCategories,
    enrollCourse
  } = useCourses();

  const observerRef = useRef<HTMLDivElement>(null);
  const initialLoadDone = useRef(false);

  // Initial load
  useEffect(() => {
    if (!initialLoadDone.current) {
      fetchCategories();
      fetchCourses(1, selectedCategory, true);
      initialLoadDone.current = true;
    }
  }, []);

  // Load more when category changes
  useEffect(() => {
    fetchCourses(1, selectedCategory, true);
  }, [selectedCategory]);

  // Infinite scroll observer
  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const target = entries[0];
    if (target.isIntersecting && hasMore && !loading) {
      fetchCourses(courses.length > 0 ? Math.floor(courses.length / 9) + 1 : 2, selectedCategory);
    }
  }, [hasMore, loading, courses.length, selectedCategory, fetchCourses]);

  useEffect(() => {
    const element = observerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.1,
      rootMargin: '100px'
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [handleObserver]);

  const handleEnroll = async (course: Course) => {
    if (!isLoggedIn) {
      navigate('/auth');
      toast({
        title: 'Login Required',
        description: 'Please login to enroll in courses',
        variant: 'destructive'
      });
      return;
    }

    setEnrolling(course.id);
    try {
      const result = await enrollCourse(course.id, course.title, course.price);
      toast({
        title: 'Enrollment Pending Approval',
        description: 'Your enrollment request has been sent to the admin. You will gain access once approved.',
        className: 'bg-green-50 border-green-200'
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Please try again';
      toast({
        title: 'Enrollment Failed',
        description: errorMsg,
        variant: 'destructive'
      });
    } finally {
      setEnrolling(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section - Taller */}
      <div className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight">
              Explore Our <span className="text-primary">Courses</span>
            </h1>
            <p className="text-lg text-slate-600">
              Master in-demand skills with our expert-led training programs
            </p>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl" />
      </div>

      {/* Category Filter */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
              className="rounded-full whitespace-nowrap"
            >
              All Courses
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat.toLowerCase() ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(cat.toLowerCase())}
                className="rounded-full whitespace-nowrap"
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
            <Button onClick={() => fetchCourses(1, selectedCategory, true)} className="mt-4">
              Try Again
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onEnroll={() => handleEnroll(course)}
              isEnrolling={enrolling === course.id}
              isLoggedIn={isLoggedIn}
            />
          ))}
        </div>

        {/* Loading / Infinite Scroll Trigger */}
        <div ref={observerRef} className="py-8">
          {loading && (
            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          
          {!loading && !hasMore && courses.length > 0 && (
            <p className="text-center text-slate-500">
              You've reached the end! Browse more categories above.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Course Card Component
function CourseCard({ 
  course, 
  onEnroll, 
  isEnrolling,
  isLoggedIn 
}: { 
  course: Course;
  onEnroll: () => void;
  isEnrolling: boolean;
  isLoggedIn: boolean;
}) {
  return (
    <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 rounded-2xl h-full">
      {/* Image - Taller */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={course.image}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        
        {/* Category Badge */}
        <Badge 
          className="absolute top-4 left-4 text-xs font-semibold px-3 py-1"
          style={{ backgroundColor: course.themeColor }}
        >
          {course.category}
        </Badge>

        {/* Rating */}
        <div className="absolute bottom-4 left-4 flex items-center gap-1.5 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-bold text-slate-800">{course.rating}</span>
        </div>
      </div>

      {/* Content - More padding */}
      <CardContent className="p-6 space-y-5 flex-1 flex flex-col">
        <div>
          <h3 className="font-bold text-xl text-slate-900 group-hover:text-primary transition-colors line-clamp-2">
            {course.title}
          </h3>
          <p className="text-sm text-slate-500 mt-2 line-clamp-3">{course.level}</p>
        </div>

        {/* Meta Info */}
        <div className="flex items-center gap-6 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="font-medium">{course.duration}</span>
          </div>
          {course.trainer && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="truncate max-w-[100px]">{course.trainer}</span>
            </div>
          )}
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-3 pt-2">
          <span className="text-3xl font-bold text-primary">{course.price}</span>
          {course.originalPrice && (
            <>
              <span className="text-base text-slate-400 line-through">{course.originalPrice}</span>
              <Badge variant="destructive" className="text-xs font-semibold">
                {Math.round((1 - parsePrice(course.price) / parsePrice(course.originalPrice)) * 100)}% OFF
              </Badge>
            </>
          )}
        </div>

        {/* Enroll Button */}
        <Button
          onClick={onEnroll}
          disabled={isEnrolling}
          className="w-full group-hover:bg-primary/90 transition-all rounded-xl h-11 font-semibold"
        >
          {isEnrolling ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <>
              Enroll Now
              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

// Helper to parse price
function parsePrice(price: string | undefined | null): number {
  if (!price) return 0;
  return parseInt(price.replace(/[^0-9]/g, '')) || 0;
}
