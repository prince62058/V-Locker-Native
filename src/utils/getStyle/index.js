// src/utils/getStyle/index.js

import { COLORS } from "../../constants";

export const getStatusStyle = (status) => {
    if (!status) return { backgroundColor: COLORS.border };

    switch (status?.toLowerCase()) {
        case "approved":
        case "active":
            return { backgroundColor: "#22C55E" }; // green
        case "pending":
        case "PENDING":
            return { backgroundColor: "#e1a307ff" }; // yellow
        case "rejected":
            return { backgroundColor: "#EF4444" }; // red
        case "closed":
            return { backgroundColor: "#9CA3AF" }; // gray
        case "locked device":
            return { backgroundColor: "#EF4444" }; // red
        case "no active devices":
            return { backgroundColor: "#F59E0B" }; // orange
        case "upcoming emis":
            return { backgroundColor: "#3B82F6" }; // blue
        default:
            return { backgroundColor: COLORS.border };
    }
};
