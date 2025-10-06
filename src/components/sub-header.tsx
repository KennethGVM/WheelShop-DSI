import { useNavigate } from "react-router-dom";
import { BackIcon } from "@/icons/icons";
import Button from "@/components/form/button";
import StatusTags from "@/components/status-tags";
import { twMerge } from "tailwind-merge";

interface SubHeaderProps {
  title?: string;
  backUrl: string;
  isShowButtons?: boolean;
  status?: boolean;
  children?: React.ReactNode;
  secondChildren?: React.ReactNode;
  className?: string;
}

export default function SubHeader({ className, title, backUrl, isShowButtons = false, status = true, children, secondChildren }: SubHeaderProps) {
  const navigate = useNavigate();
  return (
    <header className={twMerge("flex items-center justify-between", className)}>
      <div className="flex space-x-2 md:px-0 pl-3 items-center">
        <Button styleButton="simple" onClick={() => navigate(backUrl)} className="hover:bg-[#d4d4d4] p-1.5 rounded-md">
          <BackIcon className="md:size-4 size-5 fill-secondary/80 stroke-none" />
        </Button>
        <div className="flex items-center space-x-2">
          <h2 className="text-[20px] font-semibold text-primary/80">{title}</h2>
          {isShowButtons && !secondChildren ? (
            <StatusTags text={status ? "Activo" : "Inactivo"} status={status} className="text-xs" />
          ) : (
            secondChildren
          )}
        </div>
      </div>
      {children}
    </header >
  );
}
