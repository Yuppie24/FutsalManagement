import { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Alert, AlertDescription } from "../../components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog"; // Assuming you have a Dialog component
import { Upload, Image, Loader2, Trash2 } from "lucide-react";
import PageLayout from "../../layout/PageLayout";
import Cookies from "js-cookie";
import { toast } from "sonner";
import useRedirectIfOwnerLoggedIn from "../../hooks/useRedirectIfOwnerLoggedIn";

// API Configuration
const baseUrl = import.meta.env.VITE_API_BASE_URL;
const API_BASE_URL = `${baseUrl}/`;
const TOKEN = `Token ${Cookies.get("accessToken")}`;

const GalleryPage = () => {
  useRedirectIfOwnerLoggedIn();
  // State to store the facility images from the API
  const [images, setImages] = useState<
    { id: number; image: string; facility: number }[]
  >([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<string>("");
  const [facilities, setFacilities] = useState<{ id: number; name: string }[]>(
    []
  ); // To store available facilities
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null); // For the image view modal

  // Fetch facilities and images on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch facilities
        const facilitiesRes = await axios.get(`${API_BASE_URL}facilities/`, {
          headers: { Authorization: TOKEN },
        });
        const facilitiesData = Array.isArray(facilitiesRes.data.data)
          ? facilitiesRes.data.data
          : facilitiesRes.data.data
          ? [facilitiesRes.data.data]
          : [];
        setFacilities(facilitiesData);
  
        // Fetch images for facilities
        const imagesRes = await axios.get(`${API_BASE_URL}facilities/images/`, {
          headers: { Authorization: TOKEN },
        });
  
        if (imagesRes.data.status === "success") {
          const imagesData = Array.isArray(imagesRes.data.data)
            ? imagesRes.data.data
            : []; // Ensure images are set to an empty array if data is not an array
          setImages(imagesData);
          toast.success("Images fetched successfully!");
        } else {
          throw new Error("Failed to fetch images");
        }
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || err.message || "Failed to fetch data";
        setUploadError(errorMessage);
        toast.error(errorMessage);
        setImages([]); // Ensure images is an empty array in case of error
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(Array.from(e.target.files));
      setUploadError(null);
    }
  };

  const handleFacilityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedFacility(e.target.value);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setUploadError("Please select at least one image to upload");
      return;
    }
    if (!selectedFacility) {
      setUploadError("Please select a facility to associate the images with");
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => formData.append("images", file));

      const response = await axios.post(
        `${API_BASE_URL}facilities/${selectedFacility}/images/`,
        formData,
        {
          headers: {
            Authorization: TOKEN,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.status === "success") {
        const fetchData = async () => {
          setLoading(true);
          try {
            // Fetch facilities to populate the dropdown
            const facilitiesRes = await axios.get(
              `${API_BASE_URL}facilities/`,
              {
                headers: { Authorization: TOKEN },
              }
            );
            const facilitiesData = Array.isArray(facilitiesRes.data.data)
              ? facilitiesRes.data.data
              : facilitiesRes.data.data
              ? [facilitiesRes.data.data]
              : [];
            setFacilities(facilitiesData);

            // Fetch facility images
            const imagesRes = await axios.get(
              `${API_BASE_URL}facilities/images/`,
              {
                headers: { Authorization: TOKEN },
              }
            );
            if (imagesRes.data.status === "success") {
              setImages(imagesRes.data.data || []);
              toast.success("Images fetched successfully!");
            } else {
              throw new Error("Failed to fetch images");
            }
          } catch (err: any) {
            const errorMessage =
              err.response?.data?.message ||
              err.message ||
              "Failed to fetch data";
            setUploadError(errorMessage);
            toast.error(errorMessage);
            setImages([]);
          } finally {
            setLoading(false);
          }
        };
        fetchData();
        toast.success("Images uploaded successfully!");
        setSelectedFiles([]);
        setSelectedFacility("");
        // Reset the file input
        const fileInput = document.getElementById(
          "image-upload"
        ) as HTMLInputElement;
        if (fileInput) fileInput.value = "";
      } else {
        throw new Error("Failed to upload images");
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to upload images";
      setUploadError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteImage = async (id: number) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}facilities/images/${id}/`,
        {
          headers: { Authorization: TOKEN },
        }
      );

      if (response.status === 204 || response.data.status === "success") {
        setImages((prev) => prev.filter((image) => image.id !== id));
        toast.success("Image deleted successfully!");
      } else {
        throw new Error("Failed to delete image");
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to delete image";
      setUploadError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleViewImage = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  return (
    <PageLayout title="Gallery">
      <>
      <div className="p-6">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle>Upload New Images or Gif</CardTitle>
          </CardHeader>
          <CardContent>
            
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 flex flex-col gap-4">
                <select
                  value={selectedFacility}
                  onChange={handleFacilityChange}
                  className="border rounded p-2 bg-background"
                  disabled={isUploading || loading}
                >
                  <option value="">Select a Facility</option>
                  {facilities.map((facility) => (
                    <option key={facility.id} value={facility.id}>
                      {facility.name}
                    </option>
                  ))}
                </select>
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="flex-1 cursor-pointer"
                  disabled={isUploading || loading}
                />
              </div>
              <Button
                onClick={handleUpload}
                disabled={
                  isUploading || selectedFiles.length === 0 || !selectedFacility
                }
                className="md:w-auto w-full"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Images
                  </>
                )}
              </Button>
            </div>

            {uploadError && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{uploadError}</AlertDescription>
              </Alert>
            )}

            {selectedFiles.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-500">
                  Selected: {selectedFiles.length} file(s) (
                  {(
                    selectedFiles.reduce(
                      (total, file) => total + file.size,
                      0
                    ) / 1024
                  ).toFixed(2)}{" "}
                  KB)
                </p>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {selectedFiles.map((file, index) => (
                    <img
                      key={index}
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-6">
          {images && images.map((image) => (
            <Card key={image.id} className="overflow-hidden">
              <div className="relative h-48">
                <img
                  src={image.image}
                  alt={`Facility ${image.facility} Image`}
                  className="w-full h-full object-contain"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => handleDeleteImage(image.id)}
                  disabled={loading}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <CardFooter className="flex justify-between items-center p-4">
                <div>
                  <h3 className="font-medium text-sm">
                    Facility ID: {image.facility}
                  </h3>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewImage(image.image)}
                >
                  <Image className="h-4 w-4 mr-2" />
                  View
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {images.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-lg">
            <Image className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium">No images yet</h3>
            <p className="text-gray-500">
              Upload your first image to get started
            </p>
          </div>
        )}

        {loading && (
          <div className="flex justify-center items-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        )}
      </div>

      {/* Image View Modal */}
      <Dialog open={!!selectedImage} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>View Image</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="flex justify-center items-center">
              <img
                src={selectedImage}
                alt="Full-size image"
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
      </>
    </PageLayout>
  );
};

export default GalleryPage;
