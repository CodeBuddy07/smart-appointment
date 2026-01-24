import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, UserPlus } from 'lucide-react';

interface EmptyStaffStateProps {
  onAddStaff: () => void;
}

export function EmptyStaffState({ onAddStaff }: EmptyStaffStateProps) {
  return (
    <Card>
      <CardContent className="py-12 text-center">
        <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h4 className="font-medium text-lg mb-2">No Staff Members</h4>
        <p className="text-muted-foreground mb-6">
          Start by adding your first staff member to manage appointments
        </p>
        <Button
          onClick={onAddStaff}
          className="gap-2"
        >
          <UserPlus className="h-4 w-4" />
          Add First Staff Member
        </Button>
      </CardContent>
    </Card>
  );
}