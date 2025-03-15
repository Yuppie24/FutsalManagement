import { Building2, Eye, ImageUp, Loader2, Lock, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "../../lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import DeleteImage from "/deleteImage.svg";
import UserProfileImage from "/svg/user-profile.svg";
import useAuthStore from "../../store/authStore";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import clsx from "clsx";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  useRemoveAvatar,
  useUserUpdate,
} from "../../services/mutations/userMutation";
import { IRemoveUserAvatarData, IUpdatedUserData } from "../../types/authTypes";
import { useUserStore } from "../../store/userStore";
import PhoneInput from "react-phone-number-input";
import { handleLogout, ILogoutResponse } from "../../services/api/auth";

export default function UserIcon() {
  const { userData, setLoggedInUserData } = useUserStore();
  const logout = useAuthStore((state) => state.logout);
  const [avatarFile, setAvatarFile] = useState<File | undefined>();
  const [loading, setLoading] = useState<boolean>(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [updatedName, setUpdatedName] = useState<string | undefined>();
  const [updatePhone, setUpdatePhone] = useState<string | undefined>();

  useEffect(() => {
    setUpdatedName(userData?.name || "Admin");
    setUpdatePhone(userData?.phone || "+9779812345678");
  }, []);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { mutateAsync } = useUserUpdate();
  const removeAvatar = useRemoveAvatar();
  const navigate = useNavigate();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    setLoading(true);
    e.preventDefault();
    const formData = new FormData();

    if (avatarFile) {
      formData.append("avatar", avatarFile);
    }

    if (updatedName) {
      formData.append("name", updatedName);
    }

    if (updatePhone) {
      formData.append("phone", updatePhone);
    }

    try {
      const data: IUpdatedUserData = await mutateAsync({ formData });

      if (data.status === "success") {
        toast.success("Your details have been updated successfully");
        setLoggedInUserData(data.data.user);
        setIsDialogOpen(false);
        setLoading(false);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  }

  async function logoutSubmit() {
    try {
      const data: ILogoutResponse = await handleLogout();
      if (data.status === "success") {
        toast.success("You are logged out!");
        logout();
        navigate("/auth");
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  }
  return (
    <div className="flex items-center justify-center gap-2">
      <div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex justify-center items-center gap-2">
              <Avatar className="rounded-xl select-none cursor-pointer">
                <AvatarImage
                  src={
                    userData.avatar
                      ? userData.avatar
                      : UserProfileImage
                  }
                  className="border rounded-full object-cover object-top"
                  alt="User Avatar"
                />
                <AvatarFallback>
                  <div className="border h-full w-full rounded-full "></div>
                </AvatarFallback>
              </Avatar>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48" align="end">
            <DropdownMenuGroup>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger
                  onClick={(event) => event.stopPropagation()}
                  asChild
                >
                  <div
                    className={cn(
                      "relative flex select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors cursor-pointer  data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                    )}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    <span>Edit Details</span>
                  </div>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[650px]">
                  <DialogHeader>
                    <div className="flex gap-4 items-center">
                      <div className="flex h-[48px] w-[48px] p-[12px] border rounded-[10px] justify-center items-center">
                        <Building2 />
                      </div>
                      <div>
                        <DialogTitle className="hidden">
                          Edit details
                        </DialogTitle>
                        <div className="text-[18px] leading-5 text-secondary-foreground font-[500]">
                          Edit Details
                        </div>
                        <div className="font-[400] text-[14px] text-gray-500">
                          Edit and Save Your Details
                        </div>
                      </div>
                    </div>
                  </DialogHeader>
                  <hr />
                  <form onSubmit={onSubmit}>
                    <div className="grid gap-4 py-4">
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="image">Image</Label>
                        <div className="h-auto flex justify-between items-center border px-[14px] py-[10px] rounded-[8px]">
                          <div className="flex items-center justify-start gap-2">
                            {avatarPreview === null && (
                              <img
                                className="h-[40px] w-[40px] rounded-full object-cover object-top bg-white border"
                                src={
                                  userData.avatar !== undefined
                                    ? userData.avatar
                                    : UserProfileImage
                                }
                                alt="image of the user"
                              />
                            )}
                            {avatarPreview && (
                              <img
                                src={avatarPreview}
                                alt="Avatar Preview"
                                className="h-[40px] w-[40px] rounded-full object-cover object-top bg-white border"
                              />
                            )}
                            <div className="font-[500] text-[16px]">
                              {userData.name || "Admin"}
                            </div>
                          </div>
                          <div className="flex icons justify-center items-center gap-2">
                            <Label htmlFor="userImage">
                              <ImageUp className="cursor-pointer" />
                            </Label>
                            <div>
                              <Input
                                type="file"
                                id="userImage"
                                name="avatar"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    setAvatarPreview(URL.createObjectURL(file));
                                  }
                                  setAvatarFile(e.target.files?.[0]);
                                }}
                              />
                            </div>

                            <img
                              src={DeleteImage}
                              alt="delete image"
                              className="h-[24px] w-[24px] cursor-pointer"
                              onClick={async () => {
                                const data: IRemoveUserAvatarData =
                                  await removeAvatar.mutateAsync();
                                if (data.status === "success") {
                                  toast.success(
                                    "Your avatar has been removed successfully"
                                  );
                                  setIsDialogOpen(false);
                                  setLoggedInUserData(data.user);
                                  setAvatarPreview(null);
                                  setAvatarFile(undefined);
                                }
                              }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="name">Name</Label>
                        <div>
                          <Input
                            name="name"
                            defaultValue= {userData.name || "Admin"}
                            id="name"
                            value={updatedName}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>
                            ) => {
                              const target = e.target as HTMLInputElement;
                              setUpdatedName(target.value);
                            }}
                            className="h-[45px]"
                          />
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <PhoneInput
                          international
                          placeholder="Enter phone number"
                          value={updatePhone}
                          onChange={setUpdatePhone}
                          defaultCountry="US"
                          inputClassName="bg-transparent text-white border border-gray-700"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="email">Role</Label>
                        <Input
                          defaultValue= {userData.role}
                          type="text"
                          className="h-[45px] text-gray-500 select-none cursor-not-allowed"
                          readOnly
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          defaultValue= {userData.email}
                          type="email"
                          placeholder="Email"
                          className="h-[45px] text-gray-500 select-none cursor-not-allowed"
                          readOnly
                        />
                      </div>
                    </div>

                    <hr />
                    <DialogFooter>
                      <div className="flex justify-between w-full gap-2 mt-4">
                        <DialogClose asChild>
                          <Button
                            className="w-[50%]"
                            variant={"outline"}
                            size={"lg"}
                          >
                            Cancel
                          </Button>
                        </DialogClose>

                        <Button
                          disabled={loading}
                          className={clsx("w-[50%]", {
                            "cursor-not-allowed": loading,
                          })}
                          size={"lg"}
                        >
                          {loading ? (
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          ) : (
                            <span>Update & Save</span>
                          )}
                        </Button>
                      </div>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <div>
                <Link
                  className={cn(
                    "relative flex select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors cursor-pointer  data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                  )}
                  to="/auth/change-password" // need to create change password page...
                >
                  <Lock className="mr-2 h-4 w-4" />
                  <span>Change Password</span>
                </Link>
              </div>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <Button
                disabled={loading}
                className={cn(
                  "relative flex select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors cursor-pointer  data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full border-none justify-start"
                )}
                variant={"outline"}
                onClick={() => {
                  logoutSubmit();
                  setLoading(true);
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
                {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              </Button>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
