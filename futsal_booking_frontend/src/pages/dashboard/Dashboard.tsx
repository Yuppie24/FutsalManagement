import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/card";
import PageLayout from "../../layout/PageLayout";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import {
  CalendarDays,
  Star,
  DollarSign,
  Calendar,
  Users2,
  Percent,
  BadgePercent,
  ArrowUpRight,
  ArrowDownRight,
  ClipboardList,
  Layers,
} from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { Badge } from "../../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import useRedirectIfOwnerLoggedIn from "../../hooks/useRedirectIfOwnerLoggedIn";

interface FutsalStat {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  description: string;
}

interface WeeklyBooking {
  name: string;
  morningBookings: number;
  afternoonBookings: number;
  eveningBookings: number;
}

interface FieldUtilization {
  name: string;
  bookings: number;
  revenue: number;
  occupancyRate: number;
}

interface UpcomingBooking {
  id: string;
  date: string;
  time: string;
  field: string;
  customer: string;
  contact: string;
  phone: string;
  status: string;
  payment: string;
}

interface CustomerSegmentation {
  name: string;
  value: number;
}

interface MonthlyTrend {
  month: string;
  bookings: number;
  revenue: number;
}

interface RecentReview {
  customer: string;
  rating: number;
  comment: string;
  date: string;
}

interface RepeatCustomer {
  customerGroup: string;
  totalBookings: number;
  lastBooking: string;
  favoriteField: string;
  loyaltyStatus: string;
}

