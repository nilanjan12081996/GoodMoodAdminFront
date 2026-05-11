import React, { useEffect, useState } from 'react';
import api from '../../store/Api';
import { toast } from 'react-toastify';
// Note: You need to install sockjs-client and @stomp/stompjs
// npm install sockjs-client @stomp/stompjs
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

const DoctorRegistrationNotification = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/goodmood/notifications/type/DOCTOR_REGISTRATION');
      if (response.data.status) {
        setNotifications(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // WebSocket connection
    let stompClient = null;
    const connectWebSocket = () => {
      const socket = new SockJS(`${import.meta.env.VITE_API_BASE_URL}/ws`);
      stompClient = Stomp.over(socket);

      stompClient.connect({}, (frame) => {
        console.log('Connected: ' + frame);
        stompClient.subscribe('/topic/doctor-registration', (notification) => {
          const newNotification = JSON.parse(notification.body);
          setNotifications((prev) => [newNotification, ...prev]);
          toast.info(`New Doctor: ${newNotification.title}`);
        });
      }, (error) => {
        console.error('WebSocket error:', error);
        // Attempt to reconnect after 5 seconds
        setTimeout(connectWebSocket, 5000);
      });
    };

    connectWebSocket();

    return () => {
      if (stompClient && stompClient.connected) {
        stompClient.disconnect();
      }
    };
  }, []);

  const markAsRead = async (id) => {
    try {
      const response = await api.patch(`/goodmood/notifications/read/${id}`);
      if (response.data.status) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: 1 } : n))
        );
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Doctor Registration Notifications</h2>
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {notifications.filter(n => !n.isRead).length} Unread
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-xl shadow-sm border border-gray-100">
            <p className="text-gray-500 text-lg">No registration notifications yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-5 transition-all duration-300 rounded-xl border ${
                  notification.isRead 
                    ? 'bg-white border-gray-100 opacity-80' 
                    : 'bg-white border-blue-200 shadow-md transform hover:-translate-y-1'
                }`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {!notification.isRead && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                      )}
                      <h3 className={`font-bold ${notification.isRead ? 'text-gray-700' : 'text-blue-900 text-lg'}`}>
                        {notification.title}
                      </h3>
                    </div>
                    <p className="text-gray-600 mb-3">{notification.message}</p>
                    <div className="flex items-center text-xs text-gray-400 gap-4">
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {new Date(notification.createdAt).toLocaleString()}
                      </span>
                      {notification.isRead ? (
                        <span className="text-green-500 font-medium">Read</span>
                      ) : (
                        <span className="text-blue-500 font-medium">New</span>
                      )}
                    </div>
                  </div>
                  {!notification.isRead && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-100 transition-colors"
                    >
                      Mark Read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorRegistrationNotification;
