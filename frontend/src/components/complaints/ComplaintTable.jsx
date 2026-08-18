import {
    Eye,
    Pencil,
    UserCog,
    Trash2,
    RefreshCcw,
} from "lucide-react";

import Badge from "../ui/Badge";
import Button from "../ui/Button";
import Table from "../ui/Table";

const ComplaintTable = ({
    complaints,
    onView,
    onEdit,
    onAssign,
    onStatus,
    onDelete,
}) => {
    const getPriorityVariant = (priority) => {
        switch (priority) {
            case "Critical":
                return "danger";

            case "High":
                return "warning";

            case "Medium":
                return "info";

            case "Low":
                return "success";

            default:
                return "default";
        }
    };

    const getStatusVariant = (status) => {
        switch (status) {
            case "Open":
                return "default";

            case "Assigned":
                return "info";

            case "In Progress":
                return "warning";

            case "Resolved":
                return "success";

            case "Closed":
                return "secondary";

            default:
                return "default";
        }
    };

    const columns = [
        {
            key: "ticket",
            header: "Ticket",
            render: (row) => (
                <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-100">
                        {row.ticket}
                    </p>

                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        {row.createdAt}
                    </p>
                </div>
            ),
        },

        {
            key: "title",
            header: "Complaint",
            render: (row) => (
                <div>
                    <p className="font-medium">
                        {row.title}
                    </p>

                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        {row.category}
                    </p>
                </div>
            ),
        },

        {
            key: "resident",
            header: "Resident",
            render: (row) => (
                <div>
                    <p className="font-medium">
                        {row.resident}
                    </p>

                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        {row.flat}
                    </p>
                </div>
            ),
        },

        {
            key: "priority",
            header: "Priority",
            render: (row) => (
                <Badge
                    variant={getPriorityVariant(row.priority)}
                >
                    {row.priority}
                </Badge>
            ),
        },

        {
            key: "status",
            header: "Status",
            render: (row) => (
                <Badge
                    variant={getStatusVariant(row.status)}
                >
                    {row.status}
                </Badge>
            ),
        },

        {
            key: "assignedTo",
            header: "Assigned Staff",
        },

        {
            key: "actions",
            header: "Actions",
            render: (row) => (
                <div className="flex gap-2">
                    {typeof onView === "function" && (
                        <Button variant="ghost" size="sm" onClick={() => onView(row)}>
                            <Eye size={16} />
                        </Button>
                    )}
                    {typeof onEdit === "function" && (
                        <Button variant="ghost" size="sm" onClick={() => onEdit(row)}>
                            <Pencil size={16} />
                        </Button>
                    )}
                    {typeof onAssign === "function" && (
                        <Button variant="ghost" size="sm" onClick={() => onAssign(row)}>
                            <UserCog size={16} />
                        </Button>
                    )}
                    {typeof onStatus === "function" && (
                        <Button variant="ghost" size="sm" onClick={() => onStatus(row)}>
                            <RefreshCcw size={16} />
                        </Button>
                    )}
                    {typeof onDelete === "function" && (
                        <Button variant="ghost" size="sm" onClick={() => onDelete(row)}>
                            <Trash2 size={16} />
                        </Button>
                    )}
                </div>
            ),
        },
    ];

    return (
        <Table
            columns={columns}
            data={complaints}
            emptyMessage="No complaints found."
        />
    );
};

export default ComplaintTable;