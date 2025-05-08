
import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Package, Lightbulb, Newspaper, Mail, Clock } from "lucide-react";
import { toast } from "sonner";
import { dashboardService } from "@/lib/api-service";
import { useInactivityTimer } from '@/utils/inactivityTimer';
import type { DashboardStats, Activity } from "@/lib/types";
// Fix the import to use AuthContext instead
import { useAuth } from "@/context/AuthContext";

const Dashboard = () => {
  useInactivityTimer();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    products: 0,
    solutions: 0,
    news: 0,
    contacts: 0,
    users: 0
  });
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const statsData = await dashboardService.getStats();
        setStats(statsData);

        // Only fetch activity if it's implemented
        try {
          const activityData = await dashboardService.getActivity();
          setRecentActivity(activityData);
        } catch (error) {
          console.error('Error fetching activity:', error);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Some dashboard data could not be loaded');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Define stats cards configuration based on user role
  const statsCards = [
    {
      title: "Products",
      value: stats.products.toString(),
      icon: Package,
      color: "bg-blue-500",
      show: true // Always show
    },
    {
      title: "Solutions",
      value: stats.solutions.toString(),
      icon: Lightbulb,
      color: "bg-yellow-500",
      show: true // Always show
    },
    {
      title: "News Articles",
      value: stats.news.toString(),
      icon: Newspaper,
      color: "bg-green-500",
      show: true // Always show
    },
    {
      title: "Contact Messages",
      value: stats.contacts.toString(),
      icon: Mail,
      color: "bg-purple-500",
      show: true // Always show
    },
    {
      title: "Users",
      value: stats.users.toString(),
      icon: Users,
      color: "bg-pink-500",
      show: user?.role === 'admin' // Only show for admin
    },
  ].filter(card => card.show);

  return (
    <AdminLayout title="Dashboard">
      <div className="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-5">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${stat.color} text-white`}>
                  <Icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-6 w-12 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  <div className="text-2xl font-bold">{stat.value}</div>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Total {stat.title.toLowerCase()}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 mb-8 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-start">
                    <div className="mr-4">
                      <div className="h-9 w-9 rounded-full bg-gray-200 animate-pulse"></div>
                    </div>
                    <div className="flex-1">
                      <div className="h-4 w-3/4 bg-gray-200 animate-pulse rounded mb-2"></div>
                      <div className="h-3 w-1/2 bg-gray-200 animate-pulse rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={activity.id || index} className="flex items-start">
                    <div className="mr-4">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                        <Clock className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <div>
                      <p className="font-medium">{activity.action}</p>
                      <div className="flex text-sm text-muted-foreground">
                        <p>{activity.time}</p>
                        <span className="px-1">•</span>
                        <p>{activity.user}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-2">
              <a href="/admin/products" className="group">
                <div className="border rounded-lg p-4 transition-all duration-200 group-hover:border-primary group-hover:shadow-sm">
                  <Package className="h-6 w-6 text-blue-500 mb-2" />
                  <h3 className="font-medium">Products</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Manage products
                  </p>
                </div>
              </a>

              <a href="/admin/solutions" className="group">
                <div className="border rounded-lg p-4 transition-all duration-200 group-hover:border-primary group-hover:shadow-sm">
                  <Lightbulb className="h-6 w-6 text-yellow-500 mb-2" />
                  <h3 className="font-medium">Solutions</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Manage solutions
                  </p>
                </div>
              </a>

              <a href="/admin/news" className="group">
                <div className="border rounded-lg p-4 transition-all duration-200 group-hover:border-primary group-hover:shadow-sm">
                  <Newspaper className="h-6 w-6 text-green-500 mb-2" />
                  <h3 className="font-medium">News</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Manage news articles
                  </p>
                </div>
              </a>
              
              <a href="/admin/contact" className="group">
                <div className="border rounded-lg p-4 transition-all duration-200 group-hover:border-primary group-hover:shadow-sm">
                  <Mail className="h-6 w-6 text-purple-500 mb-2" />
                  <h3 className="font-medium">Messages</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    View contact messages
                  </p>
                </div>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;







