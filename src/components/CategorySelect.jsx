import { useCategories, ALL_CATEGORIES } from '../hooks/useCatalog';

export default function CategorySelect({ value, onChange }) {
  const { data: categories, isPending, isError } = useCategories();

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
        disabled={isPending || isError}
      >
        {/* Only this first option is written by hand — everything below it
            comes straight from the categories endpoint. */}
        <option value={ALL_CATEGORIES}>
          {isPending ? 'Loading sections…' : 'Everything'}
        </option>
        {categories?.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>

      {isError && (
        <p className="field-note">Sections couldn&apos;t load. Reload to try again.</p>
      )}
    </div>
  );
}
