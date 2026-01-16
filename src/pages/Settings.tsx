import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, LogOut, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export default function Settings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { logout } = useAuth();
  const [copiedSessionId, setCopiedSessionId] = useState(false);

  // Get session token from localStorage
  const sessionToken = localStorage.getItem("auth_token") || "";
  const sessionId = sessionToken.slice(0, 20) + "...";

  const handleCopyToken = () => {
    if (sessionToken) {
      navigator.clipboard.writeText(sessionToken);
      setCopiedSessionId(true);
      toast({
        title: "Copied",
        description: "Session token copied to clipboard",
      });
      setTimeout(() => setCopiedSessionId(false), 2000);
    }
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
    navigate("/auth");
  };

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
          <h1 className="text-lg font-semibold">Settings</h1>
        </div>
      </div>

      <div className="container max-w-2xl py-8">
        <div className="grid gap-6">
          {/* Session Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Session Information</CardTitle>
              <CardDescription>
                View and manage your current session
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Session Token
                </label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-2 bg-muted rounded text-xs font-mono truncate">
                    {sessionId}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyToken}
                    className="gap-2"
                  >
                    {copiedSessionId ? (
                      <>
                        <Check className="h-4 w-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
              <CardDescription>
                Manage your account access
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded bg-destructive/5">
                <div>
                  <p className="font-medium text-sm">Logout</p>
                  <p className="text-xs text-muted-foreground">
                    Sign out of your current session
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleLogout}
                  className="gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Application Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Application Info</CardTitle>
              <CardDescription>
                Current application details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Application:</span>
                <span className="font-medium">RoadVisionAI</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Version:</span>
                <span className="font-medium">2.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Environment:</span>
                <span className="font-medium">Production</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Updated:</span>
                <span className="font-medium">December 6, 2025</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
