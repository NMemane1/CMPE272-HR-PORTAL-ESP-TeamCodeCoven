export default function StatCard({ label, value }) {
  return (
    <div className="bg-white rounded-xl shadow p-4">
      <div className="text-xs uppercase tracking-wide text-gray-500">
        {label}
      </div>
      <div className="mt-2 text-xl font-semibold">{value}</div>
    </div>
  );
}
