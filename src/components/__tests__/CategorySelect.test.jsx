import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CategorySelect from "../CategorySelect";

describe("CategorySelect", () => {
  it("disables the select when disabled=true", () => {
    render(
      <CategorySelect
        categories={["electronics"]}
        value="all"
        disabled
        onChange={() => {}}
      />,
    );

    expect(screen.getByRole("combobox")).toBeDisabled();
  });

  it("renders every provided category as an option", () => {
    render(
      <CategorySelect
        categories={["electronics", "jewelery"]}
        value="all"
        onChange={() => {}}
      />,
    );

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
    const handleChange = jest.fn();
    const user = userEvent.setup();

    render(
      <CategorySelect
        categories={["electronics", "jewelery"]}
        value="all"
        onChange={handleChange}
      />,
    );

    await user.selectOptions(screen.getByRole("combobox"), "jewelery");

    expect(handleChange).toHaveBeenCalledWith("jewelery");
  });
});
