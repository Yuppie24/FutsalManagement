import { AxiosResponse } from "axios";
import axiosInstance from "./axiosInstance";
import Cookies from "js-cookie";

export const updateUser = async ({ formData }: { formData: FormData }) => {
  try {
    const response: AxiosResponse = await axiosInstance("/auth/update/", {
      method: "PATCH",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Token ${Cookies.get("accessToken")}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error in updateUser function:", error);
    throw error;
  }
};

export const removeAvatar = async () => {
  try {
    const response: AxiosResponse = await axiosInstance("/auth/avatar/", {
      method: "DELETE",
      headers: {
        Authorization: `Token ${Cookies.get("accessToken")}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error in removeAvatar function:", error);
    throw error;
  }
};
