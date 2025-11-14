import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-16 max-w-2xl">
      <h1 className="font-headline text-4xl md:text-5xl font-bold mb-12">My Profile</h1>
      <Card>
        <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your account details here.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" defaultValue="Aisha Patel" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" defaultValue="a.patel@example.com" />
            </div>
            <div className="pt-2">
              <Button>Save Changes</Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
