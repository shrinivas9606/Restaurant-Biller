"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { PlusCircle, MoreHorizontal } from 'lucide-react';
import { addMenuItem, updateMenuItem, deleteMenuItem } from './actions';
import { toast } from "@/components/ui/use-toast";   // ✅ fixed import

// Define the type for a menu item based on your database schema.
type MenuItem = {
  id: string;
  name: string;
  price: number;
  category: string;
  available: boolean;
  created_at: string;
  restaurant_id: string;
};

// A reusable form component for adding or editing a menu item.
function MenuItemForm({
  onSubmit,
  initialData,
  onClose,
}: {
  onSubmit: (formData: FormData) => Promise<{ error?: string; success?: string; }>;
  initialData?: MenuItem;
  onClose: () => void;
}) {

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    if(initialData) {
        formData.append('id', initialData.id);
    }
    const result = await onSubmit(formData);
    if (result?.error) {
      toast({ title: "Error", description: result.error, variant: 'destructive' });
    } else if (result?.success) {
      toast({ title: "Success", description: result.success});
      onClose(); // Close the dialog on success
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="name" className="text-right">Name</Label>
        <Input id="name" name="name" defaultValue={initialData?.name} className="col-span-3" required />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="price" className="text-right">Price</Label>
        <Input id="price" name="price" type="number" step="0.01" defaultValue={initialData?.price} className="col-span-3" required />
      </div>
       <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="category" className="text-right">Category</Label>
        <Input id="category" name="category" defaultValue={initialData?.category} className="col-span-3" required />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="available" className="text-right">Available</Label>
        <Switch id="available" name="available" defaultChecked={initialData?.available ?? true} />
      </div>
      <DialogFooter>
        <DialogClose asChild>
            <Button type="button" variant="secondary">Cancel</Button>
        </DialogClose>
        <Button type="submit">Save changes</Button>
      </DialogFooter>
    </form>
  );
}


// The main client component that renders the menu table and handles state.
export function MenuClientComponent({ menuItems }: { menuItems: MenuItem[] }) {
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | undefined>(undefined);

  const handleEditClick = (item: MenuItem) => {
    setSelectedMenuItem(item);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = async (id: string) => {
      if(confirm('Are you sure you want to delete this item?')) {
        const result = await deleteMenuItem(id);
        if (result?.error) {
            toast({ title: "Error", description: result.error, variant: 'destructive' });
        } else if (result?.success) {
            toast({ title: "Success", description: result.success});
        }
      }
  };

  return (
    <>
      <div className="flex items-center">
        <div className="ml-auto flex items-center gap-2">
            <Dialog open={isAddDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="h-8 gap-1">
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Add Menu Item
                </span>
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                <DialogTitle>Add New Menu Item</DialogTitle>
                </DialogHeader>
                <MenuItemForm onSubmit={addMenuItem} onClose={() => setAddDialogOpen(false)} />
            </DialogContent>
            </Dialog>
        </div>
      </div>
      
      {/* Menu Items Table */}
      <div className="border shadow-sm rounded-lg mt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Available</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {menuItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>${item.price.toFixed(2)}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${item.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {item.available ? 'Yes' : 'No'}
                  </span>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onSelect={() => handleEditClick(item)}>Edit</DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => handleDeleteClick(item.id)}>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

       {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogContent>
                <DialogHeader>
                <DialogTitle>Edit Menu Item</DialogTitle>
                </DialogHeader>
                <MenuItemForm 
                    onSubmit={updateMenuItem} 
                    initialData={selectedMenuItem}
                    onClose={() => setEditDialogOpen(false)}
                />
            </DialogContent>
        </Dialog>
    </>
  );
}
