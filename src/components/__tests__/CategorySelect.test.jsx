import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CategorySelect from "../CategorySelect";

const { useCategoriesMock } = vi.hoisted(() => ({
  useCategoriesMock: vi.fn(),
}));

// CategorySelect pulls its options from Firestore via useCatalog. Mocking the
// hook keeps this a focused unit test of CategorySelect's own rendering and
// interaction logic, independent of the network/Firebase.
vi.mock("../../hooks/useCatalog", () => ({
  ALL_CATEGORIES: "all",
  useCategories: () => useCategoriesMock(),
}));

describe("CategorySelect", () => {
  it("shows a loading state while categories are pending", () => {
    useCategoriesMock.mockReturnValue({
      data: undefined,
      isPending: true,
      isError: false,
    });

    render(<CategorySelect value="all" onChange={() => {}} />);

    expect(screen.getByRole("combobox")).toBeDisabled();
    expect(screen.getByText("Loading sections…")).toBeInTheDocument();
  });

  it("renders every loaded category as an option", () => {
    useCategoriesMock.mockReturnValue({
      data: ["electronics", "jewelery"],
      isPending: false,
      isError: false,
    });

    render(<CategorySelect value="all" onChange={() => {}} />);

    expect(
      screen.getByRole("option", { name: "Everything" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "electronics" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "jewelery" }),
    ).toBeInTheDocument();
  });

  it("calls onChange with the selected category when the user picks one", async () => {
    useCategoriesMock.mockReturnValue({
      data: ["electronics", "jewelery"],
      isPending: false,
      isError: false,
    });
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<CategorySelect value="all" onChange={handleChange} />);

    await user.selectOptions(screen.getByRole("combobox"), "jewelery");

    expect(handleChange).toHaveBeenCalledWith("jewelery");
  });

  it("shows an error message when categories fail to load", () => {
    useCategoriesMock.mockReturnValue({
      data: undefined,
      isPending: false,
      isError: true,
    });

    render(<CategorySelect value="all" onChange={() => {}} />);

    expect(
      screen.getByText("Sections couldn't load. Reload to try again."),
    ).toBeInTheDocument();
  });
});
