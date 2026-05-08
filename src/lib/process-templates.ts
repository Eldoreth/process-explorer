export type ProcessTemplate = {
  id: string;
  name: string;
  activities: string[];
  resources: string[];
};

export const PROCESS_TEMPLATES: ProcessTemplate[] = [
  {
    id: "o2c",
    name: "Order to Cash",
    activities: [
      "Create Order",
      "Credit Check",
      "Approve Order",
      "Pick Items",
      "Ship Goods",
      "Issue Invoice",
      "Receive Payment",
    ],
    resources: ["Sales", "Finance", "Warehouse", "Logistics", "AR Clerk"],
  },
  {
    id: "p2p",
    name: "Procure to Pay",
    activities: [
      "Create Requisition",
      "Approve Requisition",
      "Create PO",
      "Send PO",
      "Receive Goods",
      "Match Invoice",
      "Pay Supplier",
    ],
    resources: ["Buyer", "Manager", "Receiver", "AP Clerk", "Treasury"],
  },
  {
    id: "ap",
    name: "Accounts Payable",
    activities: [
      "Receive Invoice",
      "Scan Invoice",
      "Validate Invoice",
      "Match PO",
      "Approve Payment",
      "Schedule Payment",
      "Pay Invoice",
    ],
    resources: ["AP Clerk", "Manager", "Treasury", "Auditor"],
  },
];
