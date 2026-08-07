export const ALL_CATEGORIES = 'all';

// Categories are derived from the products already loaded from Firestore, so
// this list still isn't hard coded — add a product in a new category and the
// option appears on its own.
export default function CategorySelect({ categories, value, onChange, disabled }) {
  return (
    <div className="category-select">
      <label htmlFor="category" className="eyebrow">
        Browse by section
      </label>

      <select
        id="category"
        className="select"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
      >
        <option value={ALL_CATEGORIES}>Everything</option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
    </div>
  );
}
