import Icon from "components/AppIcon";

const DetailItem = ({ label, value, icon }) => (
  <div className="flex items-center col-span-2 sm:col-span-1">
    {icon && <Icon name={icon} size={16} className="mr-2 text-primary-500" />}
    <span className="flex-shrink-0 w-20 font-medium text-text-secondary">
      {label}:
    </span>
    <span className="ml-2 font-semibold truncate text-text-primary">
      {value}
    </span>
  </div>
);

export default DetailItem;
