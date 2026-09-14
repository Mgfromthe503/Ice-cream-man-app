export const REQUEST_STATUSES = ["waiting", "accepted", "in_transit", "arrived", "completed", "cancelled"] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number];

const customerTransitions: Partial<Record<RequestStatus, readonly RequestStatus[]>> = {
  waiting: ["cancelled"],
  accepted: ["cancelled"],
};

const driverTransitions: Partial<Record<RequestStatus, readonly RequestStatus[]>> = {
  waiting: ["accepted"],
  accepted: ["in_transit", "cancelled"],
  in_transit: ["arrived", "cancelled"],
  arrived: ["completed", "cancelled"],
};

export const mayCustomerTransition = (from: RequestStatus, to: RequestStatus) =>
  customerTransitions[from]?.includes(to) ?? false;

export const mayDriverTransition = (from: RequestStatus, to: RequestStatus) =>
  driverTransitions[from]?.includes(to) ?? false;

export const statusLabel = (status: RequestStatus) =>
  status
    .toLowerCase()
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
