import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Users, 
  Search, 
  BookOpen, 
  Calendar, 
  CreditCard,
  Globe,
  RefreshCw,
  Mail,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Fingerprint
} from "lucide-react";
import { CourseEnrollment } from "@/hooks/useCourses";

interface EnrollmentsListProps {
  enrollments: CourseEnrollment[];
  loading: boolean;
  onUpdateStatus?: (id: string, status: 'active' | 'rejected') => Promise<void>;
}

export function EnrollmentsList({ enrollments, loading, onUpdateStatus }: EnrollmentsListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCourse, setFilterCourse] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // Get unique courses for filter
  const courses = [...new Set(enrollments.map(e => e.course_name))];

  const filteredEnrollments = enrollments.filter(e => {
    const matchesSearch = 
      e.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.course_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.user_id?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCourse = filterCourse === "all" || e.course_name === filterCourse;
    const matchesStatus = filterStatus === "all" || e.status === filterStatus;
    return matchesSearch && matchesCourse && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200 gap-1"><CheckCircle className="h-3 w-3" /> Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> Rejected</Badge>;
      case 'pending':
      default:
        return <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200 gap-1"><Clock className="h-3 w-3" /> Pending</Badge>;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map(i => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">{enrollments.length}</p>
                <p className="text-xs text-muted-foreground font-medium">Total Enrollments</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{courses.length}</p>
                <p className="text-xs text-muted-foreground font-medium">Courses</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {new Set(enrollments.map(e => e.user_id)).size}
                </p>
                <p className="text-xs text-muted-foreground font-medium">Unique Students</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-orange-100 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">
                  ₹{enrollments.reduce((acc, e) => acc + parseInt(e.price?.replace(/[^0-9]/g, '') || '0'), 0).toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-muted-foreground font-medium">Total Value</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, course or UUID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative w-full sm:w-48">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <select
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-lg border border-input bg-background text-sm focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">All Courses</option>
              {courses.map(course => (
                <option key={course} value={course}>{course}</option>
              ))}
            </select>
          </div>
          <div className="relative w-full sm:w-40">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-lg border border-input bg-background text-sm focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="active">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Enrollments Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Course Enrollments
          </CardTitle>
          <CardDescription>
            {filteredEnrollments.length} of {enrollments.length} enrollments
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {filteredEnrollments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No enrollments found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Student</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">UUID</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Course</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Price</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Date</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredEnrollments.map((enrollment) => (
                    <tr key={enrollment.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-xs font-bold text-primary">
                              {enrollment.user_name?.charAt(0) || 'U'}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {enrollment.user_name || 'Unknown'}
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {enrollment.user_email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground bg-muted/50 px-2 py-1 rounded w-fit">
                          <Fingerprint className="h-3.5 w-3.5 text-primary/60" />
                          {enrollment.user_id.substring(0, 8)}...
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="font-normal border-primary/20 bg-primary/5 text-primary">
                          {enrollment.course_name}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-bold text-green-700">
                          {enrollment.price}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(enrollment.status || 'pending')}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        <div className="flex flex-col">
                          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDate(enrollment.enrollment_date).split(',')[0]}</span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {formatDate(enrollment.enrollment_date).split(',')[1]}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {(enrollment.status === 'pending' || !enrollment.status) && onUpdateStatus && (
                          <div className="flex items-center gap-2">
                            <Button 
                              size="sm" 
                              variant="default"
                              className="h-8 bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => onUpdateStatus(enrollment.id, 'active')}
                            >
                              Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => onUpdateStatus(enrollment.id, 'rejected')}
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                        {enrollment.status === 'active' && (
                          <Button size="sm" variant="ghost" disabled className="h-8 text-green-600 opacity-100">
                            Approved
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
