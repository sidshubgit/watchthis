"use client";

import Link from "next/link";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { HardDrives } from "@phosphor-icons/react";

export default function NotFound() {
  return (
    <div className="py-12">
      <EmptyState
        icon={<HardDrives size={28} />}
        title="Page Not Found"
        description="The operational view or entity ID you navigated to could not be found."
        action={
          <Link href="/">
            <Button variant="primary" size="sm">
              Return to Command Center
            </Button>
          </Link>
        }
      />
    </div>
  );
}
