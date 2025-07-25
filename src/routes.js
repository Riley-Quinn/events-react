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
import SubCategoriesList from "layouts/subCategory/SubCategoryList";
import AddSubCategory from "layouts/subCategory/AddSubCategory";
import ViewEvent from "layouts/events/ViewEvent";
import EditPressRelease from "layouts/pressRelease/EditPressRelease";
import ViewTask from "layouts/tasks/ViewTask";
import EditTask from "layouts/tasks/EditTask";
import ViewPressRelease from "layouts/pressRelease/ViewPressRelease";

const routes = [
  {
    key: "signin",
    route: "/authentication/sign-in",
    component: <SignIn />,
    access: "public",
  },
  {
    key: "addUser",
    route: "/users/add-user",
    component: <AddUser />,
  },
  {
    key: "editUser",
    route: "/users/edit-user/:id",
    component: <EditUser />,
  },
  {
    key: "addTask",
    route: "/tasks/add-task",
    component: <AddTask />,
  },
  {
    key: "addTask",
    route: "/tasks/edit-task/:task_id",
    component: <EditTask />,
  },
  {
    key: "addTask",
    route: "/tasks/view-task/:task_id",
    component: <ViewTask />,
  },
  {
    key: "addPress",
    route: "/press-release/add-press",
    component: <AddPressRelease />,
  },
  {
    key: "addPress",
    route: "/press-release/view-press/:pressId",
    component: <ViewPressRelease />,
  },
  {
    key: "addEvents",
    route: "/events/add-event",
    component: <AddEvent />,
  },
  {
    key: "editEvents",
    route: "/events/edit-event/:id",
    component: <EditEvent />,
  },
  {
    key: "addCategories",
    route: "/Category/add-subcategory",
    component: <AddSubCategory />,
  },
  {
    key: "addCategories",
    route: "/events/view/:id",
    component: <ViewEvent />,
  },
  {
    key: "editPressRelease",
    route: "/press-release/edit-press/:id",
    component: <EditPressRelease />,
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
    name: "SubCategories",
    key: "sub-categories",
    route: "/sub-categories",
    icon: <CreditCard size="12px" />,
    component: <SubCategoriesList />,
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
    name: "Important Days",
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
