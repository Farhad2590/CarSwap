import React, { useState, useEffect } from 'react';
import useAuth from '../../hooks/useAuth';
import axios from 'axios';

const ReviewsGiven = () => {
    const { user } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReviews = async () => {
            if (!user?.email) return;
            try {
                const response = await axios.get(`http://localhost:9000/cars/reviews/reviewer/${user.email}`);
                setReviews(response.data); // Access the data property of the response
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchReviews();
    }, [user?.email]);

    if (loading) return <div>Loading your reviews...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="container mx-auto p-4">
            <h2 className="text-2xl font-bold mb-6">Reviews You've Given</h2>
            
            {reviews.length === 0 ? (
                <p>You haven't reviewed any cars yet.</p>
            ) : (
                <div className="space-y-4">
                    {reviews.map((review) => (
                        <div key={review.reviewId} className="border p-4 rounded-lg shadow">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-semibold">
                                    {review.carMake} {review.carModel}
                                </h3>
                                <span className="text-yellow-500 font-bold">
                                    {review.rating}/5
                                </span>
                            </div>
                            <p className="mb-2">{review.comment}</p>
                            <div className="flex justify-between text-sm text-gray-500">
                                <span>
                                    Booking ID: {review.bookingId}
                                </span>
                                <span>
                                    {new Date(review.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ReviewsGiven;