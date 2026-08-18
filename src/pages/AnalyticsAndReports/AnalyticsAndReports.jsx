import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  getUserCounts, 
  getTotalSupportRequests, 
  getSupportRequestsByCategory, 
  getTotalAppointments 
} from '../../Reducer/AnalyticsAndReportsSlice';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { Users, UserCheck, PhoneCall } from 'lucide-react';

const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#3B82F6'];

export default function AdminDashboard() {
  const dispatch = useDispatch();
  
  const fullState = useSelector((state) => state);
  const dashboardData = fullState.analyticsAndReports || fullState.dashboardData || {};
  
  const { 
    userCounts, 
    totalSupportRequests, 
    supportRequestsByCategory, 
    totalAppointments 
  } = dashboardData;

  useEffect(() => {
    dispatch(getUserCounts());
    dispatch(getTotalSupportRequests());
    dispatch(getSupportRequestsByCategory());
    dispatch(getTotalAppointments());
  }, [dispatch]);

  // Safe numeric extractions
  const totalUserCount = 
    typeof userCounts === 'number' ? userCounts : 
    (userCounts?.total ?? userCounts?.totalUsers ?? userCounts?.count ?? 0);

  const activeUserCount = 
    typeof userCounts === 'number' ? 0 : 
    (userCounts?.active ?? userCounts?.activeUsers ?? userCounts?.activeCount ?? 0);
  
  const totalSupportCount = 
    typeof totalSupportRequests === 'number' ? totalSupportRequests : 
    (totalSupportRequests?.total ?? totalSupportRequests?.count ?? totalSupportRequests?.totalSupportRequests ?? 0);

  const totalApptCount = 
    typeof totalAppointments === 'number' ? totalAppointments : 
    (totalAppointments?.total ?? totalAppointments?.count ?? totalAppointments?.totalAppointments ?? 0);

  // Data for the Bar Chart
  const barChartData = [
    { name: 'Total Users', value: totalUserCount },
    { name: 'Appointments', value: totalApptCount },
    { name: 'Support Requests', value: totalSupportCount }
  ];

  // Normalized data for the Donut Chart (prioritizing categoryName from your API)
  const rawDonutData = Array.isArray(supportRequestsByCategory) 
    ? supportRequestsByCategory 
    : (supportRequestsByCategory?.data || supportRequestsByCategory?.categories || []);

  const donutData = rawDonutData.map(item => ({
    category: item.categoryName || item.name || item.category || item.category_name || item.support_category || item.title || item._id || 'General Support',
    count: item.count ?? item.total ?? item.value ?? 0
  }));

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans text-gray-800">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            Welcome back, Admin! <span className="text-xl">👋</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">Here's what's happening with your platform today.</p>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-start">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Users</p>
            <h3 className="text-2xl font-bold mt-2">{Number(totalUserCount).toLocaleString()}</h3>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-500 rounded-xl"><Users className="w-5 h-5" /></div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-start">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Users</p>
            <h3 className="text-2xl font-bold mt-2">{Number(activeUserCount).toLocaleString()}</h3>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-500 rounded-xl"><UserCheck className="w-5 h-5" /></div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-start">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Support Requests</p>
            <h3 className="text-2xl font-bold mt-2">{Number(totalSupportCount).toLocaleString()}</h3>
          </div>
          <div className="p-3 bg-rose-50 text-rose-500 rounded-xl"><PhoneCall className="w-5 h-5" /></div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-start">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Appointments</p>
            <h3 className="text-2xl font-bold mt-2">{Number(totalApptCount).toLocaleString()}</h3>
          </div>
          <div className="p-3 bg-blue-50 text-blue-500 rounded-xl"><Users className="w-5 h-5" /></div>
        </div>
      </div>

      {/* Analytics & Support Requests Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        
        {/* 1st Graph: Overview Bar Chart (Narrower via lg:col-span-7) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-gray-800">Platform Overview Analytics</h2>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#6366F1" radius={[8, 8, 0, 0]} barSize={55} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2nd Graph: Support Requests Donut Chart (Wider via lg:col-span-5, lines removed) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-gray-800">Support Requests</h2>
            {/* <span className="text-xs font-semibold text-indigo-600 cursor-pointer">View All</span> */}
          </div>
          <div className="relative flex justify-center items-center my-4">
            <PieChart width={240} height={240}>
              <Pie
                data={donutData}
                dataKey="count"
                nameKey="category"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={4}
              >
                {donutData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
            <div className="absolute text-center pointer-events-none">
              <span className="text-xl font-bold block">{totalSupportCount}</span>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">TOTAL</span>
            </div>
          </div>
          <div className="space-y-2 text-xs">
            {donutData.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-gray-600">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                  {item.category}
                </span>
                <span className="font-medium text-gray-500">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}