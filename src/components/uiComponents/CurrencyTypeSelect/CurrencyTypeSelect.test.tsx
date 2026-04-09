import { render, screen, fireEvent } from "@testing-library/react";
import { CurrencyTypeSelect } from "./index";

const mockOnChange = jest.fn();

describe("CurrencyTypeSelect", () => {
  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it("renders with dollar sign selected by default", () => {
    render(<CurrencyTypeSelect value="$" onChange={mockOnChange} />);

    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select).toBeTruthy();
    expect(select.value).toBe("$");
  });

  it("renders with percentage sign when selected", () => {
    render(<CurrencyTypeSelect value="%" onChange={mockOnChange} />);

    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select).toBeTruthy();
    expect(select.value).toBe("%");
  });

  it("calls onChange when selection changes to percentage", () => {
    render(<CurrencyTypeSelect value="$" onChange={mockOnChange} />);

    const select = screen.getByRole("combobox") as HTMLSelectElement;
    fireEvent.change(select, { target: { value: "%" } });

    expect(mockOnChange).toHaveBeenCalledWith("%");
  });

  it("calls onChange when selection changes to dollar", () => {
    render(<CurrencyTypeSelect value="%" onChange={mockOnChange} />);

    const select = screen.getByRole("combobox") as HTMLSelectElement;
    fireEvent.change(select, { target: { value: "$" } });

    expect(mockOnChange).toHaveBeenCalledWith("$");
  });

  it("has both $ and % options available", () => {
    render(<CurrencyTypeSelect value="$" onChange={mockOnChange} />);

    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select.querySelector('option[value="$"]')).toBeTruthy();
    expect(select.querySelector('option[value="%"]')).toBeTruthy();
  });
});
