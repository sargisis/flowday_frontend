import { useNavigate } from "react-router-dom";

export default function CreateTaskForm() {
    const navigate = useNavigate();

    return (
        <button
            onClick={() => navigate("/app/v1/tasks/new")}
            className="btn"
            style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.9rem"
            }}
        >
            <span style={{ fontSize: "1.2rem" }}>+</span> Add Task
        </button>
    );
}