interface DashboardData {
  futsalStats: FutsalStat[];
  weeklyBookings: WeeklyBooking[];
  fieldUtilization: FieldUtilization[];
  upcomingBookings: UpcomingBooking[];
  customerSegmentation: CustomerSegmentation[];
  monthlyTrend: MonthlyTrend[];
  recentReviews: RecentReview[];
  repeatCustomerAnalytics: {
    regularTeams: number;
    retentionRate: number;
    avgBookingsPerMonth: number;
    topCustomers: RepeatCustomer[];
  };
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];
const baseUrl = import.meta.env.VITE_API_BASE_URL;
export default function Dashboard() {
  useRedirectIfOwnerLoggedIn()
  const [loading, setLoading] = useState<boolean>(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<string>("30days");

  const TOKEN = `Token ${Cookies.get("accessToken")}`; // Adjust token retrieval as per your app

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(
          `${baseUrl}/dashboard/`,
          {
            headers: {
              Authorization: TOKEN,
            },
            params: {
              period: period,
            },
          }
        );

        if (response.data.status === "success") {
          setDashboardData(response.data.data);
        } else {
          throw new Error(
            response.data.message || "Failed to fetch dashboard data"
          );
        }
      } catch (err: any) {
        console.error("Error fetching dashboard data:", err);
        setError(
          err.message || "An error occurred while fetching dashboard data"
        );
        toast.error(
          err.message || "An error occurred while fetching dashboard data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [period]);

  if (error) {
    return <div className="text-center p-6 text-red-500 w-full">{error}</div>;
  }

  return (
    <PageLayout title="Dashboard">
      <div className="relative p-4 space-y-6">
        {/* Date filter */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Futsal Performance Overview</h1>
          <div className="flex space-x-2">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="90days">Last 90 days</SelectItem>
                <SelectItem value="year">This year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {loading ? (
          <div className="text-center py-4 text-gray-500">Loading...</div>
        ) : (
          <>
            {!dashboardData ? (
              <div className="text-center p-6 text-red-500 w-full">
                No dashboard data available.
              </div>
            ) : (
              <>
                {/* Stats cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {dashboardData.futsalStats.map((stat, index) => (
                    <Card
                      key={index}
                      className="overflow-hidden border-none shadow-md"
                    >
                      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-sm font-medium text-gray-500">
                          {stat.title}
                        </CardTitle>
                        <div
                          className={`rounded-full p-2 bg-opacity-10 ${
                            stat.title.includes("Booking")
                              ? "bg-blue-100"
                              : stat.title.includes("Revenue")
                              ? "bg-green-100"
                              : stat.title.includes("Occupancy")
                              ? "bg-orange-100"
                              : "bg-yellow-100"
                          }`}
                        >
                          {stat.title.includes("Booking") ? (
                            <CalendarDays className="w-5 h-5 text-blue-500" />
                          ) : stat.title.includes("Revenue") ? (
                            <DollarSign className="w-5 h-5 text-green-500" />
                          ) : stat.title.includes("Occupancy") ? (
                            <Percent className="w-5 h-5 text-orange-500" />
                          ) : (
                            <Star className="w-5 h-5 text-yellow-500" />
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-2">
                        <div className="text-2xl font-bold">{stat.value}</div>
                        <p className="text-xs text-gray-500 mt-1 flex items-center">
                          {stat.description}
                          <span
                            className={`ml-2 flex items-center ${
                              stat.trend === "up"
                                ? "text-green-500"
                                : stat.trend === "down"
                                ? "text-red-500"
                                : "text-gray-500"
                            }`}
                          >
                            {stat.trend === "up" ? (
                              <ArrowUpRight className="w-3 h-3 mr-1" />
                            ) : stat.trend === "down" ? (
                              <ArrowDownRight className="w-3 h-3 mr-1" />
                            ) : null}
                            {stat.change}
                          </span>
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Tabs for main dashboard sections */}
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">
                      Business Overview
                    </TabsTrigger>
                    <TabsTrigger value="fields">Field Performance</TabsTrigger>
                    <TabsTrigger value="customers">
                      Customer Insights
                    </TabsTrigger>
                  </TabsList>

                  {/* Overview Tab Content */}
                  <TabsContent value="overview" className="space-y-4 mt-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Weekly booking pattern */}
                      <Card className="shadow-md">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">
                            Weekly Booking Pattern
                          </CardTitle>
                          <CardDescription>
                            Bookings by time of day
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart
                              data={dashboardData.weeklyBookings}
                              barGap={4}
                              barSize={12}
                            >
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Bar
                                dataKey="morningBookings"
                                name="Morning"
                                fill="#8884d8"
                                radius={[4, 4, 0, 0]}
                              />
                              <Bar
                                dataKey="afternoonBookings"
                                name="Afternoon"
                                fill="#82ca9d"
                                radius={[4, 4, 0, 0]}
                              />
                              <Bar
                                dataKey="eveningBookings"
                                name="Evening"
                                fill="#ffc658"
                                radius={[4, 4, 0, 0]}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>

                      {/* Monthly trend */}
                      <Card className="shadow-md">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">
                            Monthly Performance
                          </CardTitle>
                          <CardDescription>
                            Bookings and revenue trend
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={dashboardData.monthlyTrend}>
                              <XAxis dataKey="month" />
                              <YAxis
                                yAxisId="left"
                                orientation="left"
                                stroke="#8884d8"
                              />
                              <YAxis
                                yAxisId="right"
                                orientation="right"
                                stroke="#82ca9d"
                              />
                              <Tooltip />
                              <Legend />
                              <Line
                                yAxisId="left"
                                type="monotone"
                                dataKey="bookings"
                                name="Bookings"
                                stroke="#8884d8"
                                activeDot={{ r: 8 }}
                              />
                              <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="revenue"
                                name="Revenue (NRS)"
                                stroke="#82ca9d"
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Upcoming bookings */}
                    <Card className="shadow-md">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <div>
                            <CardTitle className="text-lg">
                              Upcoming Bookings
                            </CardTitle>
                            <CardDescription>
                              Next 48 hours schedule
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-[80px]">ID</TableHead>
                                <TableHead>Date/Time</TableHead>
                                <TableHead>Field</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">
                                  Actions
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {dashboardData.upcomingBookings.map(
                                (booking, index) => (
                                  <TableRow key={index}>
                                    <TableCell className="font-medium">
                                      {booking.id}
                                    </TableCell>
                                    <TableCell>
                                      <div className="font-medium">
                                        {booking.date}
                                      </div>
                                      <div className="text-sm text-gray-500">
                                        {booking.time}
                                      </div>
                                    </TableCell>
                                    <TableCell>{booking.field}</TableCell>
                                    <TableCell>
                                      <div>{booking.customer}</div>
                                      <div className="text-sm text-gray-500">
                                        {booking.contact}
                                      </div>
                                    </TableCell>
                                    <TableCell>{booking.phone}</TableCell>
                                    <TableCell>
                                      <Badge
                                        variant={
                                          booking.status === "Confirmed"
                                            ? "success"
                                            : "warning"
                                        }
                                        className={`${
                                          booking.status === "Confirmed"
                                            ? "bg-green-100 text-green-800"
                                            : "bg-yellow-100 text-yellow-800"
                                        }`}
                                      >
                                        {booking.status}
                                      </Badge>
                                      <div className="text-xs mt-1">
                                        {booking.payment === "Paid" ? (
                                          <span className="text-green-600">
                                            Paid
                                          </span>
                                        ) : (
                                          <span className="text-red-600">
                                            Unpaid
                                          </span>
                                        )}
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <div className="flex justify-end space-x-2">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-8 w-8 p-0"
                                        >
                                          <ClipboardList className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-8 w-8 p-0"
                                        >
                                          <Layers className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                )
                              )}
                            </TableBody>
                          </Table>
                        </div>
                        <Link to="bookings">
                          <Button className="mt-4 w-full">
                            Manage All Bookings
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Fields Tab Content */}
                  <TabsContent value="fields" className="space-y-4 mt-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      {dashboardData.fieldUtilization.map((field, index) => (
                        <Card key={index} className="shadow-md">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg">
                              {field.name}
                            </CardTitle>
                            <CardDescription>
                              Performance metrics
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-3 gap-2">
                              <div className="text-center">
                                <div className="text-sm text-gray-500">
                                  Bookings
                                </div>
                                <div className="text-xl font-bold">
                                  {field.bookings}
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-sm text-gray-500">
                                  Revenue
                                </div>
                                <div className="text-xl font-bold">
                                  NRS {field.revenue}
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-sm text-gray-500">
                                  Occupancy
                                </div>
                                <div className="text-xl font-bold">
                                  {field.occupancyRate.toFixed(1)}%
                                </div>
                              </div>
                            </div>

                            <ResponsiveContainer width="100%" height={120}>
                              <AreaChart data={dashboardData.weeklyBookings}>
                                <XAxis
                                  dataKey="name"
                                  tick={false}
                                  axisLine={false}
                                />
                                <Area
                                  type="monotone"
                                  dataKey="eveningBookings"
                                  stroke="#8884d8"
                                  fill="#8884d8"
                                  fillOpacity={0.3}
                                />
                              </AreaChart>
                            </ResponsiveContainer>

                            <div className="pt-2">
                              <div className="text-sm font-medium">
                                Peak time: 6PM - 9PM (Placeholder)
                              </div>
                              <div className="text-sm text-gray-500">
                                Most popular day: Saturday (Placeholder)
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Placeholder for Field Maintenance Schedule */}
                    <Card className="shadow-md">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">
                          Field Maintenance Schedule
                        </CardTitle>
                        <CardDescription>
                          Upcoming maintenance tasks
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Field</TableHead>
                              <TableHead>Task</TableHead>
                              <TableHead>Last Done</TableHead>
                              <TableHead>Next Due</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">
                                Actions
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell>Field 1</TableCell>
                              <TableCell>Grass Replacement</TableCell>
                              <TableCell>Jan 15, 2025</TableCell>
                              <TableCell>Apr 15, 2025</TableCell>
                              <TableCell>
                                <Badge className="bg-green-100 text-green-800">
                                  Good
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button variant="outline" size="sm">
                                  Schedule
                                </Button>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Field 2</TableCell>
                              <TableCell>Line Repainting</TableCell>
                              <TableCell>Feb 10, 2025</TableCell>
                              <TableCell>Mar 10, 2025</TableCell>
                              <TableCell>
                                <Badge className="bg-yellow-100 text-yellow-800">
                                  Due Soon
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button variant="outline" size="sm">
                                  Schedule
                                </Button>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Field 3</TableCell>
                              <TableCell>Goal Maintenance</TableCell>
                              <TableCell>Dec 20, 2024</TableCell>
                              <TableCell>Mar 05, 2025</TableCell>
                              <TableCell>
                                <Badge className="bg-red-100 text-red-800">
                                  Overdue
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button variant="outline" size="sm">
                                  Schedule
                                </Button>
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Customers Tab Content */}
                  <TabsContent value="customers" className="space-y-4 mt-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <Card className="shadow-md">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">
                            Customer Segmentation
                          </CardTitle>
                          <CardDescription>
                            Booking distribution by customer type
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex">
                            <div className="w-1/2">
                              <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                  <Pie
                                    data={dashboardData.customerSegmentation}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, percent }) =>
                                      `${name} ${(percent * 100).toFixed(0)}%`
                                    }
                                  >
                                    {dashboardData.customerSegmentation.map(
                                      (_, index) => (
                                        <Cell
                                          key={`cell-${index}`}
                                          fill={COLORS[index % COLORS.length]}
                                        />
                                      )
                                    )}
                                  </Pie>
                                  <Tooltip />
                                </PieChart>
                              </ResponsiveContainer>
                            </div>
                            <div className="w-1/2 pl-4 flex flex-col justify-center">
                              <h4 className="text-base font-semibold mb-2">
                                Key Insights
                              </h4>
                              <ul className="space-y-2 text-sm">
                                <li className="flex items-center">
                                  <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                                  <span>Regular teams dominate bookings</span>
                                </li>
                                <li className="flex items-center">
                                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                                  <span>Corporate events are growing</span>
                                </li>
                                <li className="flex items-center">
                                  <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                                  <span>Casual players prefer weekends</span>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="shadow-md">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">
                            Recent Reviews & Feedback
                          </CardTitle>
                          <CardDescription>
                            Latest customer experiences
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {dashboardData.recentReviews.map(
                              (review, index) => (
                                <div key={index} className="p-3 rounded-lg">
                                  <div className="flex justify-between">
                                    <div className="font-medium">
                                      {review.customer}
                                    </div>
                                    <div className="flex">
                                      {Array(5)
                                        .fill(0)
                                        .map((_, i) => (
                                          <Star
                                            key={i}
                                            className={`w-4 h-4 ${
                                              i < review.rating
                                                ? "text-yellow-400 fill-yellow-400"
                                                : "text-gray-300"
                                            }`}
                                          />
                                        ))}
                                    </div>
                                  </div>
                                  <div className="text-sm mt-1">
                                    {review.comment}
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {review.date}
                                  </div>
                                </div>
                              )
                            )}
                          </div>

                          <Link to="reviews">
                            <Button variant="outline" className="w-full mt-4">
                              View All Reviews
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    </div>

                    <Card className="shadow-md">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">
                          Repeat Customer Analytics
                        </CardTitle>
                        <CardDescription>
                          Booking frequency and loyalty metrics
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <Card className="shadow-sm">
                            <CardContent className="pt-6">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm text-gray-500">
                                    Regular Teams
                                  </p>
                                  <h3 className="text-2xl font-bold">
                                    {
                                      dashboardData.repeatCustomerAnalytics
                                        .regularTeams
                                    }
                                  </h3>
                                </div>
                                <Users2 className="w-8 h-8 text-blue-500" />
                              </div>
                            </CardContent>
                          </Card>

                          <Card className="shadow-sm">
                            <CardContent className="pt-6">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm text-gray-500">
                                    Retention Rate
                                  </p>
                                  <h3 className="text-2xl font-bold">
                                    {dashboardData.repeatCustomerAnalytics.retentionRate.toFixed(
                                      1
                                    )}
                                    %
                                  </h3>
                                </div>
                                <BadgePercent className="w-8 h-8 text-green-500" />
                              </div>
                            </CardContent>
                          </Card>

                          <Card className="shadow-sm">
                            <CardContent className="pt-6">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm text-gray-500">
                                    Avg. Bookings/Month
                                  </p>
                                  <h3 className="text-2xl font-bold">
                                    {dashboardData.repeatCustomerAnalytics.avgBookingsPerMonth.toFixed(
                                      1
                                    )}
                                  </h3>
                                </div>
                                <Calendar className="w-8 h-8 text-purple-500" />
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Customer Group</TableHead>
                              <TableHead>Total Bookings</TableHead>
                              <TableHead>Last Booking</TableHead>
                              <TableHead>Favorite Field</TableHead>
                              <TableHead>Loyalty Status</TableHead>
                              <TableHead className="text-right">
                                Actions
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {dashboardData.repeatCustomerAnalytics.topCustomers.map(
                              (customer, index) => (
                                <TableRow key={index}>
                                  <TableCell className="font-medium">
                                    {customer.customerGroup}
                                  </TableCell>
                                  <TableCell>
                                    {customer.totalBookings}
                                  </TableCell>
                                  <TableCell>{customer.lastBooking}</TableCell>
                                  <TableCell>
                                    {customer.favoriteField}
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      className={`${
                                        customer.loyaltyStatus === "Platinum"
                                          ? "bg-purple-100 text-purple-800"
                                          : customer.loyaltyStatus === "Gold"
                                          ? "bg-blue-100 text-blue-800"
                                          : "bg-gray-100 text-gray-800"
                                      }`}
                                    >
                                      {customer.loyaltyStatus}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <Button variant="outline" size="sm">
                                      Details
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              )
                            )}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </>
            )}
          </>
        )}
      </div>
    </PageLayout>
  );
}
