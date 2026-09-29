type StatCardProps = {
  label: string;
  value: string | number;
  accent?: "default" | "success" | "warning";
};

export default function StatCard({ label, value, accent = "default" }: StatCardProps) {
  const accentClasses = {
    default: "text-gray-900 dark:text-white",
    success: "text-green-600 dark:text-green-400",
    warning: "text-red-600 dark:text-red-400",
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-5 w-full">
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${accentClasses[accent]}`}>{value}</p>
    </div>
  );
}
