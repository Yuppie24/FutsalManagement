// src/pages/SuccessHandler.tsx
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "sonner";

const TOKEN = `Token ${Cookies.get("accessToken")}`;
const baseUrl = import.meta.env.VITE_API_BASE_URL;
const SuccessHandler = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const data = searchParams.get("data");

  useEffect(() => {
    const handleSuccess = async () => {
      if (!data) {
        toast.error("No data provided in the callback");
        navigate(`/`);
        return;
      }
      
      try {
        const response = await axios.get(
          `${baseUrl}/bookings/esewa/success/?data=${data}`,
          {
            headers: {
              Authorization: TOKEN,
            },
          }
        );
        const [facilityId, slotId, bookingId] = response.data.redirect_url.split("/");

        if (response.data.status === "success" && response.data.redirect_url) {
          navigate(`/success/${facilityId}/${slotId}/${bookingId}`);
        } else {
          toast.error(response.data.message || "Payment processing failed");
          navigate(`/failure/${facilityId}/${slotId}/${bookingId}`);
        }
      } catch (error) {
        console.error("Error handling success callback:", error);
        toast.error("An error occurred while processing the payment");
        navigate("/failure/1/1");
      }
    };

    handleSuccess();
  }, [data, navigate]);

  return <div className="text-center p-6">Processing payment... Please wait.</div>;
};

export default SuccessHandler;