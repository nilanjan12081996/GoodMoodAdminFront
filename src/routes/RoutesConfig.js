import React from 'react';
const Login = React.lazy(() => import('../pages/Auth/Login/Login'));
import InsideLayout from '../ui/layout/InsideLayout';
import OutsideLayout from '../ui/layout/OutsideLayout';
import Dashboard from '../pages/Dashboard/Dashboard.jsx';
import ForgotPassword from '../pages/Auth/ForgotPassword/ForgotPassword.jsx';

import Register from '../pages/Auth/Register/Register.jsx';

import ResetPassword from '../pages/Auth/ForgotPassword/ResetPassword.jsx';
import Transaction from '../pages/Transaction/Transaction.jsx';
import Plans from '../pages/Plans/Plans.jsx';
import EditPlanDetails from '../pages/EditPlanDetails/EditPlanDetails.jsx';
import UserRedirectPage from '../pages/Transaction/UserRedirectPage.jsx';
import CreatePlan from '../pages/Plans/CreatePlan.jsx';
import Wallet from '../pages/Wallet/Wallet.jsx';
import VideoAudioPage from '../pages/VideoAudioPage/VideoAudioPage.jsx';
import TransactionList from '../pages/TransactionList/TransactionList.jsx';


import ManageParents from '../pages/ManageParents/ManageParents.jsx';
import ManageRoles from '../pages/ManageRoles/ManageRoles.jsx';
import TopicList from '../pages/ManageTopic/TopicList.jsx';
import ModuleList from '../pages/ManageModule/ModuleList.jsx';
import PaymentMethodList from '../pages/PaymentMethod/PaymentMethodList.jsx';

import ManageZones from '../pages/ManageZones/ManageZones.jsx';
import ManageCategory from '../pages/ManageCategory/ManageCategory.jsx';
import ManageCateDes from '../pages/ManageCategoryDes/ManageCateDes.jsx';

import ManageMoodMeter from '../pages/MoodMeter/ManageMoodMeter.jsx';
import ManageMoodMaster from '../pages/ManageMoodMaster/ManageMoodMaster.jsx';
import ManageQuestion from '../pages/ManageQuestion/ManageQuestion.jsx';
import AnswerManagement from '../pages/AnswerManagement/AnswerManagement.jsx';
import ManageBlogs from '../pages/Blogs/ManageBlogs.jsx';
import ManageEquilizer from '../pages/Equilizer/ManageEquilizer.jsx';
import ManageMoodMatter from '../pages/MoodzMatters/ManageMoodMatter.jsx';
import BlogDetails from '../pages/Blogs/BlogDetails.jsx';
import MappingModal from '../pages/ManageQuestion/MappingModal.jsx';
import SidebarSetting from '../pages/SidebarSetting/SidebarSetting.jsx';
import UploadContent from '../pages/Equilizer/UploadContent.jsx';
import ViewContent from '../pages/Equilizer/ViewContent.jsx';
import UpdateContent from '../pages/Equilizer/UpdateContent.jsx';
import ManageSupportCategory from '../pages/Support/Category/ManageSupportCategory.jsx';
import SupportDetails from '../pages/Support/Category/SupportDetails.jsx';
import ManageSpecialization from '../pages/Support/Specialization/ManageSpecialization.jsx';
import UpdateQuestionModal from '../pages/ManageQuestion/UpdateQuestionModal.jsx';
import ManageDoctor from '../pages/Support/Doctor/ManageDoctor.jsx';
import ManageTimeSlot from '../pages/Support/TimeSlotManage/ManageTimeSlot.jsx';
import ManageDays from '../pages/Support/Days/ManageDays.jsx';
import PlaformCharge from '../pages/PlatformCharge/PlaformCharge.jsx';
import TransactionUser from '../pages/UserTransactions/TransactionUser.jsx';
import ManageUsers from '../pages/Rabc/ManageUsers.jsx';
import ManageRoleAccess from '../pages/Rabc/ManageRoleAccess/ManageRoleAccess.jsx';
import DoctorTransaction from '../pages/UserTransactions/DoctorTransaction.jsx';
import ManagePrescription from '../pages/Prescription/ManagePrescription.jsx';
import ManageAwarenessBlogs from '../pages/AwarenessBlog/ManageAwarenessBlogs.jsx';
import AwarenessBlogDetails from '../pages/AwarenessBlog/AwarenessBlogDetails.jsx';
import DoctorRegistrationNotification from '../pages/Notifications/DoctorRegistrationNotification.jsx';
import UserRegistrationNotification from '../pages/Notifications/UserRegistrationNotification.jsx';
import AppointmentNotification from '../pages/Notifications/AppointmentNotification.jsx';
import PaymentNotification from '../pages/Notifications/PaymentNotification.jsx';
import AnalyticsAndReports from '../pages/AnalyticsAndReports/AnalyticsAndReports.jsx';
import AwarenessSettings from '../pages/AwarenessSettings/AwarenessSettings.jsx';
import Myprofile from '../components/Myprofile.jsx';
import path from 'node:path'; 
import AddSidebarForm from '../pages/AddSidebar/AddSidebar.jsx';
import Banner from '../pages/Banner/Banner.jsx';

