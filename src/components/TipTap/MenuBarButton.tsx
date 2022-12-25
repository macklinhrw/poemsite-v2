import { twMerge } from "tailwind-merge";

interface ButtonProps extends React.ComponentPropsWithoutRef<"button"> {
  active?: boolean;
  icon: React.ReactElement;
}

const MenuBarButton: React.FC<ButtonProps> = ({
  className,
  active = false,
  onClick,
  disabled,
  icon,
  ...props
}) => {
  return (
    <button
      className={twMerge(
        "bg-pink-600 p-2 hover:bg-pink-700",
        className,
        active && "bg-pink-400",
        disabled && "hover:bg-foreground bg-gray-700 hover:cursor-default"
      )}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onClick) onClick(e);
      }}
      {...props}
    >
      {icon}
    </button>
  );
};

export default MenuBarButton;
