import EmployeeNotificationsList from '../EmployeeNotificationsList';

export default function EmployeeNotificationsPage() {
  return (
    <div>
      <h1 className="text-3xl font-light text-zinc-100 tracking-tight mb-6">
        My <span className="font-medium text-amber-500">Notifications</span>
      </h1>
      
      {/* Persistent Admin Notifications Log (reused layout component) */}
      <div className="!mt-0">
        <EmployeeNotificationsList />
      </div>
    </div>
  );
}
