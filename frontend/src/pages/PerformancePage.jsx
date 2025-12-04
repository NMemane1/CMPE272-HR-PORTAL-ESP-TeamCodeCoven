import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import { getPerformanceReviews } from "../services/apiClient";
import { canViewPerformance } from "../auth/permissions";

export default function PerformancePage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;

    async function load() {
      try {
        const data = await getPerformanceReviews(user.userId);
        setReviews(data);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load performance reviews");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [user]);

  if (!user) {
    return <div className="p-6">No user logged in.</div>;
  }

  if (!canViewPerformance(user, user.userId)) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold">Performance Reviews</h1>
        <p className="mt-2 text-sm text-red-600">
          You are not authorized to view performance reviews.
        </p>
      </div>
    );
  }

  if (loading) {
    return <div className="p-6">Loading performance reviews...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-red-600">
        Error loading performance reviews: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Performance Reviews</h1>
        <p className="text-sm text-gray-500">
          Review history for {user.name}.
        </p>
      </header>

      <section className="bg-white rounded-xl shadow p-4">
        {reviews.length === 0 ? (
          <p className="text-sm text-gray-500">
            No performance reviews found.
          </p>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => {
              const ratingText =
                typeof r.rating === "number"
                  ? r.rating.toFixed(1)
                  : "N/A";
              return (
                <div
                  key={r.id}
                  className="border border-slate-200 rounded-lg p-3 text-sm"
                >
                  <div className="flex justify-between">
                    <div className="font-semibold">{r.period}</div>
                    <div className="font-medium">
                      Rating: {ratingText} / 5
                    </div>
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    Reviewer ID: {r.reviewerId}
                  </div>
                  <p className="mt-2 text-gray-700">{r.comments}</p>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
