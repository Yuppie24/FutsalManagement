// ReviewComponent.jsx

import { useState } from "react";
import { Eye, Loader2, Star } from "lucide-react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { cn } from "../../lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import UserProfileImage from "/svg/user-profile.svg";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

const tags = [
  "Best service",
  "Great washroom facilities",
  "Clean and organized field",
  "Great management",
  "Professional",
  "Nice behavior",
];

interface ReviewComponentProps {
  facilityId: number;
  facility: string;
  address: string;
  userHasReviewed: boolean;
  onClose: () => void;
  reviews: Review[];
}

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
const baseUrl = import.meta.env.VITE_API_BASE_URL;
const TOKEN = `Token ${Cookies.get("accessToken")}`;

export default function ReviewComponent({
  facilityId,
  facility,
  address,
  userHasReviewed,
  reviews = [],
  onClose,
}: ReviewComponentProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewReview, setViewReview] = useState<Review | null>(null); // State for viewing a review

  const handleTagClick = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${baseUrl}/facilities/${facilityId}/reviews/`,
        {
          rating,
          comment: comment + " " + selectedTags.join(", "),
        },
        {
          headers: { Authorization: TOKEN },
        }
      );

      if (response.data.status === "success") {
        setLoading(false);
        toast.success("Review submitted successfully");
        onClose();
      } else {
        setLoading(false);
        toast.error("Failed to submit review");
      }
    } catch (error: any) {
      setLoading(false);
      toast.error("Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  // Handle closing the view dialog
  const handleCloseView = () => {
    setViewReview(null);
  };

  return (
    <div className="space-y-6">
      <DialogHeader className="text-center flex items-center">
        <div>How was your experience in</div>
        <DialogTitle className="text-2xl leading-5 text-secondary-foreground font-[500]">
          {facility}
        </DialogTitle>
        <div className="font-[400] text-[14px] text-gray-500">{address}</div>
      </DialogHeader>

      {/* Review Submission Form */}
      {userHasReviewed ? (
        <div className="text-center text-gray-500">
          You have already reviewed this facility
        </div>
      ) : (
        <div className="space-y-4 my-3">
          {/* Star Rating */}
          <div className="flex justify-center space-x-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                className={cn(
                  "h-6 w-6 cursor-pointer transition-all",
                  i <= rating
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                )}
                onClick={() => setRating(i)}
              />
            ))}
          </div>

          {/* Comment Box */}
          <Textarea
            placeholder="Write a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="resize-none focus-visible:ring-primary w-full"
          />

          {/* Tag Selection */}
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Button
                key={tag}
                variant="outline"
                className={cn(
                  "text-sm",
                  selectedTags.includes(tag) ? "bg-green-500 text-white" : ""
                )}
                onClick={() => handleTagClick(tag)}
              >
                {tag}
              </Button>
            ))}
          </div>

          {/* Submit Button */}
          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={loading || !rating || !comment}
          >
            Submit
            {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
          </Button>
        </div>
      )}

      {/* Reviews Section */}
      <Card className="shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">All Reviews</CardTitle>
          <CardDescription>View customer feedback</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Table Layout for md and above */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rating</TableHead>
                  <TableHead>Comment</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews && reviews.length > 0 ? (
                  reviews.map((review) => (
                    <TableRow key={review.id}>
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
                        {new Date(review.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setViewReview(review)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No reviews available
                  </div>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Card Layout for below md */}
          <div className="block md:hidden space-y-4">
            {reviews && reviews.length > 0 ? (
              reviews.map((review) => (
                <div
                  key={review.id}
                  className="border rounded-lg p-4 shadow-sm bg-white dark:bg-gray-800"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewReview(review)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-semibold">Comment:</span>{" "}
                      <span className="line-clamp-2">{review.comment}</span>
                    </div>
                    <div className="text-xs text-gray-400">
                      <span className="font-semibold">Date:</span>{" "}
                      {new Date(review.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                No reviews available
              </div>
            )}
          </div>

          {reviews.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              No reviews available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Single Dialog for Viewing Detailed Review */}
      <Dialog open={!!viewReview} onOpenChange={handleCloseView}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Anonymous</DialogTitle>
          </DialogHeader>
          {viewReview && (
            <div className="grid gap-4 py-4">
              <div className="flex items-center gap-4">
                <img
                  src={viewReview.image ?? UserProfileImage}
                  alt={viewReview.userName}
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
                            i < viewReview.rating
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    <span className="ml-2 text-sm text-gray-500">
                      {viewReview.rating}/5
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{viewReview.userName}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">{viewReview.comment}</p>
              <p className="text-xs text-gray-400">
                {new Date(viewReview.created_at).toLocaleString()}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}