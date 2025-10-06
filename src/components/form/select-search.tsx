import SelectSearch, { SingleValue, StylesConfig } from 'react-select';
import { COLORS } from '../../constants/constants';

interface CategoryOption {
  label: string;
  value: string;
}

interface Props {
  value: CategoryOption[];
  name?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
}

export default function SearchSelect({ value, name, placeholder, onChange }: Props) {
  const customStyles: StylesConfig<CategoryOption, false> = {
    option: (provided) => ({
      ...provided,
      fontWeight: '500',
    }),
    singleValue: (provided) => ({
      ...provided,
      color: COLORS.primary,
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "#25252580",
      fontWeight: '500',
      fontSize: '13px'
    }),
  };

  function handleChange(e: SingleValue<CategoryOption>) {
    if (!onChange) return;
    onChange(e?.value ?? '');
  }

  return (
    <div className='mt-2'>
      {name && <label htmlFor='category' className="block mb-2 text-2xs font-medium text-secondary/80">{name}</label>}
      <SelectSearch
        className='text-sm font-medium'
        styles={customStyles}
        placeholder={placeholder}
        id='category'
        options={value}
        menuPlacement="auto"
        menuPosition='fixed'
        onChange={handleChange}
      />
    </div>
  )
}
