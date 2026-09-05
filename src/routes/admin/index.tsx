import { createFileRoute } from "@tanstack/react-router";
import AdminPanel from "@/pages/AdminPanel";
import ProtectedRoute from "@/components/ProtectedRoute";

export const Route = createFileRoute("/admin/")({
  component: () => (
    <ProtectedRoute>
      <AdminPanel />
    </ProtectedRoute>
  ),
});
