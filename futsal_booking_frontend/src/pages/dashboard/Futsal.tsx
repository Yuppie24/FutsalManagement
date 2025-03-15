import { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import futsalCourtVer from "/futsalCourtVer.jpg";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Checkbox } from "../../components/ui/checkbox";
import { Switch } from "../../components/ui/switch";
import { Separator } from "../../components/ui/separator";
import { Badge } from "../../components/ui/badge";
import {
  Plus,
  Save,
  Trash2,
  Map,
  Clock,
  DollarSign,
  Info,
  Users,
  Loader2,
  Edit,
} from "lucide-react";
import PageLayout from "../../layout/PageLayout";
import Cookies from "js-cookie";
import { toast } from "sonner";
import useRedirectIfOwnerLoggedIn from "../../hooks/useRedirectIfOwnerLoggedIn";

const baseUrl = import.meta.env.VITE_API_BASE_URL;
const API_BASE_URL = `${baseUrl}/`;
const TOKEN = `Token ${Cookies.get("accessToken")}`;

const FutsalInformationPage = () => {
  useRedirectIfOwnerLoggedIn();
  // Default state for businessInfo with all required fields
  const defaultBusinessInfo = {
    id: 0,
    name: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    openingTime: "08:00",
    closingTime: "22:00",
    description: "",
    bookingNotice: "2 hours",
    cancellationPolicy: "",
    paymentOptions: [],
  };

  // State for data, initialized to null to handle initial setup
  const [facilities, setFacilities] = useState<any[] | null>(null);
  const [timeSlots, setTimeSlots] = useState<any[] | null>(null);
  const [amenities, setAmenities] = useState<any[] | null>(null);
  const [businessInfo, setBusinessInfo] = useState<{
    id: number;
    name: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    openingTime: string;
    closingTime: string;
    description: string;
    bookingNotice: string;
    cancellationPolicy: string;
    paymentOptions: string[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for adding/editing fields
  const [showAddField, setShowAddField] = useState(false);
  const [showEditField, setShowEditField] = useState(false);
  const [editFieldData, setEditFieldData] = useState<any>(null);
  const [newField, setNewField] = useState({
    name: "",
    type: "Indoor",
    surface: "",
    size: "",
    capacity: "",
    status: "active",
    address: "",
    thumbnail: null as File | null, // For thumbnail upload
    images: [] as File[], // For multiple image uploads
  });

  // State for adding/editing time slots
  const [showAddTimeSlot, setShowAddTimeSlot] = useState(false);
  const [showEditTimeSlot, setShowEditTimeSlot] = useState(false);
  const [editTimeSlotData, setEditTimeSlotData] = useState<any>(null);
  const [newTimeSlot, setNewTimeSlot] = useState({
    field: 0,
    day: "Weekdays",
    startTime: "08:00",
    endTime: "09:00",
    price: "",
    discountedPrice: "",
    status: "available",
  });

  // State for adding/editing amenities
  const [showAddAmenity, setShowAddAmenity] = useState(false);
  const [showEditAmenity, setShowEditAmenity] = useState(false);
  const [editAmenityData, setEditAmenityData] = useState<any>(null);
  const [newAmenity, setNewAmenity] = useState({
    name: "",
    description: "",
    status: true,
  });

  // State for editing field features
  const [showEditFieldFeatures, setShowEditFieldFeatures] = useState(false);
  const [editFieldFeaturesData, setEditFieldFeaturesData] = useState<any>(null);

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [facilitiesRes, timeSlotsRes, amenitiesRes, businessInfoRes] =
          await Promise.all([
            axios.get(`${API_BASE_URL}facilities/`, {
              headers: { Authorization: TOKEN },
            }),
            axios.get(`${API_BASE_URL}time-slots/`, {
              headers: { Authorization: TOKEN },
            }),
            axios.get(`${API_BASE_URL}amenities/`, {
              headers: { Authorization: TOKEN },
            }),
            axios.get(`${API_BASE_URL}business-info/`, {
              headers: { Authorization: TOKEN },
            }),
          ]);

        setFacilities(
          Array.isArray(facilitiesRes.data.data)
            ? facilitiesRes.data.data
            : facilitiesRes.data.data
            ? [facilitiesRes.data.data]
            : []
        );
        setTimeSlots(
          Array.isArray(timeSlotsRes.data.data)
            ? timeSlotsRes.data.data
            : timeSlotsRes.data.data
            ? [timeSlotsRes.data.data]
            : []
        );
        setAmenities(
          Array.isArray(amenitiesRes.data.data)
            ? amenitiesRes.data.data
            : amenitiesRes.data.data
            ? [amenitiesRes.data.data]
            : []
        );

        const backendBusinessInfo = businessInfoRes.data.data?.[0] || null;
        setBusinessInfo(
          backendBusinessInfo
            ? {
                ...defaultBusinessInfo,
                id: backendBusinessInfo.id,
                name: backendBusinessInfo.name || "",
                address: backendBusinessInfo.address || "",
                phone: backendBusinessInfo.phone || "",
                email: backendBusinessInfo.email || "",
                website: backendBusinessInfo.website || "",
                openingTime: backendBusinessInfo.opening_time || "08:00",
                closingTime: backendBusinessInfo.closing_time || "22:00",
                description: backendBusinessInfo.description || "",
                bookingNotice: backendBusinessInfo.booking_notice || "2 hours",
                cancellationPolicy:
                  backendBusinessInfo.cancellation_policy || "",
                paymentOptions: backendBusinessInfo.payment_options || [],
              }
            : defaultBusinessInfo
        );
        toast.success("Data fetched successfully!");
      } catch (err: any) {
        const errorMessage =
          "Failed to fetch data:" +
          (err.response?.data?.message || err.message);
        toast.error(errorMessage);
        console.error("Fetch Error:", err);
        setFacilities([]);
        setTimeSlots([]);
        setAmenities([]);
        setBusinessInfo(defaultBusinessInfo);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Handlers for business info
  const handleBusinessInfoChange = (field: any, value: any) => {
    if (businessInfo) {
      setBusinessInfo((prev) => ({
        ...prev!,
        [field]: value,
      }));
    }
  };

  // Handlers for fields
  const handleAddField = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", newField.name);
      formData.append("type", newField.type);
      formData.append("surface", newField.surface);
      formData.append("address", newField.address);
      formData.append("size", newField.size);
      formData.append("capacity", newField.capacity);
      formData.append("status", newField.status);
      if (newField.thumbnail) formData.append("thumbnail", newField.thumbnail);
      newField.images.forEach((image) => formData.append("images", image));

      const response = await axios.post(
        `${API_BASE_URL}facilities/`,
        formData,
        {
          headers: {
            Authorization: TOKEN,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response.data.status === "success") {
        setFacilities((prev) => [...(prev || []), response.data.data]);
        setNewField({
          name: "",
          type: "Indoor",
          surface: "",
          size: "",
          capacity: "",
          status: "active",
          address: "",
          thumbnail: null,
          images: [],
        });
        setShowAddField(false);
        toast.success("Field added successfully!");
      }
    } catch (err: any) {
      const errorMessage =
        "Failed to add field: " + (err.response?.data?.message || err.message);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEditField = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!editFieldData) return;
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", editFieldData.name);
      formData.append("type", editFieldData.type);
      formData.append("address", editFieldData.address);
      formData.append("surface", editFieldData.surface);
      formData.append("size", editFieldData.size);
      formData.append("capacity", editFieldData.capacity);
      formData.append("status", editFieldData.status);
      if (editFieldData.thumbnail instanceof File)
        formData.append("thumbnail", editFieldData.thumbnail);
      editFieldData.images.forEach((image: File) =>
        formData.append("images", image)
      );

      const response = await axios.put(
        `${API_BASE_URL}facilities/${editFieldData.id}/`,
        formData,
        {
          headers: {
            Authorization: TOKEN,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response.data.status === "success") {
        setFacilities(
          (prev) =>
            prev?.map((field) =>
              field.id === editFieldData.id ? response.data.data : field
            ) || []
        );
        setShowEditField(false);
        setEditFieldData(null);
        toast.success("Field updated successfully!");
      }
    } catch (err: any) {
      const errorMessage =
        "Failed to update field: " +
        (err.response?.data?.message || err.message);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (field: any, value: any) => {
    setNewField((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEditFieldChange = (field: any, value: any) => {
    setEditFieldData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDeleteField = async (id: any, e: React.MouseEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axios.delete(`${API_BASE_URL}facilities/${id}/`, {
        headers: { Authorization: TOKEN },
      });
      if (response.data.status === "success") {
        setFacilities((prev) => prev?.filter((field) => field.id !== id) || []);
        toast.success("Facility deleted successfully!");
      }
    } catch (err: any) {
      const errorMessage =
        "Failed to delete field: " +
        (err.response?.data?.message || err.message);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handlers for time slots
  const handleAddTimeSlot = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axios.post(
        `${API_BASE_URL}time-slots/`,
        {
          field: newTimeSlot.field,
          day: newTimeSlot.day,
          start_time: newTimeSlot.startTime,
          end_time: newTimeSlot.endTime,
          price: parseFloat(newTimeSlot.price),
          discounted_price: parseFloat(newTimeSlot.discountedPrice),
          status: newTimeSlot.status,
        },
        {
          headers: { Authorization: TOKEN, "Content-Type": "application/json" },
        }
      );
      if (response.data.status === "success") {
        setTimeSlots((prev) => [...(prev || []), response.data.data]);
        setNewTimeSlot({
          field: 0,
          day: "Weekdays",
          startTime: "08:00",
          endTime: "09:00",
          price: "",
          discountedPrice: "",
          status: "available",
        });
        setShowAddTimeSlot(false);
        toast.success("Time slot added successfully!");
      }
    } catch (err: any) {
      const errorMessage =
        "Failed to add time slot: " +
        (err.response?.data?.message || err.message);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEditTimeSlot = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!editTimeSlotData) return;
    try {
      setLoading(true);
      const response = await axios.put(
        `${API_BASE_URL}time-slots/${editTimeSlotData.id}/`,
        {
          field: editTimeSlotData.field,
          day: editTimeSlotData.day,
          start_time: editTimeSlotData.startTime,
          end_time: editTimeSlotData.endTime,
          price: parseFloat(editTimeSlotData.price),
          discounted_price: parseFloat(editTimeSlotData.discountedPrice),
          status: editTimeSlotData.status,
        },
        {
          headers: { Authorization: TOKEN, "Content-Type": "application/json" },
        }
      );
      if (response.data.status === "success") {
        setTimeSlots(
          (prev) =>
            prev?.map((slot) =>
              slot.id === editTimeSlotData.id ? response.data.data : slot
            ) || []
        );
        setShowEditTimeSlot(false);
        setEditTimeSlotData(null);
        toast.success("Time slot updated successfully!");
      }
    } catch (err: any) {
      const errorMessage =
        "Failed to update time slot: " +
        (err.response?.data?.message || err.message);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeSlotChange = (field: string, value: any) => {
    setNewTimeSlot((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEditTimeSlotChange = (field: string, value: any) => {
    setEditTimeSlotData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDeleteTimeSlot = async (id: any, e: React.MouseEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axios.delete(`${API_BASE_URL}time-slots/${id}/`, {
        headers: { Authorization: TOKEN },
      });
      if (response.data.status === "success") {
        setTimeSlots((prev) => prev?.filter((slot) => slot.id !== id) || []);
        toast.success("Time slot deleted successfully!");
      }
    } catch (err: any) {
      const errorMessage =
        "Failed to delete time slot: " +
        (err.response?.data?.message || err.message);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handlers for amenities
  const handleAddAmenity = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axios.post(
        `${API_BASE_URL}amenities/`,
        {
          name: newAmenity.name,
          description: newAmenity.description,
          status: newAmenity.status,
        },
        {
          headers: { Authorization: TOKEN, "Content-Type": "application/json" },
        }
      );
      if (response.data.status === "success") {
        setAmenities((prev) => [...(prev || []), response.data.data]);
        setNewAmenity({
          name: "",
          description: "",
          status: true,
        });
        setShowAddAmenity(false);
        toast.success("Amenity added successfully!");
      }
    } catch (err: any) {
      const errorMessage =
        "Failed to add amenity: " +
        (err.response?.data?.message || err.message);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEditAmenity = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!editAmenityData) return;
    try {
      setLoading(true);
      const response = await axios.put(
        `${API_BASE_URL}amenities/${editAmenityData.id}/`,
        {
          name: editAmenityData.name,
          description: editAmenityData.description,
          status: editAmenityData.status,
        },
        {
          headers: { Authorization: TOKEN, "Content-Type": "application/json" },
        }
      );
      if (response.data.status === "success") {
        setAmenities(
          (prev) =>
            prev?.map((amenity) =>
              amenity.id === editAmenityData.id ? response.data.data : amenity
            ) || []
        );
        setShowEditAmenity(false);
        setEditAmenityData(null);
        toast.success("Amenity updated successfully!");
      }
    } catch (err: any) {
      const errorMessage =
        "Failed to update amenity: " +
        (err.response?.data?.message || err.message);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAmenity = async (id: any, e: React.MouseEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axios.delete(`${API_BASE_URL}amenities/${id}/`, {
        headers: { Authorization: TOKEN },
      });
      if (response.data.status === "success") {
        setAmenities(
          (prev) => prev?.filter((amenity) => amenity.id !== id) || []
        );
        toast.success("Amenity deleted successfully!");
      }
    } catch (err: any) {
      const errorMessage =
        "Failed to delete amenity: " +
        (err.response?.data?.message || err.message);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleFieldImageChange = (
    field: "thumbnail" | "images",
    files: FileList | null
  ) => {
    if (field === "thumbnail" && files && files.length > 0) {
      setNewField((prev) => ({
        ...prev,
        thumbnail: files[0],
      }));
    } else if (field === "images" && files) {
      setNewField((prev) => ({
        ...prev,
        images: Array.from(files),
      }));
    }
  };

  const handleEditFieldImageChange = (
    field: "thumbnail" | "images",
    files: FileList | null
  ) => {
    if (field === "thumbnail" && files && files.length > 0) {
      setEditFieldData((prev: any) => ({
        ...prev,
        thumbnail: files[0],
      }));
    } else if (field === "images" && files) {
      setEditFieldData((prev: any) => ({
        ...prev,
        images: Array.from(files),
      }));
    }
  };

  const handleAmenityToggle = async (id: any, e: React.MouseEvent) => {
    e.preventDefault();
    const amenity = amenities?.find((a) => a.id === id);
    if (amenity) {
      try {
        setLoading(true);
        const response = await axios.patch(
          `${API_BASE_URL}amenities/${id}/`,
          {
            status: !amenity.status,
          },
          {
            headers: {
              Authorization: TOKEN,
              "Content-Type": "application/json",
            },
          }
        );
        if (response.data.status === "success") {
          setAmenities(
            (prev) =>
              prev?.map((a) =>
                a.id === id ? { ...a, status: !a.status } : a
              ) || []
          );
          toast.success("Amenity updated successfully!");
        }
      } catch (err: any) {
        const errorMessage =
          "Failed to update amenity: " +
          (err.response?.data?.message || err.message);
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAmenityChange = (field: string, value: any) => {
    setNewAmenity((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEditAmenityChange = (field: string, value: any) => {
    setEditAmenityData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handlers for field features
  const handleEditFieldFeatures = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!editFieldFeaturesData) return;
    try {
      setLoading(true);
      const features = [
        editFieldFeaturesData.goals ? "goals" : null,
        editFieldFeaturesData.scoreboard ? "scoreboard" : null,
        editFieldFeaturesData.lights ? "lights" : null,
        editFieldFeaturesData.benches ? "benches" : null,
        editFieldFeaturesData.referee ? "referee" : null,
        editFieldFeaturesData.ac ? "ac" : null,
        editFieldFeaturesData.recording ? "recording" : null,
        editFieldFeaturesData.spectator ? "spectator" : null,
      ].filter(Boolean); // Filter out null values

      const response = await axios.put(
        `${API_BASE_URL}facilities/${editFieldFeaturesData.id}/features/`,
        {
          features: features,
        },
        {
          headers: { Authorization: TOKEN, "Content-Type": "application/json" },
        }
      );
      if (response.data.status === "success") {
        setFacilities(
          (prev) =>
            prev?.map((field) =>
              field.id === editFieldFeaturesData.id
                ? { ...field, features: response.data.data.features }
                : field
            ) || []
        );
        setShowEditFieldFeatures(false);
        setEditFieldFeaturesData(null);
        toast.success("Field features updated successfully!");
      }
    } catch (err: any) {
      const errorMessage =
        "Failed to update field features: " +
        (err.response?.data?.message || err.message);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleFieldFeaturesChange = (field: string, value: boolean) => {
    setEditFieldFeaturesData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Save business info
  const handleSaveBusinessInfo = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axios.put(
        `${API_BASE_URL}business-info/${businessInfo?.id}/`,
        {
          name: businessInfo?.name || "",
          address: businessInfo?.address || "",
          phone: businessInfo?.phone || "",
          email: businessInfo?.email || "",
          website: businessInfo?.website || "",
          opening_time: businessInfo?.openingTime || "08:00",
          closing_time: businessInfo?.closingTime || "22:00",
          description: businessInfo?.description || "",
          booking_notice: businessInfo?.bookingNotice || "2 hours",
          cancellation_policy: businessInfo?.cancellationPolicy || "",
          payment_options: businessInfo?.paymentOptions || [],
        },
        {
          headers: { Authorization: TOKEN, "Content-Type": "application/json" },
        }
      );
      if (response.data.status === "success") {
        toast.success("Business info saved successfully!");
      }
    } catch (err: any) {
      const errorMessage =
        "Failed to save business info: " +
        (err.response?.data?.message || err.message);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <PageLayout title="Futsal">
      <div className="flex-1 p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">
            Manage Futsal Facility Information
          </h1>
          <Button
            onClick={handleSaveBusinessInfo}
            disabled={!businessInfo || loading}
          >
            <Save className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">
              {loading ? "Saving..." : "Save All Changes"}
            </span>
            {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
          </Button>
        </div>
        <Tabs defaultValue="basic-info" className="w-full">
          <TabsList className="grid w-full grid-cols-4 max-sm:flex max-sm:flex-col h-auto">
            <TabsTrigger
              value="basic-info"
              className="flex items-center w-full"
            >
              <Info className="mr-2 h-4 w-4" />
              Basic Information
            </TabsTrigger>
            <TabsTrigger value="fields" className="flex items-center w-full">
              <Map className="mr-2 h-4 w-4" />
              Fields & Facilities
            </TabsTrigger>
            <TabsTrigger
              value="time-slots"
              className="flex items-center w-full"
            >
              <Clock className="mr-2 h-4 w-4" />
              Time Slots & Pricing
            </TabsTrigger>
            <TabsTrigger value="amenities" className="flex items-center w-full">
              <Users className="mr-2 h-4 w-4" />
              Amenities & Services
            </TabsTrigger>
          </TabsList>
          {/* Basic Information Tab */}
          <TabsContent value="basic-info" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Business Details</CardTitle>
                <CardDescription>
                  {businessInfo
                    ? "Basic information about your futsal facility"
                    : "Set up your futsal facility details below."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="business-name">Facility Name</Label>
                      <Input
                        id="business-name"
                        value={businessInfo?.name || ""}
                        onChange={(e) =>
                          handleBusinessInfoChange("name", e.target.value)
                        }
                        placeholder="Enter facility name"
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="business-address">Address</Label>
                      <Textarea
                        id="business-address"
                        value={businessInfo?.address || ""}
                        onChange={(e) =>
                          handleBusinessInfoChange("address", e.target.value)
                        }
                        rows={3}
                        placeholder="Enter facility address"
                        disabled={loading}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="business-phone">Phone Number</Label>
                        <Input
                          id="business-phone"
                          value={businessInfo?.phone || ""}
                          onChange={(e) =>
                            handleBusinessInfoChange("phone", e.target.value)
                          }
                          placeholder="Enter phone number"
                          disabled={loading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="business-email">Email</Label>
                        <Input
                          id="business-email"
                          type="email"
                          value={businessInfo?.email || ""}
                          onChange={(e) =>
                            handleBusinessInfoChange("email", e.target.value)
                          }
                          placeholder="Enter email"
                          disabled={loading}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="business-website">Website</Label>
                      <Input
                        id="business-website"
                        value={businessInfo?.website || ""}
                        onChange={(e) =>
                          handleBusinessInfoChange("website", e.target.value)
                        }
                        placeholder="Enter website URL"
                        disabled={loading}
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="business-description">
                        Facility Description
                      </Label>
                      <Textarea
                        id="business-description"
                        value={businessInfo?.description || ""}
                        onChange={(e) =>
                          handleBusinessInfoChange(
                            "description",
                            e.target.value
                          )
                        }
                        rows={4}
                        placeholder="Describe your facility"
                        disabled={loading}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="opening-time">Opening Time</Label>
                        <Input
                          id="opening-time"
                          type="time"
                          value={businessInfo?.openingTime || "08:00"}
                          onChange={(e) =>
                            handleBusinessInfoChange(
                              "openingTime",
                              e.target.value
                            )
                          }
                          disabled={loading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="closing-time">Closing Time</Label>
                        <Input
                          id="closing-time"
                          type="time"
                          value={businessInfo?.closingTime || "22:00"}
                          onChange={(e) =>
                            handleBusinessInfoChange(
                              "closingTime",
                              e.target.value
                            )
                          }
                          disabled={loading}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="booking-notice">
                        Advance Booking Notice
                      </Label>
                      <Select
                        value={businessInfo?.bookingNotice || "2 hours"}
                        onValueChange={(value) =>
                          handleBusinessInfoChange("bookingNotice", value)
                        }
                        disabled={loading}
                      >
                        <SelectTrigger id="booking-notice">
                          <SelectValue placeholder="Select minimum booking notice" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1 hour">1 hour</SelectItem>
                          <SelectItem value="2 hours">2 hours</SelectItem>
                          <SelectItem value="4 hours">4 hours</SelectItem>
                          <SelectItem value="12 hours">12 hours</SelectItem>
                          <SelectItem value="24 hours">24 hours</SelectItem>
                          <SelectItem value="48 hours">48 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <Separator className="my-4" />
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cancellation-policy">
                      Cancellation Policy
                    </Label>
                    <Textarea
                      id="cancellation-policy"
                      value={businessInfo?.cancellationPolicy || ""}
                      onChange={(e) =>
                        handleBusinessInfoChange(
                          "cancellationPolicy",
                          e.target.value
                        )
                      }
                      rows={2}
                      placeholder="Enter cancellation policy"
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Payment Options</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {["Cash", "Credit Card", "Online Payment"].map(
                        (option) => (
                          <div
                            key={option}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`payment-${option.toLowerCase()}`}
                              checked={
                                Array.isArray(businessInfo?.paymentOptions) &&
                                businessInfo.paymentOptions.includes(option)
                              }
                              onCheckedChange={(checked) => {
                                if (businessInfo) {
                                  if (checked) {
                                    handleBusinessInfoChange("paymentOptions", [
                                      ...(businessInfo.paymentOptions || []),
                                      option,
                                    ]);
                                  } else {
                                    handleBusinessInfoChange(
                                      "paymentOptions",
                                      (
                                        businessInfo.paymentOptions || []
                                      ).filter((opt) => opt !== option)
                                    );
                                  }
                                }
                              }}
                              disabled={loading}
                            />
                            <label
                              htmlFor={`payment-${option.toLowerCase()}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {option}
                            </label>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-6">
                <div className="flex justify-between w-full">
                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    onClick={handleSaveBusinessInfo}
                    disabled={!businessInfo || loading}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {loading ? "Saving..." : "Save Information"}
                    {loading && (
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    )}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
          {/* Fields & Facilities Tab */}
          <TabsContent value="fields" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-xl">Fields & Courts</CardTitle>
                    <CardDescription>
                      {facilities === null || facilities.length === 0
                        ? "Add your first field below."
                        : "Manage all the fields in your facility"}
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => setShowAddField(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={loading}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Field
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {facilities === null ? (
                  <div className="text-center py-10">
                    <p className="text-gray-500">
                      Loading fields... or no fields available yet.
                    </p>
                  </div>
                ) : facilities.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-gray-500">
                      No fields added yet. Click the button above to add your
                      first field.
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Id</TableHead>
                        <TableHead>Field Name</TableHead>
                        <TableHead>Field Address</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Surface</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Max Players</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {facilities.map((field) => (
                        <TableRow key={field.id}>
                          <TableCell>{field.id}</TableCell>
                          <TableCell className="font-medium flex items-center gap-2 max-sm:mr-6">
                            <img
                              src={
                                field.thumbnail ||
                                (field.images.length > 0
                                  ? field.images[0].image
                                  : futsalCourtVer)
                              }
                              className="w-8 h-8 rounded-full object-cover"
                            />
                            {field.name}
                          </TableCell>
                          <TableCell>{field.address}</TableCell>
                          <TableCell>{field.type}</TableCell>
                          <TableCell>{field.surface}</TableCell>
                          <TableCell>{field.size}</TableCell>
                          <TableCell>{field.capacity}</TableCell>
                          <TableCell>
                            <Badge
                              className={
                                field.status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : field.status === "maintenance"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-red-100 text-red-800"
                              }
                            >
                              {field.status === "active"
                                ? "Active"
                                : field.status === "maintenance"
                                ? "Maintenance"
                                : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditFieldData({ ...field });
                                  setShowEditField(true);
                                }}
                                disabled={loading}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={(e) => handleDeleteField(field.id, e)}
                                disabled={loading}
                              >
                                <Trash2 className="h-4 w-4" />
                                {loading && (
                                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
                {showAddField && (
                  <div className="mt-6 border rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-4">Add New Field</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="field-name">Field Name</Label>
                        <Input
                          id="field-name"
                          value={newField.name}
                          onChange={(e) =>
                            handleFieldChange("name", e.target.value)
                          }
                          placeholder="e.g. Field 4"
                          disabled={loading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="field-type">Field Type</Label>
                        <Select
                          value={newField.type}
                          onValueChange={(value) =>
                            handleFieldChange("type", value)
                          }
                          disabled={loading}
                        >
                          <SelectTrigger id="field-type">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Indoor">Indoor</SelectItem>
                            <SelectItem value="Outdoor">Outdoor</SelectItem>
                            <SelectItem value="Covered Outdoor">
                              Covered Outdoor
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="field-surface">Surface Type</Label>
                        <Input
                          id="field-surface"
                          value={newField.surface}
                          onChange={(e) =>
                            handleFieldChange("surface", e.target.value)
                          }
                          placeholder="e.g. Artificial Turf"
                          disabled={loading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="field-size">Field Size</Label>
                        <Input
                          id="field-size"
                          value={newField.size}
                          onChange={(e) =>
                            handleFieldChange("size", e.target.value)
                          }
                          placeholder="e.g. 25m x 15m"
                          disabled={loading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="field-capacity">Max Players</Label>
                        <Input
                          id="field-capacity"
                          type="number"
                          value={newField.capacity}
                          onChange={(e) =>
                            handleFieldChange("capacity", e.target.value)
                          }
                          placeholder="e.g. 10"
                          disabled={loading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="field-status">Status</Label>
                        <Select
                          value={newField.status}
                          onValueChange={(value) =>
                            handleFieldChange("status", value)
                          }
                          disabled={loading}
                        >
                          <SelectTrigger id="field-status">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="maintenance">
                              Maintenance
                            </SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="field-address">Field Address</Label>
                        <Input
                          id="field-address"
                          value={newField.address}
                          onChange={(e) =>
                            handleFieldChange("address", e.target.value)
                          }
                          placeholder="e.g. 123 street, Pokhara"
                          disabled={loading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="field-thumbnail">Thumbnail</Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            id="field-thumbnail"
                            type="file"
                            className="cursor-pointer"
                            accept="image/*"
                            onChange={(e) =>
                              handleFieldImageChange(
                                "thumbnail",
                                e.target.files
                              )
                            }
                            disabled={loading}
                          />
                          {newField.thumbnail && (
                            <img
                              src={URL.createObjectURL(newField.thumbnail)}
                              alt="Thumbnail Preview"
                              className="w-12 h-12 object-cover rounded"
                            />
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="field-images">Images</Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            id="field-images"
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) =>
                              handleFieldImageChange("images", e.target.files)
                            }
                            disabled={loading}
                            className="cursor-pointer"
                          />
                          {newField.images.length > 0 && (
                            <div className="flex space-x-2">
                              {newField.images.map((image, index) => (
                                <img
                                  key={index}
                                  src={URL.createObjectURL(image)}
                                  alt={`Image Preview ${index + 1}`}
                                  className="w-12 h-12 object-cover rounded"
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end mt-4 space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setShowAddField(false)}
                        disabled={loading}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleAddField}
                        className="bg-green-600 hover:bg-green-700"
                        disabled={loading}
                      >
                        {loading ? "Adding..." : "Add Field"}
                        {loading && (
                          <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}
                {showEditField && editFieldData && (
                  <div className="mt-6 border rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-4">Edit Field</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-field-name">Field Name</Label>
                        <Input
                          id="edit-field-name"
                          value={editFieldData.name}
                          onChange={(e) =>
                            handleEditFieldChange("name", e.target.value)
                          }
                          placeholder="e.g. Field 4"
                          disabled={loading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-field-type">Field Type</Label>
                        <Select
                          value={editFieldData.type}
                          onValueChange={(value) =>
                            handleEditFieldChange("type", value)
                          }
                          disabled={loading}
                        >
                          <SelectTrigger id="edit-field-type">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Indoor">Indoor</SelectItem>
                            <SelectItem value="Outdoor">Outdoor</SelectItem>
                            <SelectItem value="Covered Outdoor">
                              Covered Outdoor
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-field-surface">Surface Type</Label>
                        <Input
                          id="edit-field-surface"
                          value={editFieldData.surface}
                          onChange={(e) =>
                            handleEditFieldChange("surface", e.target.value)
                          }
                          placeholder="e.g. Artificial Turf"
                          disabled={loading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-field-size">Field Size</Label>
                        <Input
                          id="edit-field-size"
                          value={editFieldData.size}
                          onChange={(e) =>
                            handleEditFieldChange("size", e.target.value)
                          }
                          placeholder="e.g. 25m x 15m"
                          disabled={loading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-field-capacity">Max Players</Label>
                        <Input
                          id="edit-field-capacity"
                          type="number"
                          value={editFieldData.capacity}
                          onChange={(e) =>
                            handleEditFieldChange("capacity", e.target.value)
                          }
                          placeholder="e.g. 10"
                          disabled={loading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-field-address">
                          Field Address
                        </Label>
                        <Input
                          id="edit-field-address"
                          value={editFieldData.address}
                          onChange={(e) =>
                            handleEditFieldChange("address", e.target.value)
                          }
                          placeholder="e.g. 123 street, Pokhara"
                          disabled={loading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-field-status">Status</Label>
                        <Select
                          value={editFieldData.status}
                          onValueChange={(value) =>
                            handleEditFieldChange("status", value)
                          }
                          disabled={loading}
                        >
                          <SelectTrigger id="edit-field-status">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="maintenance">
                              Maintenance
                            </SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-field-thumbnail">Thumbnail</Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            id="edit-field-thumbnail"
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              handleEditFieldImageChange(
                                "thumbnail",
                                e.target.files
                              )
                            }
                            disabled={loading}
                          />
                          {editFieldData.thumbnail && (
                            <img
                              src={editFieldData.thumbnail}
                              alt={editFieldData.name}
                              className={`w-12 h-12 object-cover rounded ${
                                editFieldData.thumbnail instanceof File &&
                                "hidden"
                              }`}
                            />
                          )}
                          {editFieldData.thumbnail instanceof File && (
                            <img
                              src={URL.createObjectURL(editFieldData.thumbnail)}
                              alt="New Thumbnail Preview"
                              className="w-12 h-12 object-cover rounded"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end mt-4 space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowEditField(false);
                          setEditFieldData(null);
                        }}
                        disabled={loading}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleEditField}
                        className="bg-green-600 hover:bg-green-700"
                        disabled={loading}
                      >
                        {loading ? "Updating..." : "Update Field"}
                        {loading && (
                          <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Field Features</CardTitle>
                <CardDescription>
                  {facilities === null || facilities.length === 0
                    ? "Add fields to manage their features."
                    : "Specific features and equipment for each field"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {facilities === null ? (
                  <div className="text-center py-10">
                    <p className="text-gray-500">
                      Loading fields... or no fields available yet.
                    </p>
                  </div>
                ) : facilities.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-gray-500">
                      No fields added yet. Add a field to manage features.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {facilities.map((field) => (
                      <div
                        key={`features-${field.id}`}
                        className="p-4 border rounded-lg"
                      >
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-medium">
                            {field.name} Features
                          </h3>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const features = {
                                id: field.id,
                                name: field.name,
                                goals:
                                  field.features?.includes("goals") || false,
                                scoreboard:
                                  field.features?.includes("scoreboard") ||
                                  false,
                                lights:
                                  field.features?.includes("lights") || false,
                                benches:
                                  field.features?.includes("benches") || false,
                                referee:
                                  field.features?.includes("referee") || false,
                                ac: field.features?.includes("ac") || false,
                                recording:
                                  field.features?.includes("recording") ||
                                  false,
                                spectator:
                                  field.features?.includes("spectator") ||
                                  false,
                              };
                              setEditFieldFeaturesData(features);
                              setShowEditFieldFeatures(true);
                            }}
                            disabled={loading}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`${field.id}-goals`}
                              checked={
                                field.features?.includes("goals") || false
                              }
                              disabled={true}
                            />
                            <Label htmlFor={`${field.id}-goals`}>Goals</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`${field.id}-scoreboard`}
                              checked={
                                field.features?.includes("scoreboard") || false
                              }
                              disabled={true}
                            />
                            <Label htmlFor={`${field.id}-scoreboard`}>
                              Scoreboard
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`${field.id}-lights`}
                              checked={
                                field.features?.includes("lights") || false
                              }
                              disabled={true}
                            />
                            <Label htmlFor={`${field.id}-lights`}>
                              Field Lights
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`${field.id}-benches`}
                              checked={
                                field.features?.includes("benches") || false
                              }
                              disabled={true}
                            />
                            <Label htmlFor={`${field.id}-benches`}>
                              Team Benches
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`${field.id}-referee`}
                              checked={
                                field.features?.includes("referee") || false
                              }
                              disabled={true}
                            />
                            <Label htmlFor={`${field.id}-referee`}>
                              Referee Service
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`${field.id}-ac`}
                              checked={field.features?.includes("ac") || false}
                              disabled={true}
                            />
                            <Label htmlFor={`${field.id}-ac`}>
                              Air Conditioning
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`${field.id}-recording`}
                              checked={
                                field.features?.includes("recording") || false
                              }
                              disabled={true}
                            />
                            <Label htmlFor={`${field.id}-recording`}>
                              Video Recording
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`${field.id}-spectator`}
                              checked={
                                field.features?.includes("spectator") || false
                              }
                              disabled={true}
                            />
                            <Label htmlFor={`${field.id}-spectator`}>
                              Spectator Area
                            </Label>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {showEditFieldFeatures && editFieldFeaturesData && (
                  <div className="mt-6 border rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-4">
                      Edit {editFieldFeaturesData.name} Features
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="edit-goals"
                          checked={editFieldFeaturesData.goals}
                          onCheckedChange={(checked) =>
                            handleFieldFeaturesChange(
                              "goals",
                              checked as boolean
                            )
                          }
                          disabled={loading}
                        />
                        <Label htmlFor="edit-goals">Goals</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="edit-scoreboard"
                          checked={editFieldFeaturesData.scoreboard}
                          onCheckedChange={(checked) =>
                            handleFieldFeaturesChange(
                              "scoreboard",
                              checked as boolean
                            )
                          }
                          disabled={loading}
                        />
                        <Label htmlFor="edit-scoreboard">Scoreboard</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="edit-lights"
                          checked={editFieldFeaturesData.lights}
                          onCheckedChange={(checked) =>
                            handleFieldFeaturesChange(
                              "lights",
                              checked as boolean
                            )
                          }
                          disabled={loading}
                        />
                        <Label htmlFor="edit-lights">Field Lights</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="edit-benches"
                          checked={editFieldFeaturesData.benches}
                          onCheckedChange={(checked) =>
                            handleFieldFeaturesChange(
                              "benches",
                              checked as boolean
                            )
                          }
                          disabled={loading}
                        />
                        <Label htmlFor="edit-benches">Team Benches</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="edit-referee"
                          checked={editFieldFeaturesData.referee}
                          onCheckedChange={(checked) =>
                            handleFieldFeaturesChange(
                              "referee",
                              checked as boolean
                            )
                          }
                          disabled={loading}
                        />
                        <Label htmlFor="edit-referee">Referee Service</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="edit-ac"
                          checked={editFieldFeaturesData.ac}
                          onCheckedChange={(checked) =>
                            handleFieldFeaturesChange("ac", checked as boolean)
                          }
                          disabled={loading}
                        />
                        <Label htmlFor="edit-ac">Air Conditioning</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="edit-recording"
                          checked={editFieldFeaturesData.recording}
                          onCheckedChange={(checked) =>
                            handleFieldFeaturesChange(
                              "recording",
                              checked as boolean
                            )
                          }
                          disabled={loading}
                        />
                        <Label htmlFor="edit-recording">Video Recording</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="edit-spectator"
                          checked={editFieldFeaturesData.spectator}
                          onCheckedChange={(checked) =>
                            handleFieldFeaturesChange(
                              "spectator",
                              checked as boolean
                            )
                          }
                          disabled={loading}
                        />
                        <Label htmlFor="edit-spectator">Spectator Area</Label>
                      </div>
                    </div>
                    <div className="flex justify-end mt-4 space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowEditFieldFeatures(false);
                          setEditFieldFeaturesData(null);
                        }}
                        disabled={loading}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleEditFieldFeatures}
                        className="bg-green-600 hover:bg-green-700"
                        disabled={loading}
                      >
                        {loading ? "Updating..." : "Update Features"}
                        {loading && (
                          <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          {/* Time Slots & Pricing Tab */}
          <TabsContent value="time-slots" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-xl">
                      Time Slots & Pricing
                    </CardTitle>
                    <CardDescription>
                      {timeSlots === null || timeSlots.length === 0
                        ? "Add your first time slot below."
                        : "Set availability and pricing for each field"}
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => setShowAddTimeSlot(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={loading || facilities?.length === 0}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Time Slot
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {timeSlots === null ? (
                  <div className="text-center py-10">
                    <p className="text-gray-500">
                      Loading time slots... or no time slots available yet.
                    </p>
                  </div>
                ) : timeSlots.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-gray-500">
                      No time slots added yet. Click the button above to add
                      your first time slot.
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Field</TableHead>
                        <TableHead>Day</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Standard Price</TableHead>
                        <TableHead>Discounted Price</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {timeSlots.map((slot) => (
                        <TableRow key={slot.id}>
                          <TableCell className="font-medium">
                            {slot.field}
                          </TableCell>
                          <TableCell>{slot.day}</TableCell>
                          <TableCell>{`${slot.start_time} - ${slot.end_time}`}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <DollarSign className="h-4 w-4 mr-1 text-gray-500" />
                              {slot.price}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <DollarSign className="h-4 w-4 mr-1 text-gray-500" />
                              {slot.discounted_price}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                slot.status === "available"
                                  ? "bg-green-100 text-green-800"
                                  : slot.status === "booked"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-red-100 text-red-800"
                              }
                            >
                              {slot.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditTimeSlotData({
                                    ...slot,
                                    startTime: slot.start_time,
                                    endTime: slot.end_time,
                                    discountedPrice: slot.discounted_price,
                                  });
                                  setShowEditTimeSlot(true);
                                }}
                                disabled={loading}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={(e) =>
                                  handleDeleteTimeSlot(slot.id, e)
                                }
                                disabled={loading}
                              >
                                <Trash2 className="h-4 w-4" />
                                {loading && (
                                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
                {showAddTimeSlot && (
                  <div className="mt-6 border rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-4">
                      Add New Time Slot
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="slot-field">Field</Label>
                        <Select
                          value={newTimeSlot.field.toString()}
                          onValueChange={(value) =>
                            handleTimeSlotChange("field", parseInt(value))
                          }
                          disabled={loading}
                        >
                          <SelectTrigger id="slot-field">
                            <SelectValue placeholder="Select field" />
                          </SelectTrigger>
                          <SelectContent>
                            {facilities?.map((field) => (
                              <SelectItem
                                key={field.id}
                                value={field.id.toString()}
                              >
                                {field.name}
                              </SelectItem>
                            )) || []}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="slot-day">Day Type</Label>
                        <Select
                          value={newTimeSlot.day}
                          onValueChange={(value) =>
                            handleTimeSlotChange("day", value)
                          }
                          disabled={loading}
                        >
                          <SelectTrigger id="slot-day">
                            <SelectValue placeholder="Select day type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Weekdays">Weekdays</SelectItem>
                            <SelectItem value="Weekends">Weekends</SelectItem>
                            <SelectItem value="Holidays">Holidays</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="slot-status">Availability Status</Label>
                        <Select
                          value={newTimeSlot.status}
                          onValueChange={(value) =>
                            handleTimeSlotChange("status", value)
                          }
                          disabled={loading}
                        >
                          <SelectTrigger id="slot-status">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="available">Available</SelectItem>
                            <SelectItem value="booked">Booked</SelectItem>
                            <SelectItem value="unavailable">
                              Unavailable
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="slot-start">Start Time</Label>
                        <Input
                          id="slot-start"
                          type="time"
                          value={newTimeSlot.startTime}
                          onChange={(e) =>
                            handleTimeSlotChange("startTime", e.target.value)
                          }
                          disabled={loading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="slot-end">End Time</Label>
                        <Input
                          id="slot-end"
                          type="time"
                          value={newTimeSlot.endTime}
                          onChange={(e) =>
                            handleTimeSlotChange("endTime", e.target.value)
                          }
                          disabled={loading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="slot-price">Standard Price ($)</Label>
                        <Input
                          id="slot-price"
                          type="number"
                          value={newTimeSlot.price}
                          onChange={(e) =>
                            handleTimeSlotChange("price", e.target.value)
                          }
                          placeholder="e.g. 80"
                          disabled={loading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="slot-discounted">
                          Discounted Price ($)
                        </Label>
                        <Input
                          id="slot-discounted"
                          type="number"
                          value={newTimeSlot.discountedPrice}
                          onChange={(e) =>
                            handleTimeSlotChange(
                              "discountedPrice",
                              e.target.value
                            )
                          }
                          placeholder="e.g. 65"
                          disabled={loading}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end mt-4 space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setShowAddTimeSlot(false)}
                        disabled={loading}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleAddTimeSlot}
                        className="bg-green-600 hover:bg-green-700"
                        disabled={loading}
                      >
                        {loading ? "Adding..." : "Add Time Slot"}
                        {loading && (
                          <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}
                {showEditTimeSlot && editTimeSlotData && (
                  <div className="mt-6 border rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-4">Edit Time Slot</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-slot-field">Field</Label>
                        <Select
                          value={editTimeSlotData.field.toString()}
                          onValueChange={(value) =>
                            handleEditTimeSlotChange("field", parseInt(value))
                          }
                          disabled={loading}
                        >
                          <SelectTrigger id="edit-slot-field">
                            <SelectValue placeholder="Select field" />
                          </SelectTrigger>
                          <SelectContent>
                            {facilities?.map((field) => (
                              <SelectItem
                                key={field.id}
                                value={field.id.toString()}
                              >
                                {field.name}
                              </SelectItem>
                            )) || []}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-slot-day">Day Type</Label>
                        <Select
                          value={editTimeSlotData.day}
                          onValueChange={(value) =>
                            handleEditTimeSlotChange("day", value)
                          }
                          disabled={loading}
                        >
                          <SelectTrigger id="edit-slot-day">
                            <SelectValue placeholder="Select day type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Weekdays">Weekdays</SelectItem>
                            <SelectItem value="Weekends">Weekends</SelectItem>
                            <SelectItem value="Holidays">Holidays</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-slot-status">
                          Availability Status
                        </Label>
                        <Select
                          value={editTimeSlotData.status}
                          onValueChange={(value) =>
                            handleEditTimeSlotChange("status", value)
                          }
                          disabled={loading}
                        >
                          <SelectTrigger id="edit-slot-status">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="available">Available</SelectItem>
                            <SelectItem value="booked">Booked</SelectItem>
                            <SelectItem value="unavailable">
                              Unavailable
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-slot-start">Start Time</Label>
                        <Input
                          id="edit-slot-start"
                          type="time"
                          value={editTimeSlotData.startTime}
                          onChange={(e) =>
                            handleEditTimeSlotChange(
                              "startTime",
                              e.target.value
                            )
                          }
                          disabled={loading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-slot-end">End Time</Label>
                        <Input
                          id="edit-slot-end"
                          type="time"
                          value={editTimeSlotData.endTime}
                          onChange={(e) =>
                            handleEditTimeSlotChange("endTime", e.target.value)
                          }
                          disabled={loading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-slot-price">
                          Standard Price ($)
                        </Label>
                        <Input
                          id="edit-slot-price"
                          type="number"
                          value={editTimeSlotData.price}
                          onChange={(e) =>
                            handleEditTimeSlotChange("price", e.target.value)
                          }
                          placeholder="e.g. 80"
                          disabled={loading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-slot-discounted">
                          Discounted Price ($)
                        </Label>
                        <Input
                          id="edit-slot-discounted"
                          type="number"
                          value={editTimeSlotData.discountedPrice}
                          onChange={(e) =>
                            handleEditTimeSlotChange(
                              "discountedPrice",
                              e.target.value
                            )
                          }
                          placeholder="e.g. 65"
                          disabled={loading}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end mt-4 space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowEditTimeSlot(false);
                          setEditTimeSlotData(null);
                        }}
                        disabled={loading}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleEditTimeSlot}
                        className="bg-green-600 hover:bg-green-700"
                        disabled={loading}
                      >
                        {loading ? "Updating..." : "Update Time Slot"}
                        {loading && (
                          <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          {/* Amenities & Services Tab */}
          <TabsContent value="amenities" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-xl">
                      Amenities & Services
                    </CardTitle>
                    <CardDescription>
                      {amenities === null || amenities.length === 0
                        ? "Add your first amenity below."
                        : "Manage the additional amenities and services offered at your facility"}
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => setShowAddAmenity(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={loading}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Amenity
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {amenities === null ? (
                  <div className="text-center py-10">
                    <p className="text-gray-500">
                      Loading amenities... or no amenities available yet.
                    </p>
                  </div>
                ) : amenities.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-gray-500">
                      No amenities added yet. Click the button above to add your
                      first amenity.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {amenities.map((amenity) => (
                          <TableRow key={amenity.id}>
                            <TableCell className="font-medium">
                              {amenity.name}
                            </TableCell>
                            <TableCell>{amenity.description}</TableCell>
                            <TableCell>
                              <Switch
                                checked={amenity.status}
                                onCheckedChange={(e) =>
                                  handleAmenityToggle(amenity.id, e as any)
                                }
                                disabled={loading}
                              />
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setEditAmenityData({ ...amenity });
                                    setShowEditAmenity(true);
                                  }}
                                  disabled={loading}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={(e) =>
                                    handleDeleteAmenity(amenity.id, e)
                                  }
                                  disabled={loading}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  {loading && (
                                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                                  )}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {showAddAmenity && (
                      <div className="mt-6 border rounded-lg p-4">
                        <h3 className="text-lg font-medium mb-4">
                          Add New Amenity
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="amenity-name">Amenity Name</Label>
                            <Input
                              id="amenity-name"
                              value={newAmenity.name}
                              onChange={(e) =>
                                handleAmenityChange("name", e.target.value)
                              }
                              placeholder="e.g. Parking"
                              disabled={loading}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="amenity-description">
                              Description
                            </Label>
                            <Textarea
                              id="amenity-description"
                              value={newAmenity.description}
                              onChange={(e) =>
                                handleAmenityChange(
                                  "description",
                                  e.target.value
                                )
                              }
                              placeholder="e.g. Free parking for 50 vehicles"
                              disabled={loading}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="amenity-status">Status</Label>
                            <Switch
                              id="amenity-status"
                              checked={newAmenity.status}
                              onCheckedChange={(checked) =>
                                handleAmenityChange("status", checked)
                              }
                              disabled={loading}
                            />
                          </div>
                        </div>
                        <div className="flex justify-end mt-4 space-x-2">
                          <Button
                            variant="outline"
                            onClick={() => setShowAddAmenity(false)}
                            disabled={loading}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleAddAmenity}
                            className="bg-green-600 hover:bg-green-700"
                            disabled={loading}
                          >
                            {loading ? "Adding..." : "Add Amenity"}
                            {loading && (
                              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                    {showEditAmenity && editAmenityData && (
                      <div className="mt-6 border rounded-lg p-4">
                        <h3 className="text-lg font-medium mb-4">
                          Edit Amenity
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="edit-amenity-name">
                              Amenity Name
                            </Label>
                            <Input
                              id="edit-amenity-name"
                              value={editAmenityData.name}
                              onChange={(e) =>
                                handleEditAmenityChange("name", e.target.value)
                              }
                              placeholder="e.g. Parking"
                              disabled={loading}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-amenity-description">
                              Description
                            </Label>
                            <Textarea
                              id="edit-amenity-description"
                              value={editAmenityData.description}
                              onChange={(e) =>
                                handleEditAmenityChange(
                                  "description",
                                  e.target.value
                                )
                              }
                              placeholder="e.g. Free parking for 50 vehicles"
                              disabled={loading}
                            />{" "}
                          </div>{" "}
                          <div className="space-y-2">
                            {" "}
                            <Label htmlFor="edit-amenity-status">
                              Status
                            </Label>{" "}
                            <Switch
                              id="edit-amenity-status"
                              checked={editAmenityData.status}
                              onCheckedChange={(checked) =>
                                handleEditAmenityChange("status", checked)
                              }
                              disabled={loading}
                            />{" "}
                          </div>{" "}
                        </div>{" "}
                        <div className="flex justify-end mt-4 space-x-2">
                          {" "}
                          <Button
                            variant="outline"
                            onClick={() => {
                              setShowEditAmenity(false);
                              setEditAmenityData(null);
                            }}
                            disabled={loading}
                          >
                            {" "}
                            Cancel{" "}
                          </Button>{" "}
                          <Button
                            onClick={handleEditAmenity}
                            className="bg-green-600 hover:bg-green-700"
                            disabled={loading}
                          >
                            {" "}
                            {loading ? "Updating..." : "Update Amenity"}{" "}
                            {loading && (
                              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                            )}{" "}
                          </Button>{" "}
                        </div>{" "}
                      </div>
                    )}{" "}
                  </div>
                )}{" "}
              </CardContent>{" "}
              <CardFooter className="border-t pt-6">
                {" "}
                <div className="flex justify-between w-full">
                  {" "}
                  <Button variant="outline" disabled={loading}>
                    {" "}
                    Reset Changes{" "}
                  </Button>{" "}
                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    disabled={
                      amenities === null || amenities.length === 0 || loading
                    }
                  >
                    {" "}
                    <Save className="mr-2 h-4 w-4" />{" "}
                    {loading ? "Saving..." : "Save Amenities & Services"}{" "}
                    {loading && (
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    )}{" "}
                  </Button>{" "}
                </div>{" "}
              </CardFooter>{" "}
            </Card>{" "}
          </TabsContent>{" "}
        </Tabs>{" "}
      </div>{" "}
    </PageLayout>
  );
};
export default FutsalInformationPage;
