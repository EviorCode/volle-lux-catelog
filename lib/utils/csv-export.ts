/**
 * CSV Export Utility
 * Helper functions for converting data to CSV format
 */

/**
 * Escape and quote a CSV field value
 */
function escapeCSVField(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  const str = String(value);

  // If the field contains comma, quote, or newline, wrap it in quotes
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    // Escape quotes by doubling them
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

/**
 * Convert array of objects to CSV string
 */
export function arrayToCSV<T extends Record<string, unknown>>(
  data: T[],
  columns: { key: keyof T; header: string }[]
): string {
  if (data.length === 0) {
    return columns.map((col) => col.header).join(",");
  }

  // Create header row
  const headerRow = columns.map((col) => escapeCSVField(col.header)).join(",");

  // Create data rows
  const dataRows = data.map((row) => {
    return columns
      .map((col) => {
        const value = row[col.key];
        return escapeCSVField(value);
      })
      .join(",");
  });

  // Combine header and data rows
  return [headerRow, ...dataRows].join("\n");
}

/**
 * Download CSV file from string
 */
export function downloadCSV(csvString: string, filename: string): void {
  // Create blob with CSV data
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });

  // Create download link
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  // Trigger download
  document.body.appendChild(link);
  link.click();

  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Convert order data to CSV format
 */
export interface OrderCSVRow {
  "Order Number": string;
  Date: string;
  Customer: string;
  Email: string;
  Status: string;
  "Total Amount": string;
  "Payment Status": string;
  Items: string;
  "Shipping Address": string;
  "Tracking Number": string;
}

// Type for order data that accepts both camelCase and snake_case formats
interface OrderDataForCSV {
  orderNumber?: string;
  order_number?: string;
  createdAt?: Date | string;
  created_at?: Date | string;
  customerName?: string;
  customer_name?: string;
  email?: string;
  status?: string;
  totalAmount?: number | string;
  total_amount?: number | string;
  payment_status?: string;
  trackingNumber?: string;
  tracking_number?: string;
  items?: Array<{
    product?: { name?: string };
    quantity?: number;
  }>;
  shipping_address?: {
    address_line_1?: string;
    city?: string;
    state?: string;
    postal_code?: string;
  };
}

export function formatOrderForCSV(order: OrderDataForCSV): OrderCSVRow {
  // Format items as a summary
  const itemsSummary =
    order.items
      ?.map(
        (item) => `${item.product?.name || "Product"} (x${item.quantity || 0})`
      )
      .join("; ") || "";

  // Format shipping address
  const shippingAddress = order.shipping_address
    ? `${order.shipping_address.address_line_1 || ""}, ${order.shipping_address.city || ""}, ${order.shipping_address.state || ""} ${order.shipping_address.postal_code || ""}`
    : "";

  return {
    "Order Number": order.orderNumber || order.order_number || "",
    Date: order.createdAt
      ? new Date(order.createdAt).toLocaleDateString()
      : order.created_at
        ? new Date(order.created_at).toLocaleDateString()
        : "",
    Customer: order.customerName || order.customer_name || "",
    Email: order.email || "",
    Status: order.status || "",
    "Total Amount": String(order.totalAmount || order.total_amount || ""),
    "Payment Status": order.payment_status || "paid",
    Items: itemsSummary,
    "Shipping Address": shippingAddress,
    "Tracking Number": order.trackingNumber || order.tracking_number || "",
  };
}
