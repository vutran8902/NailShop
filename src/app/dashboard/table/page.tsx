"use client";

    import { Button } from "@/components/ui/button";
    import { ChevronLeft, ChevronRight } from 'lucide-react';

    export default function TablePage() {
      return (
        <div className="container mx-auto p-4">
          <h1 className="text-2xl font-bold mb-4">Tables</h1>
          
          {/* Navigation */}
          <div className="flex justify-between items-center mb-4">
            <Button variant="outline" size="sm">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <div className="text-lg font-medium">Table Overview</div>
            <Button variant="outline" size="sm">
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          
          {/* Table Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5].map((table) => (
              <div key={table} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="text-lg font-medium mb-2">Table {table}</div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">Status: Available</div>
                  <div className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">Available</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }
