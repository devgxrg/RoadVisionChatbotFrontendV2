import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import { API_BASE_URL } from "@/lib/config/api";

interface UserProfileData {
  id?: string;
  email?: string;
  full_name?: string;
  employee_id?: string;
  mobile_number?: string;
  department?: string;
  designation?: string;
  created_at?: string;
  updated_at?: string;
  last_login?: string;
}

export default function Profile() {
  const navigate = useNavigate();
  const token = useSelector((state: RootState) => state.auth.token);
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!token) {
        setError("No authentication token found");
        setIsLoading(false);
        return;
      }

      try {
        // Fetch from /auth/users/me endpoint to get actual user data from database
        const response = await fetch(`${API_BASE_URL}/auth/users/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setProfile({
            id: userData.id || "N/A",
            email: userData.email || "N/A",
            full_name: userData.full_name || "N/A",
            employee_id: userData.employee_id || "N/A",
            mobile_number: userData.mobile_number || "N/A",
            department: userData.department || "N/A",
            designation: userData.designation || "N/A",
            created_at: userData.created_at,
            updated_at: userData.updated_at,
            last_login: userData.last_login,
          });
          setError(null);
        } else {
          throw new Error(`Failed to fetch profile: ${response.status}`);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError(err instanceof Error ? err.message : "Failed to load profile");
        setProfile(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [token]);

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 border-b bg-card">
        <div className="flex h-14 items-center gap-4 px-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-lg font-semibold">My Profile</h1>
        </div>
      </div>

      <div className="container max-w-2xl py-8">
        <div className="grid gap-6">
          {/* Profile Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Your account details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoading ? (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">Loading profile...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-sm text-red-500">{error}</p>
                </div>
              ) : profile ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Full Name */}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">
                      Full Name
                    </label>
                    <div className="p-2 text-sm">{profile.full_name || "N/A"}</div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">
                      Email Address
                    </label>
                    <div className="p-2 text-sm">{profile.email || "N/A"}</div>
                  </div>

                  {/* Employee ID */}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">
                      Employee ID
                    </label>
                    <div className="p-2 text-sm">{profile.employee_id || "N/A"}</div>
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">
                      Mobile Number
                    </label>
                    <div className="p-2 text-sm">{profile.mobile_number || "N/A"}</div>
                  </div>

                  {/* Department */}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">
                      Department
                    </label>
                    <div className="p-2 text-sm">{profile.department || "N/A"}</div>
                  </div>

                  {/* Designation */}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">
                      Designation
                    </label>
                    <div className="p-2 text-sm">{profile.designation || "N/A"}</div>
                  </div>

                  {/* Account Created */}
                  {profile.created_at && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">
                        Account Created
                      </label>
                      <div className="p-2 text-sm">
                        {new Date(profile.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  )}

                  {/* Last Updated */}
                  {profile.updated_at && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">
                        Last Updated
                      </label>
                      <div className="p-2 text-sm">
                        {new Date(profile.updated_at).toLocaleDateString()}
                      </div>
                    </div>
                  )}

                  {/* Last Login */}
                  {profile.last_login && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">
                        Last Login
                      </label>
                      <div className="p-2 text-sm">
                        {new Date(profile.last_login).toLocaleDateString()}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
