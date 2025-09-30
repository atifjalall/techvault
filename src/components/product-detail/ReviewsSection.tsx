"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  StarIcon,
  PaperAirplaneIcon,
  EllipsisVerticalIcon,
  FlagIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import { Review } from "@/types/product";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/Button";

interface ReviewsSectionProps {
  productId: string;
  reviews: Review[];
  avgRating: number;
  reviewCount: number;
  onSubmitReview: (rating: number, comment: string) => Promise<void>;
}

export default function ReviewsSection({
  reviews,
  avgRating,
  reviewCount,
  onSubmitReview,
}: ReviewsSectionProps) {
  const { data: session } = useSession();
  const router = useRouter();

  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  const handleSubmitReview = async () => {
    if (!session?.user) {
      router.push("/signin");
      return;
    }

    if (reviewRating === 0) return;

    setIsSubmittingReview(true);
    try {
      await onSubmitReview(reviewRating, reviewText.trim());
      setReviewText("");
      setReviewRating(0);
    } catch (error) {
      console.error("Error submitting review:", error);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!session?.user || !reviewToDelete) return;

    setDeletingReviewId(reviewToDelete);
    setDeleteDialogOpen(false);
    setOpenMenuId(null);
    try {
      const response = await fetch("/api/reviews", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId: reviewToDelete }),
      });

      if (response.ok) {
        await onSubmitReview(0, "");
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to delete review");
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      alert("Failed to delete review. Please try again.");
    } finally {
      setDeletingReviewId(null);
      setReviewToDelete(null);
    }
  };

  const openDeleteDialog = (reviewId: string) => {
    setReviewToDelete(reviewId);
    setDeleteDialogOpen(true);
    setOpenMenuId(null);
  };

  const handleReportReview = () => {
    if (!session?.user) {
      router.push("/signin");
      return;
    }
    setReportModalOpen(true);
    setOpenMenuId(null);
  };

  const handleSubmitReport = async () => {
    if (!reportReason.trim()) return;

    setIsSubmittingReport(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setReportModalOpen(false);
      setReportReason("");
      setReportDescription("");
      alert("Report submitted successfully. Thank you for your feedback.");
    } catch (error) {
      console.error("Error submitting report:", error);
      alert("Failed to submit report. Please try again.");
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const reportReasons = [
    "Inappropriate content",
    "Spam or fake review",
    "Offensive language",
    "Misleading information",
    "Personal attack",
    "Other",
  ];

  return (
    <motion.div
      className="w-full space-y-4 lg:space-y-8"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      transition={{ duration: 0.2 }}
    >
      {/* Review Summary - Restructured Layout */}
      <div className="bg-slate-50 rounded-xl p-3 lg:p-6 w-full">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between w-full space-y-3 lg:space-y-0">
          {/* Left Side - Title, Rating, and Total Count */}
          <div className="flex flex-col items-start">
            <h3 className="text-sm lg:text-lg font-medium text-slate-900 mb-2 lg:mb-4">
              Ratings & Reviews
            </h3>
            <div className="flex items-baseline space-x-1 lg:space-x-2 mb-1 lg:mb-2">
              <span className="text-2xl lg:text-4xl font-bold text-slate-900">
                {reviewCount > 0 ? avgRating.toFixed(1) : "0.0"}
              </span>
              <span className="text-[10px] lg:text-sm text-slate-600">
                out of 5
              </span>
            </div>
            <div className="flex space-x-0.5 lg:space-x-1 mb-1 lg:mb-2">
              {[...Array(5)].map((_, i) => (
                <StarIconSolid
                  key={i}
                  className={`w-3 h-3 lg:w-4 lg:h-4 ${
                    i < Math.floor(avgRating)
                      ? "text-yellow-400"
                      : "text-slate-300"
                  }`}
                />
              ))}
            </div>
            <div className="text-[10px] lg:text-sm text-slate-600">
              {reviewCount.toLocaleString()} Ratings
            </div>
          </div>

          {/* Right Side - Rating Distribution Bars */}
          <div className="flex-1 max-w-2xl lg:ml-8">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = reviews.filter((r) => r.rating === rating).length;
              const percentage =
                reviewCount > 0 ? (count / reviewCount) * 100 : 0;

              return (
                <div
                  key={rating}
                  className="flex items-center text-[10px] lg:text-sm mb-1 lg:mb-2"
                >
                  {/* Stars */}
                  <div className="flex items-center justify-end w-16 lg:w-20">
                    <div className="flex items-center space-x-0.5">
                      {[...Array(rating)].map((_, starIndex) => (
                        <StarIconSolid
                          key={starIndex}
                          className="w-2.5 h-2.5 lg:w-3 lg:h-3 text-yellow-400 flex-shrink-0"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="flex-1 min-w-[120px] lg:min-w-[320px] bg-slate-200 rounded-full h-1.5 lg:h-2 mx-2 lg:mx-3">
                    <motion.div
                      className="bg-slate-400 h-1.5 lg:h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.5, delay: (5 - rating) * 0.1 }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Write Review Section */}
      {session?.user && (
        <motion.div
          className="bg-white border border-slate-200 rounded-xl p-3 lg:p-6 w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h4 className="text-[10px] lg:text-base font-medium text-slate-900 mb-2 lg:mb-4">
            Write a Review
          </h4>

          {/* Interactive Rating Selection */}
          <div className="mb-2 lg:mb-4">
            <label className="block text-[10px] lg:text-sm font-medium text-slate-700 mb-1 lg:mb-2">
              Your Rating
            </label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <motion.button
                  key={star}
                  type="button"
                  onClick={() => setReviewRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="focus:outline-none transition-colors duration-150 cursor-pointer"
                >
                  <StarIconSolid
                    className={`w-6 h-6 transition-colors duration-150 ${
                      star <= (hoverRating || reviewRating)
                        ? "text-yellow-400"
                        : "text-slate-300"
                    }`}
                  />
                </motion.button>
              ))}
            </div>
          </div>

          {/* Review Text */}
          <div className="mb-2 lg:mb-4">
            <label className="block text-[10px] lg:text-sm font-medium text-slate-700 mb-1 lg:mb-2">
              Your Review (Optional)
            </label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your thoughts about this product..."
              rows={3}
              className="w-full px-2 lg:px-3 py-1.5 lg:py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent resize-none text-[10px] lg:text-sm"
              maxLength={500}
            />
            <div className="text-right text-[8px] lg:text-xs text-slate-500 mt-1">
              {reviewText.length}/500 characters
            </div>
          </div>

          {/* Submit Button */}
          <motion.button
            onClick={handleSubmitReview}
            disabled={reviewRating === 0 || isSubmittingReview}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="flex items-center space-x-1 lg:space-x-2 bg-slate-900 text-white px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg text-[10px] lg:text-sm font-medium hover:bg-slate-800 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmittingReview ? (
              <div className="flex space-x-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1 h-1 bg-white rounded-full"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>
            ) : (
              <PaperAirplaneIcon className="w-4 h-4" />
            )}
            <span>
              {isSubmittingReview ? "Submitting..." : "Submit Review"}
            </span>
          </motion.button>
        </motion.div>
      )}

      {/* Existing Reviews */}
      {reviews.length > 0 ? (
        <div className="space-y-3 lg:space-y-6 w-full">
          {reviews.slice(0, 10).map((review, index) => (
            <motion.div
              key={review.id}
              className="bg-white border border-slate-200 rounded-xl p-3 lg:p-6 w-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="flex items-start justify-between mb-2 lg:mb-3">
                <div className="flex items-center space-x-2 lg:space-x-3">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 bg-slate-200 rounded-full flex items-center justify-center">
                    <span className="text-slate-600 font-medium text-[10px] lg:text-sm">
                      {(review.user.name || "A").charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center space-x-1 lg:space-x-2">
                      <span className="text-[10px] lg:text-sm font-medium text-slate-900">
                        {review.user.name || "Anonymous"}
                      </span>
                      <div className="flex space-x-0.5 lg:space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <StarIconSolid
                            key={i}
                            className={`w-2.5 h-2.5 lg:w-3 lg:h-3 ${
                              i < review.rating
                                ? "text-yellow-400"
                                : "text-slate-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-[8px] lg:text-xs text-slate-500">
                      {new Date(review.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                {/* Three Dot Menu */}
                {session?.user && (
                  <div className="relative">
                    <motion.button
                      onClick={() =>
                        setOpenMenuId(
                          openMenuId === review.id ? null : review.id
                        )
                      }
                      className="p-1 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <EllipsisVerticalIcon className="w-4 h-4 text-slate-500" />
                    </motion.button>

                    {/* Dropdown Menu */}
                    {openMenuId === review.id && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setOpenMenuId(null)}
                        />
                        <div className="absolute right-0 top-8 z-20 w-40 bg-white border border-slate-200 rounded-lg shadow-lg py-1">
                          {/* Report Option */}
                          <button
                            onClick={() => handleReportReview()}
                            className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center space-x-2 cursor-pointer"
                          >
                            <FlagIcon className="w-4 h-4" />
                            <span>Report</span>
                          </button>

                          {/* Delete Option - Only for review owner */}
                          {review.user.id === session.user.id && (
                            <button
                              onClick={() => openDeleteDialog(review.id)}
                              disabled={deletingReviewId === review.id}
                              className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                              <TrashIcon className="w-4 h-4" />
                              <span>
                                {deletingReviewId === review.id
                                  ? "Deleting..."
                                  : "Delete"}
                              </span>
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
              {review.comment && (
                <p className="text-[10px] lg:text-sm text-slate-700 leading-relaxed">
                  {review.comment}
                </p>
              )}
            </motion.div>
          ))}

          {reviews.length > 10 && (
            <div className="text-center pt-3 lg:pt-6">
              <motion.button
                className="text-[10px] lg:text-sm text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
                whileHover={{ scale: 1.02 }}
              >
                View all {reviewCount} reviews →
              </motion.button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-slate-50 rounded-xl p-4 lg:p-8 text-center w-full">
          <div className="w-12 h-12 lg:w-16 lg:h-16 bg-slate-200 rounded-full mx-auto mb-3 lg:mb-4 flex items-center justify-center">
            <StarIcon className="w-6 h-6 lg:w-8 lg:h-8 text-slate-400" />
          </div>
          <h4 className="text-sm lg:text-base font-medium text-slate-900 mb-2">
            No reviews yet
          </h4>
          <p className="text-[10px] lg:text-sm text-slate-600 mb-3 lg:mb-4">
            Be the first to share your thoughts about this product.
          </p>
        </div>
      )}

      {/* Report Dialog */}
      <Dialog open={reportModalOpen} onOpenChange={setReportModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Report Review</DialogTitle>
            <DialogDescription>
              Help us understand what&apos;s wrong with this review.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Report Reason */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Why are you reporting this review?
              </label>
              <Select value={reportReason} onValueChange={setReportReason}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  {reportReasons.map((reason) => (
                    <SelectItem key={reason} value={reason}>
                      {reason}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Additional Details */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Additional details (optional)
              </label>
              <textarea
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="Please provide any additional context..."
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent resize-none text-sm"
                maxLength={500}
              />
              <div className="text-right text-xs text-slate-500 mt-1">
                {reportDescription.length}/500 characters
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setReportModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleSubmitReport}
              disabled={!reportReason.trim() || isSubmittingReport}
            >
              {isSubmittingReport ? (
                <div className="flex space-x-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-1 h-1 bg-white rounded-full"
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                    />
                  ))}
                </div>
              ) : (
                "Submit Report"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation AlertDialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Review</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this review? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setReviewToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteReview}
              className="bg-red-600 hover:bg-red-700"
              disabled={deletingReviewId !== null}
            >
              {deletingReviewId ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
