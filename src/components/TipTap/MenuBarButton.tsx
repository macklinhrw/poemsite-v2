import { twMerge } from "tailwind-merge";

interface ButtonProps extends React.ComponentPropsWithoutRef<"button"> {
  active?: boolean;
  icon: React.ReactElement;
  title?: string;
}

const MenuBarButton: React.FC<ButtonProps> = ({
  className,
  active = false,
  onClick,
  disabled,
  icon,
  title,
  ...props
}) => {
  return (
    <button
      className={twMerge(
        "rounded-lg border-2 p-4 shadow-md transition-all duration-200 hover:shadow-lg",
        "border-gray-400 bg-white text-gray-800 hover:border-blue-500 hover:bg-blue-50",
        "disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-gray-200 disabled:text-gray-400 disabled:opacity-50",
        className,
        active && "border-blue-600 bg-blue-500 text-white hover:bg-blue-600",
        disabled && "hover:border-gray-300 hover:bg-gray-200"
      )}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onClick) onClick(e);
      }}
      title={title}
      {...props}
    >
      <div
        className={twMerge(
          "flex items-center justify-center",
          active ? "text-white" : "text-gray-700",
          disabled && "text-gray-400"
        )}
      >
        {icon}
      </div>
    </button>
  );
};

export default MenuBarButton;
