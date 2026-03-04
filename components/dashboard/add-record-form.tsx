"use client"

import { useState } from "react"
import { useSWRConfig } from "swr"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, CheckCircle } from "lucide-react"

export function AddRecordForm() {
  const { mutate } = useSWRConfig()
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    item_code: "",
    production_line: "",
    produced_quantity: "",
    reject_quantity: "",
  })
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus(null)
    setIsSubmitting(true)

    try {
      const res = await fetch("/api/add-record", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          produced_quantity: Number(formData.produced_quantity),
          reject_quantity: Number(formData.reject_quantity),
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setStatus({ type: "success", message: `Record added successfully (ID: ${data.id})` })
        setFormData({
          date: new Date().toISOString().split("T")[0],
          item_code: "",
          production_line: "",
          produced_quantity: "",
          reject_quantity: "",
        })
        // Revalidate all dashboard data
        mutate("/api/dashboard-summary")
        mutate("/api/reject-trend")
        mutate("/api/pareto-analysis")
        mutate("/api/control-chart")
        mutate("/api/items-status")
      } else {
        setStatus({
          type: "error",
          message: data.error || "Failed to add record",
        })
      }
    } catch {
      setStatus({ type: "error", message: "Network error. Please try again." })
    }

    setIsSubmitting(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Plus className="h-4 w-4" />
          Add Production Record
        </CardTitle>
        <CardDescription>Enter a new production entry (Admin only)</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData((p) => ({ ...p, date: e.target.value }))}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="item_code">Item Code</Label>
            <Input
              id="item_code"
              value={formData.item_code}
              onChange={(e) => setFormData((p) => ({ ...p, item_code: e.target.value }))}
              placeholder="e.g. ITEM-A01"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="production_line">Production Line</Label>
            <Input
              id="production_line"
              value={formData.production_line}
              onChange={(e) => setFormData((p) => ({ ...p, production_line: e.target.value }))}
              placeholder="e.g. LINE-1"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="produced_quantity">Produced Qty</Label>
            <Input
              id="produced_quantity"
              type="number"
              min="1"
              value={formData.produced_quantity}
              onChange={(e) => setFormData((p) => ({ ...p, produced_quantity: e.target.value }))}
              placeholder="e.g. 1200"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="reject_quantity">Reject Qty</Label>
            <Input
              id="reject_quantity"
              type="number"
              min="0"
              value={formData.reject_quantity}
              onChange={(e) => setFormData((p) => ({ ...p, reject_quantity: e.target.value }))}
              placeholder="e.g. 45"
              required
            />
          </div>
          <div className="flex items-end">
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Adding..." : "Add Record"}
            </Button>
          </div>
          {status && (
            <div
              className={`col-span-full flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                status.type === "success"
                  ? "border-status-normal/30 bg-status-normal/10 text-status-normal"
                  : "border-status-critical/30 bg-status-critical/10 text-status-critical"
              }`}
              role="status"
            >
              {status.type === "success" && <CheckCircle className="h-4 w-4" />}
              {status.message}
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
