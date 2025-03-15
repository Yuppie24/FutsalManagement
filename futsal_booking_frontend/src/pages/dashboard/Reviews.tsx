import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/card";
import PageLayout from "../../layout/PageLayout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog"; // Import Dialog components
import { Star, Eye } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import Cookies from "js-cookie";
import UserProfileImage from "/svg/user-profile.svg";
import useRedirectIfOwnerLoggedIn from "../../hooks/useRedirectIfOwnerLoggedIn";

// Sample review data with customer image
interface Review {
  id: string;
  rating: number;
  comment: string;
  user: string;
  userName: string;
  facility: number;
  created_at: string;
  image: string;
}

const TOKEN = `Token ${Cookies.get("accessToken")}`;
const baseUrl = import.meta.env.VITE_API_BASE_URL;
export default function Reviews() {
  useRedirectIfOwnerLoggedIn();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [ratingFilter, setRatingFilter] = useState("all");
  const [selectedReview, setSelectedReview] = useState<Review | null>(null); // State for selected review
  const [loading, setLoading] = useState(false);
  // Filter reviews based on selected criteria
  const filteredReviews = reviews.filter((review) => {
    return ratingFilter === "all" || review.rating === Number(ratingFilter);
  });

  // fetch reviews from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${baseUrl}/facilities/reviews/`, {
          headers: { Authorization: TOKEN },
        });
        if (response.data.status === "success") {
          const reviewsWithUserAvatars = await Promise.all(
            response.data.data.map(async (review: Review) => {
              const userResponse = await axios.get(
                `${baseUrl}/users/${review.user}/`
              );
              return {
                ...review,
                image: userResponse.data.data.avatar,
                userName: userResponse.data.data.name,
              };
            })
          );
          setReviews(reviewsWithUserAvatars);
          setLoading(false);
          toast.success("Reviews fetched successfully");
        } else {
          toast.error("Failed to fetch reviews");
        }
      } catch (error) {
        setLoading(false);
        toast.error("An error occurred while fetching reviews");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <PageLayout title="Reviews">
      <div className="relative p-4 space-y-6">
        {/* Header and Filters */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Customer Reviews</h1>
          <div className="flex space-x-2 items-center">
            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
                <SelectItem value="4">4 Stars</SelectItem>
                <SelectItem value="3">3 Stars</SelectItem>
                <SelectItem value="2">2 Stars</SelectItem>
                <SelectItem value="1">1 Star</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {loading ? (
          <div className="text-center py-4 text-gray-500">Loading...</div>
        ) : (
          <>
            <Card className="shadow-md">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Review Summary</CardTitle>
                <CardDescription>
                  Overall customer feedback metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="text-center p-6 pb-0 shadow-lg">
                  <CardContent>
                    <CardTitle className="text-lg">Average Rating</CardTitle>
                    <CardTitle className="text-2xl font-bold gap-2 flex items-center justify-center my-2">
                      <p>
                        {(
                          reviews.reduce((sum, r) => sum + r.rating, 0) /
                          reviews.length
                        ).toFixed(1)}
                      </p>
                      <span className="text-sm">/</span>
                      <span className="text-sm">5</span>
                    </CardTitle>
                    <div className="flex justify-center">
                      {Array(5)
                        .fill(0)
                        .map((_, i) => (
                          <Star
                            key={i}
                            className={`w-6 h-6 ${
                              i <
                              Math.round(
                                reviews.reduce((sum, r) => sum + r.rating, 0) /
                                  reviews.length
                              )
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                    </div>
                  </CardContent>
                </Card>
                <Card className="text-center p-6 pb-0 shadow-lg">
                  <CardContent>
                    <CardTitle className="text-lg">Total Reviews</CardTitle>
                    <CardTitle className="text-2xl font-bold my-2">
                      {reviews.length}
                    </CardTitle>
                    <CardTitle className="text-md text-gray-500 !mt-0">
                      {reviews.length} Published
                    </CardTitle>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">All Reviews</CardTitle>
                <CardDescription>
                  Manage and respond to customer feedback
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Comment</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredReviews.map((review) => (
                        <TableRow key={review.id}>
                          <TableCell className="font-medium">{`R-00${review.id}`}</TableCell>
                          <TableCell className="flex items-center gap-2 max-sm:mr-6">
                            <img
                              src={review.image ?? UserProfileImage}
                              alt={review.userName}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                            {review.userName}
                          </TableCell>
                          <TableCell>
                            <div className="flex">
                              {Array(5)
                                .fill(0)
                                .map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < review.rating
                                        ? "text-yellow-400 fill-yellow-400"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                            </div>
                          </TableCell>
                          <TableCell className="max-w-sm truncate">
                            {review.comment}
                          </TableCell>
                          <TableCell>
                            {" "}
                            {new Date(review.created_at).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  onClick={() => setSelectedReview(review)}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View
                                </Button>
                              </DialogTrigger>
                              {selectedReview &&
                                selectedReview.id === review.id && (
                                  <DialogContent className="sm:max-w-[425px]">
                                    <DialogHeader>
                                      <DialogTitle>
                                        {selectedReview.userName} -{" "}
                                        {`R-00${selectedReview.id}`}
                                      </DialogTitle>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                      <div className="flex items-center gap-4">
                                        <img
                                          src={
                                            selectedReview.image ??
                                            UserProfileImage
                                          }
                                          alt={selectedReview.userName}
                                          className="w-16 h-16 rounded-full object-cover"
                                        />
                                        <div>
                                          <div className="flex items-center">
                                            {Array(5)
                                              .fill(0)
                                              .map((_, i) => (
                                                <Star
                                                  key={i}
                                                  className={`w-5 h-5 ${
                                                    i < selectedReview.rating
                                                      ? "text-yellow-400 fill-yellow-400"
                                                      : "text-gray-300"
                                                  }`}
                                                />
                                              ))}
                                            <span className="ml-2 text-sm text-gray-500">
                                              {selectedReview.rating}/5
                                            </span>
                                          </div>
                                          <p className="text-sm text-gray-600">
                                            {selectedReview.userName}
                                          </p>
                                        </div>
                                      </div>
                                      <p className="text-sm text-gray-600">
                                        {selectedReview.comment}
                                      </p>
                                      <p className="text-xs text-gray-400">
                                        {new Date(
                                          selectedReview.created_at
                                        ).toLocaleString()}
                                      </p>
                                    </div>
                                  </DialogContent>
                                )}
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {filteredReviews.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    No reviews match the current filters
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </PageLayout>
  );
}
