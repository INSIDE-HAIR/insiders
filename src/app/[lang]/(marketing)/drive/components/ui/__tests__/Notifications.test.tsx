import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { toast } from "sonner";
import {
  Notifications,
  useNotifications,
  NotificationType,
} from "../Notifications";
import { renderHook } from "@testing-library/react";

// Mock the sonner toast functions
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn().mockReturnValue("success-id"),
    error: vi.fn().mockReturnValue("error-id"),
    loading: vi.fn().mockReturnValue("loading-id"),
    dismiss: vi.fn(),
    update: vi.fn(),
  },
  Toaster: () => <div data-testid="sonner-toaster" />,
}));

describe("Notifications Component", () => {
  const mockNotifications = [
    {
      id: "1",
      type: "success" as NotificationType,
      message: "Test success message",
    },
    {
      id: "2",
      type: "error" as NotificationType,
      message: "Test error message",
    },
  ];

  it("renders notifications correctly", () => {
    render(
      <Notifications notifications={mockNotifications} onDismiss={vi.fn()} />
    );

    expect(screen.getByText("Test success message")).toBeInTheDocument();
    expect(screen.getByText("Test error message")).toBeInTheDocument();
  });

  it("applies correct styles based on notification type", () => {
    render(
      <Notifications notifications={mockNotifications} onDismiss={vi.fn()} />
    );

    const successMessage = screen.getByText("Test success message");
    const errorMessage = screen.getByText("Test error message");

    expect(successMessage).toHaveClass("text-green-800");
    expect(errorMessage).toHaveClass("text-red-800");
  });

  it("calls onDismiss when close button is clicked", () => {
    const onDismiss = vi.fn();
    render(
      <Notifications notifications={mockNotifications} onDismiss={onDismiss} />
    );

    const closeButtons = screen.getAllByRole("button");
    fireEvent.click(closeButtons[0]);

    expect(onDismiss).toHaveBeenCalledWith("1");
  });

  it("renders the Toaster component", () => {
    render(<Notifications />);
    expect(screen.getByTestId("sonner-toaster")).toBeInTheDocument();
  });
});

describe("useNotifications Hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls toast.success for success notifications", () => {
    const { result } = renderHook(() => useNotifications());
    result.current.addNotification("success", "Test success message");
    expect(toast.success).toHaveBeenCalledWith("Test success message");
  });

  it("calls toast.error for error notifications", () => {
    const { result } = renderHook(() => useNotifications());
    result.current.addNotification("error", "Test error message");
    expect(toast.error).toHaveBeenCalledWith("Test error message");
  });

  it("calls toast.loading for loading notifications", () => {
    const { result } = renderHook(() => useNotifications());
    result.current.addNotification("loading", "Test loading message");
    expect(toast.loading).toHaveBeenCalledWith("Test loading message");
  });

  it("calls toast.dismiss when dismissing a notification", () => {
    const { result } = renderHook(() => useNotifications());
    const id = "test-id";
    result.current.dismissNotification(id);
    expect(toast.dismiss).toHaveBeenCalledWith(id);
  });

  it("calls toast.update when updating a notification", () => {
    const { result } = renderHook(() => useNotifications());
    const id = "test-id";
    result.current.updateNotification(id, "success", "Updated message");
    expect(toast.dismiss).toHaveBeenCalledWith(id);
    expect(toast.success).toHaveBeenCalledWith("Updated message");
  });
});
