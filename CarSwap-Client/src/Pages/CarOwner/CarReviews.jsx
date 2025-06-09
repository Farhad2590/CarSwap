import React, { useState, useEffect } from "react";

import axios from "axios";
import useAuth from "../../hooks/useAuth";

const CarReviews = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!user?.email) return;
      try {
        const response = await axios.get(
          ` http://localhost:9000/cars/reviews/owner/${user?.email}`
        );
        setReviews(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchReviews();
  }, [user?.email]);

  if (loading) return <div>Loading reviews...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Car Reviews</h2>

      {reviews.length === 0 ? (
        <p>No reviews yet for this car.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.reviewId} className="border p-4 rounded-lg shadow">
              <div className="flex items-center mb-2">
                <span className="text-yellow-500 font-bold mr-2">
                  {review.rating}/5
                </span>
                <span className="text-gray-600 text-sm">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="mb-2">{review.comment}</p>
              <p className="text-sm text-gray-500">
                Reviewed by: {review.reviewerEmail}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CarReviews;
