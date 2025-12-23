import { useNavigate } from "react-router-dom";

export default function CreateTaskForm() {
    const navigate = useNavigate();

    return (
        <button
            onClick={() => navigate("/app/v1/tasks/new")}
            className="btn-add-task"
        >
            <span>Add Task</span>
            <span className="shortcut-key">C</span>
        </button>
    );
}
