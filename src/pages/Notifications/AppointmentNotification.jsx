import React, { useEffect, useState, useRef } from 'react';
import api from '../../store/Api';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { decrementCount } from '../../Reducer/NotificationSlice';
import { useNavigate } from 'react-router-dom';
import { Button } from 'flowbite-react';

const AppointmentNotification = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);

  const [loading, setLoading] = useState(true);
  const prevCountRef = useRef(0);

  const fetchNotifications = async (isPolling = false) => {
    try {
      const response = await api.get('/goodmood/notifications/type/APPOINTMENT');
      if (response.data.status) {
        const newData = response.data.data;
        
        if (isPolling && newData.length > prevCountRef.current) {
          const newItemsCount = newData.length - prevCountRef.current;
          toast.info(`You have ${newItemsCount} new appointment booking(s)!`);
        }
        
        setNotifications(newData);
        prevCountRef.current = newData.length;
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      if (!isPolling) setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const pollInterval = setInterval(() => {
      fetchNotifications(true);
    }, 10000); 

    return () => clearInterval(pollInterval);
  }, []);

  const markAsRead = async (id) => {
    try {
      const response = await api.patch(`/goodmood/notifications/read/${id}`);
      
      if (response.status === 200 || (response.data && response.data.status)) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: 1 } : n))
        );
        dispatch(decrementCount({ type: 'APPOINTMENT' }));
        toast.success("Marked as read");
      } else {

        toast.error("Failed to mark read on server.");
      }
    } catch (error) {
      console.error('Error marking as read:', error);
      toast.error("API error while marking as read");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-gray-800">Appointment Alerts</h2>
            <Button color="gray" size="xs" onClick={() => navigate(-1)}>Back</Button>
          </div>
          <div className="flex items-center gap-2">
             <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-sm text-gray-500">Live Polling Active</span>
            <span className="ml-4 bg-orange-100 text-orange-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {notifications.filter(n => !n.isRead).length} Pending
            </span>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-xl shadow-sm border border-gray-100">
            <p className="text-gray-500 text-lg">No new appointment notifications.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div key={notification.id} className={`p-5 rounded-xl border transition-all ${
                notification.isRead 
                  ? 'bg-gray-50 border-gray-200 opacity-75' 
                  : 'bg-white border-orange-200 shadow-md'
              }`}>
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                       <span className="px-2 py-0.5 bg-orange-50 text-orange-700 text-[10px] font-bold uppercase rounded tracking-wider">Appointment</span>
                       <span className="text-xs text-gray-400">
                          {new Date(notification.createdAt).toLocaleString()}
                       </span>
                    </div>
                    <h3 className="font-bold text-orange-900 text-lg leading-tight mb-1">{notification.title || "Appointment Update"}</h3>
                    <p className="text-gray-600 mb-2 italic">"{notification.message}"</p>
                  </div>
                  <button
                    onClick={() => !notification.isRead && markAsRead(notification.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap ${
                      notification.isRead 
                        ? 'bg-green-50 text-green-600 cursor-default' 
                        : 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                    }`}
                  >
                    {notification.isRead ? 'Read' : 'Mark Read'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentNotification;
