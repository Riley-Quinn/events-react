import Dashboard from "layouts/dashboard";
import Tables from "layouts/tables";
import Billing from "layouts/billing";
import SignIn from "layouts/authentication/sign-in";

// Soft UI Dashboard React icons
import Shop from "examples/Icons/Shop";
import Office from "examples/Icons/Office";
import CreditCard from "examples/Icons/CreditCard";
import UsersList from "layouts/users/UsersList";
import AddUser from "layouts/users/AddUser";
import ManageRoles from "layouts/roles/roles";
import ManagePermissions from "layouts/permissions/permissions";
import CategoriesList from "layouts/categories/categoriesList";
import TasksList from "layouts/tasks/TasksList";
import AddTask from "layouts/tasks/AddTask";
import PressReleaseList from "layouts/pressRelease/PressReleaseList";
import AddPressRelease from "layouts/pressRelease/AddPressRelease";
import NoWebAccess from "NoWebAccessPage";
import EditUser from "layouts/users/EditUser";
import Birthdays from "layouts/birthdays/Birthdays";
import SpecialDays from "layouts/specialDays/SpecialDays";
import EventsCalendar from "layouts/events/EventsList";
import AddEvent from "layouts/events/AddEvents";
import EditEvent from "layouts/events/EditEvent";

const routes = [
  {
    key: "signin",
    route: "/authentication/sign-in",
    component: <SignIn />,
  },
  {
    key: "addUser",
    route: "/add-user",
    component: <AddUser />,
  },
  {
    key: "editUser",
    route: "/edit-user/:id",
    component: <EditUser />,
  },
  {
    key: "addTask",
    route: "/add-task",
    component: <AddTask />,
  },
  {
    key: "addPress",
    route: "/add-press",
    component: <AddPressRelease />,
  },
  {
    key: "addEvents",
    route: "/add-event",
    component: <AddEvent />,
  },
  {
    key: "editEvent",
    route: "/edit-event/:id",
    component: <EditEvent />,
  },
  {
    key: "no-web-access",
    route: "/no-web-access",
    component: <NoWebAccess />,
  },
  {
    type: "collapse",
    name: "Dashboard",
    key: "dashboard",
    route: "/dashboard",
    icon: <Shop size="12px" />,
    component: <Dashboard />,
    noCollapse: true,
  },
  {
    type: "collapse",
    name: "Users",
    key: "users",
    route: "/users",
    icon: <Office size="12px" />,
    component: <UsersList />,
    noCollapse: true,
  },
  {
    type: "collapse",
    name: "Manage Roles",
    key: "manage-roles",
    route: "/manage-roles",
    icon: <CreditCard size="12px" />,
    component: <ManageRoles />,
    noCollapse: true,
  },
  {
    type: "collapse",
    name: "Manage Permissions",
    key: "manage-permissions",
    route: "/manage-permissions",
    icon: <CreditCard size="12px" />,
    component: <ManagePermissions />,
    noCollapse: true,
  },
  {
    type: "collapse",
    name: "Categories",
    key: "categories",
    route: "/categories",
    icon: <CreditCard size="12px" />,
    component: <CategoriesList />,
    noCollapse: true,
  },
  {
    type: "collapse",
    name: "Tasks",
    key: "tasks",
    route: "/tasks",
    icon: <CreditCard size="12px" />,
    component: <TasksList />,
    noCollapse: true,
  },
  {
    type: "collapse",
    name: "Press Release",
    key: "press-release",
    route: "/press-release",
    icon: <CreditCard size="12px" />,
    component: <PressReleaseList />,
    noCollapse: true,
  },
  {
    type: "collapse",
    name: "Birthdays",
    key: "birthdays",
    route: "/birthdays",
    icon: <CreditCard size="12px" />,
    component: <Birthdays />,
    noCollapse: true,
  },
  {
    type: "collapse",
    name: "Special Days",
    key: "special-days",
    route: "/special-days",
    icon: <CreditCard size="12px" />,
    component: <SpecialDays />,
    noCollapse: true,
  },
  {
    type: "collapse",
    name: "Events",
    key: "events",
    route: "/events",
    icon: <CreditCard size="12px" />,
    component: <EventsCalendar />,
    noCollapse: true,
  },
];

export default routes;
