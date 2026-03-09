import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useInstructorPlaylists, Playlist } from '@/hooks/useInstructorData';
import { BookOpen } from 'lucide-react';

interface CourseSelectorProps {
  selectedCourse: any | null;
  onSelectCourse: (course: any | null) => void;
}

export function CourseSelector({ selectedCourse, onSelectCourse }: CourseSelectorProps) {
  const { data: playlists = [], isLoading } = useInstructorPlaylists();

  return (
    <div className="flex items-center gap-3">
      <BookOpen className="h-5 w-5 text-primary" />
      <Select
        value={selectedCourse?.id || ''}
        onValueChange={(value) => {
          const course = (playlists || []).find((c: any) => c.id === value) || null;
          onSelectCourse(course);
        }}
        disabled={isLoading || !playlists || playlists.length === 0}
      >
        <SelectTrigger className="w-[280px]">
          <SelectValue placeholder={isLoading ? "Loading courses..." : (!playlists || playlists.length === 0 ? "No courses available" : "Select a course")} />
        </SelectTrigger>
        <SelectContent>
          {(playlists || []).length > 0 ? (
            (playlists || []).map((course: any) => (
              <SelectItem key={course.id} value={course.id}>
                <div className="flex items-center gap-2">
                  <span>{course.title}</span>
                </div>
              </SelectItem>
            ))
          ) : (
            <div className="p-4 text-sm text-muted-foreground text-center">
              No courses found. Create a course first.
            </div>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
