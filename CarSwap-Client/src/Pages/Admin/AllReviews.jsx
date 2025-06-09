import axios from 'axios';
import React, { useState, useEffect } from 'react';


const AllReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await axios.get('http://localhost:9000/cars/reviews/admin/all');
                setReviews(response.data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchReviews();
    }, []);

    if (loading) return <div>Loading all reviews...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="container mx-auto p-4">
            <h2 className="text-2xl font-bold mb-6">All Reviews</h2>
            
            {reviews.length === 0 ? (
                <p>No reviews in the system yet.</p>
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
                                <div>
                                    <p>Reviewed by: {review.reviewerEmail}</p>
                                    <p>Car owner: {review.ownerEmail}</p>
                                </div>
                                <div className="text-right">
                                    <p>Booking ID: {review.bookingId}</p>
                                    <p>{new Date(review.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AllReviews;