const allRoutes = [
  {
    path: '/',
    element: <OutsideLayout />,
    children: [
      { index: true, element: <Login /> },
      { path: 'login', element: <Login /> },
    ],
  },
  {
    path: '/forgot-password',
    element: <OutsideLayout />,
    children: [
      { index: true, element: <ForgotPassword /> },
      { path: 'forgot-password', element: <ForgotPassword /> },
    ],
  },
  {
    path: '/reset-password/:token',
    element: <OutsideLayout />,
    children: [
      { index: true, element: <ResetPassword /> },
      { path: 'reset-password', element: <ResetPassword /> },
    ],
  },
  {
    path: '/register',
    element: <OutsideLayout />,
    children: [
      { index: true, element: <Register /> },
      { path: 'register', element: <Register /> },
    ],
  },
  {
    path: '/dashboard',
    element: <InsideLayout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
    ],
  },
  {
    path: '/transaction',
    element: <InsideLayout />,
    children: [
      {
        index: true,
        element: <Transaction />,
      },
    ],
  },
  {
    path: '/create-plan',
    element: <InsideLayout />,
    children: [
      {
        index: true,
        element: <CreatePlan />,
      },
    ],
  },
  {
    path: '/middlePage',
    element: <InsideLayout />,
    children: [
      {
        index: true,
        element: <UserRedirectPage />,
      },
    ],
  },
  {
    path: '/manage-plans',
    element: <InsideLayout />,
    children: [
      {
        index: true,
        element: <Plans />,
      },
    ],
  },

  {
    path: '/MoodMeters/:id',
    element: <InsideLayout />,
    children: [
      {
        index: true,
        element: <ManageMoodMeter />,
      },
    ],
  },

  {
    path: '/MoodzMatter/:id',
    element: <InsideLayout />,
    children: [
      {
        index: true,
        element: <ManageMoodMatter />,
      },
    ],
  },

  {
    path: '/MoodMasters/:id',
    element: <InsideLayout />,
    children: [
      {
        index: true,
        element: <ManageMoodMaster />,
      },
    ],
  },
  {
    path: '/PsychiatricInsights/:id',
    element: <InsideLayout />,
    children: [
      {
        index: true,
        element: <ManageBlogs />,
      },
    ],
  },
  {
    path: '/blog-details',
    element: <InsideLayout />,
    children: [
      {
        index: true,
        element: <BlogDetails />,
      },
    ],
  },
  {
    path: '/QuestionAnswer/:id',
    element: <InsideLayout />,
    children: [
      {
        index: true,
        element: <ManageQuestion />,
      },
    ],
  },

  {
    path: '/manage-answer',
    element: <InsideLayout />,
    children: [
      {
        index: true,
        element: <AnswerManagement />,
      },
    ],
  },

  {
    path: '/MoodEqualisers/:id',
    element: <InsideLayout />,
    children: [
      {
        index: true,
        element: <ManageEquilizer />,
      },
    ],
  },

  {
    path: '/options/:id',
    element: <InsideLayout />,
    children: [
      {
        index: true,
        element: <MappingModal />,
      },
    ],
  },

  {
    path: '/edit-question/',
    element: <InsideLayout />,
    children: [
      {
        index: true,
        element: <UpdateQuestionModal />,
      },
    ],
  },
  {
    path: '/SidebarName/:id',
    element: <InsideLayout />,
    children: [
      {
        index: true,
        element: <SidebarSetting />
      },
    ]
  },

  {
    path: '/upload-content',
    element: <InsideLayout />,
    children: [
      {
        index: true,
        element: <UploadContent />
      },
    ]
  },
  {
    path: '/update-content',
    element: <InsideLayout />,
    children: [
      {
        index: true,
        element: <UpdateContent />
      },
    ]
  },
  {
    path: '/view-content',
    element: <InsideLayout />,
    children: [
      {
        index: true,
        element: <ViewContent />
      },
    ]
  },

  {
    path: '/SupportCategory/:id',
    element: <InsideLayout />,
    children: [
      {
        index: true,
        element: <ManageSupportCategory />
      },
    ]
  },

  {
    path: '/support-details',
    element: <InsideLayout />,
    children: [
      {
        index: true,
        element: <SupportDetails />
      },
    ]
  },

  {
    path: '/Specializations/:id',
    element: <InsideLayout />,
    children: [
      {
        index: true,
        element: <ManageSpecialization />
      },
    ]
  },
  {
    path: '/Doctors/:id',
    element: <InsideLayout />,
    children: [
      {
        index: true,
        element: <ManageDoctor />
      },
    ]
  },

  {
    path: '/SlotSpan/:id',
    element: <InsideLayout />,
    children: [
      {
        index: true,
        element: <ManageTimeSlot />
      },
    ]
  },

  {
    path: '/ManageRoleAccess/:id',
    element: <InsideLayout />,
    children: [
      {
        index: true,
        element: <ManageRoleAccess />
      },
    ]
  },
  {
    path: '/Days/:id',
    element: <InsideLayout />,
    children: [
      {
        index: true,
        element: <ManageDays />
      },
    ]
  },
  {
    path: '/TransactionHistory/:id',
    element: <InsideLayout />,
    children: [
      {
        index: true,
        element: <TransactionUser />
      },
    ]
  },
  {
    path: '/DoctorTransaction/:id',
    element: <InsideLayout />,
    children: [
      {
        index: true,
        element: <DoctorTransaction />
      },
    ]
  },


  {
    path: '/ManageUsers/:id',
    element: <InsideLayout />,
    children: [
      {
        index: true,
        element: <ManageUsers />
      },
    ]
  },

  {
    path: '/supportPlatformCharges/:id',
    element: <InsideLayout />,
    children: [
      {
        index: true,
        element: <PlaformCharge />
      },
    ]
  },


  {
    path: '/edit-plan-details/:id',
    element: <InsideLayout />,
    children: [
      {
        index: true,
        element: <EditPlanDetails />,
      },
    ],
  },
  {
    path: '/user-wallet/:id',
    element: <InsideLayout />,
    children: [
      {
        index: true,
        element: <Wallet />,
      },
    ],
  },
  {
    path: '/user-video/:id',
    element: <InsideLayout />,
    children: [
      {
        index: true,
        element: <VideoAudioPage />,
      },
    ],
  },
  {
    path: '/user-transaction/:id',
    element: <InsideLayout />,
    children: [
      {
        index: true,
        element: <TransactionList />,
      },
    ],
  },

  {
    path: '/manage-category',
    element: <InsideLayout />,
    children: [
      {
        index: true,
        element: <ManageCategory />,
      },
    ],
  },

  {
    path: '/Prescription/:id',
    element: <InsideLayout />,
    children: [
      {
        index: true,
        element: <ManagePrescription />,
      },
    ],
  },



  {
    path: '/manage-category-des',
    element: <InsideLayout />,
    children: [
      {
        index: true,
        element: <ManageCateDes />,
      },
    ],
  },

  {
    path: '/manage-zone',
    element: <InsideLayout />,
    children: [
      {
        index: true,
        element: <ManageZones />,
      },
    ],
  },
  {
    path: '/manage-parents',
    element: <InsideLayout />,
    children: [
      {
        index: true,
        element: <ManageParents />,
      },
    ],
  },
  {
    path: '/manage-roles',
    element: <InsideLayout />,
    children: [
      {
        index: true,
        element: <ManageRoles />,
      },
    ],
  },




  {
    path: '/manage-topic',
    element: <InsideLayout />,
    children: [
      {
        index: true,
        element: <TopicList />,
      },
    ],
  },

  {
    path: '/manage-module',
    element: <InsideLayout />,
    children: [
      {
        index: true,
        element: <ModuleList />,
      },
    ],
  },

  {
    path: '/payment-method',
    element: <InsideLayout />,
    children: [
      {
        index: true,
        element: <PaymentMethodList />,
      },
    ],
  },


  {
    path: '/awareness-blogs',
    element: <InsideLayout />,
    children: [
      {
        index: true,
        element: <ManageAwarenessBlogs />,
      },
    ],
  },


  {
    path: '/awareness-blog-details',
    element: <InsideLayout />,
    children: [
      {
        index: true,
        element: <AwarenessBlogDetails />,
      },
    ],
  },  {
    path: '/DoctorRegistrationNotification/:id',
    element: <InsideLayout />,
    children: [
      {
        index: true,
        element: <DoctorRegistrationNotification />,
      },
    ],
  },  {
    path: '/UserRegistrationNotification/:id',
    element: <InsideLayout />,
    children: [
      {
        index: true,
        element: <UserRegistrationNotification />,
      },
    ],
  },
  {
    path: '/AppointmentNotification/:id',
    element: <InsideLayout />,
    children: [
      {
        index: true,
        element: <AppointmentNotification />,
      },
    ],
  },
  {
    path: '/PaymentNotification/:id',
    element: <InsideLayout />,
    children: [
      {
        index: true,
        element: <PaymentNotification />,
      },
    ],
  },

{
    path: '/AnalyticsAndReports/:id',
    element: <InsideLayout />,
    children: [
      {
        index: true,
        element: <AnalyticsAndReports />,
      },
    ],
  },

  {
    path: '/AwarenessSettings/:id',
    element: <InsideLayout />,
    children: [
      {
        index: true,
        element: <AwarenessSettings />,
      },
    ],
  },

  {
    path: '/profile',
    element: <InsideLayout />,
    children: [
      {
        index: true,
        element: <Myprofile />,
      },
    ],
  },

{
    path: '/addsidebar',
    element: <InsideLayout />,
    children: [
      {
        index: true,
        element: <AddSidebarForm />,
      },
    ],
  },

  {
    path: '/addbanner/:id',
    element: <InsideLayout />,
    children: [
      {
        index: true,
        element: <Banner />,
      },
    ],
  },

  {
    path: '*',
    element: 'Outside page not found',
  },
];
export default allRoutes;
