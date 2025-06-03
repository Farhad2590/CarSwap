import React from 'react';
import {
  User,
  Car,
  Calendar,
  CreditCard,
  Star,
  Home,
  LogOut,
  Search,
  Bell,
  MapPin,
  CalendarDays,
  BarChart3,
} from "lucide-react"

function DashboardOverview() {
    return (
         <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm">
          <div className="flex justify-between items-center px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <Search className="absolute left-3 top-3 text-gray-400" size={18} />
              </div>
              <button className="relative p-2 text-gray-500 hover:text-teal-500">
                <Bell size={20} />
                <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  3
                </span>
              </button>
            </div>
          </div>
        </header>

        <main className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={<Car className="text-teal-500" size={24} />}
              title="Active Rentals"
              value="2"
              change="+1 from last month"
              changeType="positive"
            />
            <StatCard
              icon={<Calendar className="text-purple-500" size={24} />}
              title="Upcoming Bookings"
              value="3"
              change="+2 from last month"
              changeType="positive"
            />
            <StatCard
              icon={<CreditCard className="text-blue-500" size={24} />}
              title="Total Spent"
              value="$1,240"
              change="+$340 from last month"
              changeType="positive"
            />
            <StatCard
              icon={<Star className="text-yellow-500" size={24} />}
              title="Average Rating"
              value="4.8/5"
              change="Same as last month"
              changeType="neutral"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Recent Activity</h2>
                <select className="border rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-teal-500">
                  <option>This Week</option>
                  <option>This Month</option>
                  <option>Last 3 Months</option>
                </select>
              </div>
              <div className="space-y-4">
                <ActivityItem
                  icon={<Car className="text-teal-500" />}
                  title="Tesla Model 3 Rental"
                  description="Rental started on May 15, 2025"
                  time="2 days ago"
                />
                <ActivityItem
                  icon={<Calendar className="text-purple-500" />}
                  title="BMW X5 Booking Confirmed"
                  description="Scheduled for May 25, 2025"
                  time="Yesterday"
                />
                <ActivityItem
                  icon={<CreditCard className="text-blue-500" />}
                  title="Payment Processed"
                  description="$450 for Audi A4 rental"
                  time="3 hours ago"
                />
                <ActivityItem
                  icon={<Star className="text-yellow-500" />}
                  title="Review Submitted"
                  description="You gave 5 stars for Mercedes E-Class"
                  time="Just now"
                />
              </div>
              <button className="mt-6 text-teal-600 hover:text-teal-800 font-medium">View All Activity</button>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Upcoming Reservation</h2>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg">BMW X5</h3>
                  <span className="bg-teal-100 text-teal-800 text-xs font-medium px-2.5 py-0.5 rounded">Confirmed</span>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center">
                    <CalendarDays className="text-gray-500 mr-2" size={16} />
                    <span>May 25 - May 30, 2025</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="text-gray-500 mr-2" size={16} />
                    <span>Downtown Pickup Location</span>
                  </div>
                  <div className="flex items-center">
                    <CreditCard className="text-gray-500 mr-2" size={16} />
                    <span>$650 total (paid)</span>
                  </div>
                </div>
                <div className="mt-6 flex space-x-3">
                  <button className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                    Modify Booking
                  </button>
                  <button className="border border-red-500 text-red-500 hover:bg-red-50 px-4 py-2 rounded-md text-sm font-medium">
                    Cancel
                  </button>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-bold text-gray-700 mb-3">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button className="flex items-center justify-center bg-gray-100 hover:bg-gray-200 p-3 rounded-md">
                    <Car className="mr-2 text-teal-600" size={16} />
                    <span className="text-sm">New Rental</span>
                  </button>
                  <button className="flex items-center justify-center bg-gray-100 hover:bg-gray-200 p-3 rounded-md">
                    <Calendar className="mr-2 text-teal-600" size={16} />
                    <span className="text-sm">My Trips</span>
                  </button>
                  <button className="flex items-center justify-center bg-gray-100 hover:bg-gray-200 p-3 rounded-md">
                    <CreditCard className="mr-2 text-teal-600" size={16} />
                    <span className="text-sm">Payments</span>
                  </button>
                  <button className="flex items-center justify-center bg-gray-100 hover:bg-gray-200 p-3 rounded-md">
                    <BarChart3 className="mr-2 text-teal-600" size={16} />
                    <span className="text-sm">Reports</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
};

function StatCard({ icon, title, value, change, changeType }) {
  const changeColor =
    changeType === "positive" ? "text-green-500" : changeType === "negative" ? "text-red-500" : "text-gray-500"

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
          <p className={`text-xs mt-1 ${changeColor}`}>{change}</p>
        </div>
        <div className="p-3 rounded-full bg-gray-100">{icon}</div>
      </div>
    </div>
  )
}

function ActivityItem({ icon, title, description, time }) {
  return (
    <div className="flex items-start">
      <div className="p-2 rounded-full bg-gray-100 mr-4">{icon}</div>
      <div className="flex-1">
        <h4 className="font-medium text-gray-900">{title}</h4>
        <p className="text-gray-500 text-sm">{description}</p>
      </div>
      <span className="text-xs text-gray-400">{time}</span>
    </div>
  )
}

export default DashboardOverview;